import { RevokeMintAuthorityResponse } from '@app/ss-common-domain/mint/dto/spl.dtos';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import * as base58 from 'bs58';
import {
  AuthorityType,
  createBurnCheckedInstruction,
  createSetAuthorityInstruction,
  getMint,
} from '@solana/spl-token';
import { Injectable, Logger } from '@nestjs/common';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import {
  RevokeFreezeAuthorityRequest,
  RevokeFreezeAuthorityResponse,
  RevokeMetadataUpdateRequest,
  RevokeMetadataUpdateResponse,
  RevokeMintAuthorityRequest,
  RevokeUpdateAuthorityRequest,
  RevokeUpdateAuthorityResponse,
} from './spl.manage.dto';
import {
  createUpdateMetadataAccountV2Instruction,
  DataV2,
  Metadata,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  UpdateMetadataAccountV2InstructionAccounts,
  UpdateMetadataAccountV2InstructionArgs,
} from '@metaplex-foundation/mpl-token-metadata';

@Injectable()
export class SplManageService {
  private logger: Logger = new Logger();
  private connection = new Connection(process.env.RPC_ENDPOINT);

  constructor(private readonly solsUtils: SolsUtils) {}

  public async revokeMintAuthority(
    revokeMintAuthorityRequest: RevokeMintAuthorityRequest,
  ): Promise<RevokeMintAuthorityResponse> {
    try {
      // Input validation
      if (
        !revokeMintAuthorityRequest.mintPubKey ||
        !revokeMintAuthorityRequest.currentMintAuthPubKey
      ) {
        throw new Error(
          'Missing required parameters: mintPubKey or currentMintAuthPubKey',
        );
      }

      // Create public keys
      const mintTokenPublicKey = new PublicKey(
        revokeMintAuthorityRequest.mintPubKey,
      );

      const currentAuthorityPublicKey = new PublicKey(
        revokeMintAuthorityRequest.currentMintAuthPubKey,
      );

      // Get current mint authority info to verify
      const mintInfo = await getMint(this.connection, mintTokenPublicKey);

      console.log('mintInfo');
      console.log(mintInfo);

      // Verify the provided authority matches the actual mint authority
      if (!mintInfo.mintAuthority?.equals(currentAuthorityPublicKey)) {
        throw new Error(
          'Provided mint authority does not match the actual mint authority',
        );
      }

      if (!revokeMintAuthorityRequest.currentMintAuthPrivKey) {
        throw new Error(
          'Current mint authority private key is required for signing',
        );
      }

      // Create the current authority keypair
      const currentAuthority = Keypair.fromSecretKey(
        base58.decode(revokeMintAuthorityRequest.currentMintAuthPrivKey),
      );

      // Get latest blockhash with commitment
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash('finalized');

      // Create the set authority instruction
      const setAuthority = createSetAuthorityInstruction(
        mintTokenPublicKey, // mint account
        currentAuthorityPublicKey, // current authority
        AuthorityType.MintTokens, // authority type
        null, // new authority (null to revoke)
      );

      // Create and setup transaction
      const transaction = new Transaction();
      transaction.add(setAuthority);
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = currentAuthority.publicKey;
      transaction.sign(currentAuthority);

      this.logger.debug('Transaction created and signed by current authority');

      // Send transaction with retries
      const maxRetries = 5;
      let currentTry = 0;
      let send: string;

      while (currentTry < maxRetries) {
        try {
          send = await this.connection.sendTransaction(
            transaction,
            [currentAuthority],
            {
              skipPreflight: false,
              preflightCommitment: 'finalized',
              maxRetries: 3,
            },
          );

          this.logger.debug(`Transaction sent with signature: ${send}`);

          // Wait for confirmation with timeout
          const confirmation = await this.connection.confirmTransaction(
            {
              signature: send,
              blockhash: blockhash,
              lastValidBlockHeight: lastValidBlockHeight,
            },
            'finalized',
          );

          if (!confirmation?.value?.err) {
            const response: RevokeMintAuthorityResponse = {
              transactionSignature: send,
            };

            this.logger.log(
              `Mint Authority Revoked for ${revokeMintAuthorityRequest.mintPubKey}`,
            );

            return response;
          }

          break; // If we get here without error, break the retry loop
        } catch (error) {
          currentTry++;
          if (currentTry === maxRetries) {
            throw new Error(
              `Failed after ${maxRetries} attempts: ${error.message}`,
            );
          }

          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * currentTry),
          );

          // Get new blockhash for retry
          const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
            await this.connection.getLatestBlockhash('finalized');
          transaction.recentBlockhash = newBlockhash;

          this.logger.debug(
            `Retrying transaction (attempt ${currentTry + 1}/${maxRetries})`,
          );
        }
      }

      throw new Error('Transaction failed after all retry attempts');
    } catch (error) {
      this.logger.error(`Failed to revoke mint authority: ${error.message}`);
      throw error;
    }
  }

  public async revokeFreezeAuthority(
    revokeFreezeAuthorityRequest: RevokeFreezeAuthorityRequest,
  ): Promise<RevokeFreezeAuthorityResponse> {
    try {
      // Input validation
      if (
        !revokeFreezeAuthorityRequest.mintPubKey ||
        !revokeFreezeAuthorityRequest.currentFreezeAuthPubKey
      ) {
        throw new Error(
          'Missing required parameters: mintPubKey or currentFreezeAuthPubKey',
        );
      }

      // Create public keys
      const mintTokenPublicKey = new PublicKey(
        revokeFreezeAuthorityRequest.mintPubKey,
      );

      const currentAuthorityPublicKey = new PublicKey(
        revokeFreezeAuthorityRequest.currentFreezeAuthPubKey,
      );

      // Get current freeze authority info to verify
      const mintInfo = await getMint(this.connection, mintTokenPublicKey);

      console.log('mintInfo');
      console.log(mintInfo);

      // Verify the provided authority matches the actual freeze authority
      if (!mintInfo.freezeAuthority?.equals(currentAuthorityPublicKey)) {
        throw new Error(
          'Provided freeze authority does not match the actual freeze authority',
        );
      }

      if (!revokeFreezeAuthorityRequest.currentFreezeAuthPrivKey) {
        throw new Error(
          'Current freeze authority private key is required for signing',
        );
      }

      // Create the current authority keypair
      const currentAuthority = Keypair.fromSecretKey(
        base58.decode(revokeFreezeAuthorityRequest.currentFreezeAuthPrivKey),
      );

      // Get latest blockhash with commitment
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash('finalized');

      // Create the set authority instruction
      const setAuthority = createSetAuthorityInstruction(
        mintTokenPublicKey, // mint account
        currentAuthorityPublicKey, // current authority
        AuthorityType.FreezeAccount, // authority type
        null, // new authority (null to revoke)
      );

      // Create and setup transaction
      const transaction = new Transaction();
      transaction.add(setAuthority);
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = currentAuthority.publicKey;
      transaction.sign(currentAuthority);

      this.logger.debug('Transaction created and signed by current authority');

      // Send transaction with retries
      const maxRetries = 5;
      let currentTry = 0;
      let send: string;

      while (currentTry < maxRetries) {
        try {
          send = await this.connection.sendTransaction(
            transaction,
            [currentAuthority],
            {
              skipPreflight: false,
              preflightCommitment: 'finalized',
              maxRetries: 3,
            },
          );

          this.logger.debug(`Transaction sent with signature: ${send}`);

          // Wait for confirmation with timeout
          const confirmation = await this.connection.confirmTransaction(
            {
              signature: send,
              blockhash: blockhash,
              lastValidBlockHeight: lastValidBlockHeight,
            },
            'finalized',
          );

          if (!confirmation?.value?.err) {
            const response: RevokeFreezeAuthorityResponse = {
              transactionSignature: send,
            };

            this.logger.log(
              `Freeze Authority Revoked for ${revokeFreezeAuthorityRequest.mintPubKey}`,
            );

            return response;
          }

          break; // If we get here without error, break the retry loop
        } catch (error) {
          currentTry++;
          if (currentTry === maxRetries) {
            throw new Error(
              `Failed after ${maxRetries} attempts: ${error.message}`,
            );
          }

          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * currentTry),
          );

          // Get new blockhash for retry
          const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
            await this.connection.getLatestBlockhash('finalized');
          transaction.recentBlockhash = newBlockhash;

          this.logger.debug(
            `Retrying transaction (attempt ${currentTry + 1}/${maxRetries})`,
          );
        }
      }

      throw new Error('Transaction failed after all retry attempts');
    } catch (error) {
      this.logger.error(`Failed to revoke freeze authority: ${error.message}`);
      throw error;
    }
  }

  public async revokeUpdateAuthority(
    revokeUpdateAuthorityRequest: RevokeUpdateAuthorityRequest,
  ): Promise<RevokeUpdateAuthorityResponse> {
    try {
      // Input validation
      if (
        !revokeUpdateAuthorityRequest.mintPubKey ||
        !revokeUpdateAuthorityRequest.currentUpdateAuthPubKey ||
        !revokeUpdateAuthorityRequest.feePayerPrivKey // Add fee payer validation
      ) {
        throw new Error(
          'Missing required parameters: mintPubKey, currentUpdateAuthPubKey, or feePayerPrivKey',
        );
      }

      // Create public keys
      const mintTokenPublicKey = new PublicKey(
        revokeUpdateAuthorityRequest.mintPubKey,
      );

      const currentAuthorityPublicKey = new PublicKey(
        revokeUpdateAuthorityRequest.currentUpdateAuthPubKey,
      );

      // Create fee payer keypair
      const feePayer = Keypair.fromSecretKey(
        base58.decode(revokeUpdateAuthorityRequest.feePayerPrivKey),
      );

      // Get metadata PDA
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintTokenPublicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      );

      // Get metadata account info
      const metadataAccount =
        await this.connection.getAccountInfo(metadataAddress);
      if (!metadataAccount) {
        throw new Error('Metadata account not found');
      }

      // Decode metadata
      const metadata = Metadata.deserialize(metadataAccount.data)[0];

      this.logger.debug('Metadata found:', {
        updateAuthority: metadata.updateAuthority.toBase58(),
        currentAuthority: currentAuthorityPublicKey.toBase58(),
      });

      // Verify the provided authority matches the actual update authority
      if (!metadata.updateAuthority.equals(currentAuthorityPublicKey)) {
        throw new Error(
          'Provided update authority does not match the actual update authority',
        );
      }

      if (!revokeUpdateAuthorityRequest.currentUpdateAuthPrivKey) {
        throw new Error(
          'Current update authority private key is required for signing',
        );
      }

      // Create the current authority keypair
      const currentAuthority = Keypair.fromSecretKey(
        base58.decode(revokeUpdateAuthorityRequest.currentUpdateAuthPrivKey),
      );

      // Create instruction to remove update authority
      const updateMetadataAccount: UpdateMetadataAccountV2InstructionAccounts =
        {
          metadata: metadataAddress,
          updateAuthority: currentAuthorityPublicKey,
        };

      // Format the data exactly as it appears in the current metadata
      const dataV2 = {
        name: metadata.data.name,
        symbol: metadata.data.symbol,
        uri: metadata.data.uri,
        sellerFeeBasisPoints: metadata.data.sellerFeeBasisPoints,
        creators: metadata.data.creators || null,
        collection: metadata.collection || null,
        uses: metadata.uses || null,
      };

      // Create update args maintaining exact state except for update authority
      const updateMetadataArgs: UpdateMetadataAccountV2InstructionArgs = {
        updateMetadataAccountArgsV2: {
          data: dataV2,
          updateAuthority: undefined, // try undefined instead
          primarySaleHappened: false,
          isMutable: false,
        },
      };

      this.logger.debug(
        'Update metadata args:',
        JSON.stringify(updateMetadataArgs, null, 2),
      );

      const removeUpdateAuthorityIx = createUpdateMetadataAccountV2Instruction(
        updateMetadataAccount,
        updateMetadataArgs,
      );

      // Create and setup transaction
      const transaction = new Transaction();
      transaction.add(removeUpdateAuthorityIx);

      // Get latest blockhash with commitment
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash('confirmed');

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = feePayer.publicKey; // Use dedicated fee payer

      // Sign with both fee payer and update authority
      transaction.sign(feePayer, currentAuthority);

      this.logger.debug(
        'Transaction created and signed by fee payer and current authority',
      );

      // Send transaction with retries
      const maxRetries = 5;
      let currentTry = 0;
      let send: string;

      while (currentTry < maxRetries) {
        try {
          send = await this.connection.sendTransaction(
            transaction,
            [feePayer, currentAuthority], // Include both signers
            {
              skipPreflight: false,
              preflightCommitment: 'confirmed',
              maxRetries: 3,
            },
          );

          this.logger.debug(`Transaction sent with signature: ${send}`);

          // Wait for confirmation with timeout
          const confirmation = await this.connection.confirmTransaction(
            {
              signature: send,
              blockhash: blockhash,
              lastValidBlockHeight: lastValidBlockHeight,
            },
            'confirmed',
          );

          if (!confirmation?.value?.err) {
            const response: RevokeUpdateAuthorityResponse = {
              transactionSignature: send,
            };

            this.logger.log(
              `Update Authority Revoked for ${revokeUpdateAuthorityRequest.mintPubKey}`,
            );

            return response;
          }

          break; // If we get here without error, break the retry loop
        } catch (error) {
          currentTry++;
          if (currentTry === maxRetries) {
            throw new Error(
              `Failed after ${maxRetries} attempts: ${error.message}`,
            );
          }

          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * currentTry),
          );

          // Get new blockhash for retry
          const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
            await this.connection.getLatestBlockhash('confirmed');
          transaction.recentBlockhash = newBlockhash;

          this.logger.debug(
            `Retrying transaction (attempt ${currentTry + 1}/${maxRetries})`,
          );
        }
      }

      throw new Error('Transaction failed after all retry attempts');
    } catch (error) {
      this.logger.error(`Failed to revoke update authority: ${error.message}`);
      throw error;
    }
  }

  public async burnRaydiumLPToken(
    lpMint: string,
    lpTokenAccount: string,
    amountToBurn: number,
  ) {
    const burnAmmountLamports = Math.round(amountToBurn * 1e9);
    const lpMintPubKey = new PublicKey(lpMint);
    const lpTokenAccountPubKey = new PublicKey(lpTokenAccount);

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();

    const wallet = Keypair.fromSecretKey(
      base58.decode(
        //'5PWamhnis6W7oNFtnfQGsnP5JFE7ptKJr3dLbPXFpECEAuyyHkZjLMGgWngWU3mugUL7CtczrSc61rZXPXRuxi1x',
        '3q2YxLx4ZD1kUW9PqdFDPCWtPyB3hrqVCbAEioJydh8PbwYjC4ULnbdvzjrkCc56EGQqPUvkZymAnHRgGy58qS8X',
      ),
    );

    console.log(wallet.publicKey.toBase58());

    const burnInstruction = createBurnCheckedInstruction(
      lpTokenAccountPubKey,
      lpMintPubKey,
      wallet.publicKey,
      burnAmmountLamports,
      9,
    );

    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.add(burnInstruction);
    transaction.feePayer = wallet.publicKey;

    const signature = await this.connection.sendTransaction(transaction, [
      wallet,
    ]);

    console.log('Transaction signature: ', signature);

    const confirmationStrategy = {
      signature,
      blockhash,
      lastValidBlockHeight,
    };

    await this.connection.confirmTransaction(confirmationStrategy, 'processed');
    return signature;
  }

  public async revokeMetadataUpdateAuthority(
    revokeMetadataUpdateRequest: RevokeMetadataUpdateRequest,
  ): Promise<RevokeMetadataUpdateResponse> {
    try {
      // Input validation
      if (
        !revokeMetadataUpdateRequest.mintPubKey ||
        !revokeMetadataUpdateRequest.currentUpdateAuthPubKey
      ) {
        throw new Error(
          'Missing required parameters: mintPubKey or currentUpdateAuthPubKey',
        );
      }

      // Create public keys
      const mintTokenPublicKey = new PublicKey(
        revokeMetadataUpdateRequest.mintPubKey,
      );

      const currentAuthorityPublicKey = new PublicKey(
        revokeMetadataUpdateRequest.currentUpdateAuthPubKey,
      );

      // Derive metadata account address
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintTokenPublicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      );

      // Get current metadata account info
      const metadataAccount =
        await this.connection.getAccountInfo(metadataAddress);
      if (!metadataAccount) {
        throw new Error('Metadata account not found');
      }

      // Deserialize the metadata account
      const currentMetadata = Metadata.deserialize(metadataAccount.data)[0];

      console.log('Current Metadata:', currentMetadata);

      // Verify current update authority
      if (
        currentMetadata.updateAuthority.toBase58() !==
        currentAuthorityPublicKey.toBase58()
      ) {
        throw new Error(
          'Provided update authority does not match current metadata update authority',
        );
      }

      if (!revokeMetadataUpdateRequest.currentUpdateAuthPrivKey) {
        throw new Error(
          'Current update authority private key is required for signing',
        );
      }

      // Create the current authority keypair
      const currentAuthority = Keypair.fromSecretKey(
        base58.decode(revokeMetadataUpdateRequest.currentUpdateAuthPrivKey),
      );

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash('finalized');

      // Prepare the data for the update
      const dataV2: DataV2 = {
        name: currentMetadata.data.name,
        symbol: currentMetadata.data.symbol,
        uri: currentMetadata.data.uri,
        sellerFeeBasisPoints: currentMetadata.data.sellerFeeBasisPoints,
        creators: currentMetadata.data.creators,
        collection: currentMetadata.collection,
        uses: currentMetadata.uses,
      };

      // Create the instruction to update metadata
      const updateMetadataInstruction =
        createUpdateMetadataAccountV2Instruction(
          {
            metadata: metadataAddress,
            updateAuthority: currentAuthorityPublicKey,
          },
          {
            updateMetadataAccountArgsV2: {
              data: dataV2,
              updateAuthority: null, // Setting to null revokes the authority
              primarySaleHappened: currentMetadata.primarySaleHappened,
              isMutable: currentMetadata.isMutable,
            },
          },
        );

      // Create and setup transaction
      const transaction = new Transaction();
      transaction.add(updateMetadataInstruction);
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = currentAuthority.publicKey;
      transaction.sign(currentAuthority);

      this.logger.debug('Transaction created and signed by current authority');

      // Send transaction with retries
      const maxRetries = 5;
      let currentTry = 0;
      let send: string;

      while (currentTry < maxRetries) {
        try {
          send = await this.connection.sendTransaction(
            transaction,
            [currentAuthority],
            {
              skipPreflight: false,
              preflightCommitment: 'finalized',
              maxRetries: 3,
            },
          );

          this.logger.debug(`Transaction sent with signature: ${send}`);

          // Wait for confirmation
          const confirmation = await this.connection.confirmTransaction(
            {
              signature: send,
              blockhash: blockhash,
              lastValidBlockHeight: lastValidBlockHeight,
            },
            'finalized',
          );

          if (!confirmation?.value?.err) {
            const response: RevokeMetadataUpdateResponse = {
              transactionSignature: send,
            };

            this.logger.log(
              `Metadata Update Authority Revoked for ${revokeMetadataUpdateRequest.mintPubKey}`,
            );

            return response;
          }

          break;
        } catch (error) {
          currentTry++;
          if (currentTry === maxRetries) {
            throw new Error(
              `Failed after ${maxRetries} attempts: ${error.message}`,
            );
          }

          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * currentTry),
          );

          // Get new blockhash for retry
          const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
            await this.connection.getLatestBlockhash('finalized');
          transaction.recentBlockhash = newBlockhash;

          this.logger.debug(
            `Retrying transaction (attempt ${currentTry + 1}/${maxRetries})`,
          );
        }
      }

      throw new Error('Transaction failed after all retry attempts');
    } catch (error) {
      this.logger.error(
        `Failed to revoke metadata update authority: ${error.message}`,
      );
      throw error;
    }
  }

  // Interface definitions
}
