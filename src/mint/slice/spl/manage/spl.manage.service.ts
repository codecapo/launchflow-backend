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
  BurnTokenRequest,
  RevokeFreezeAuthorityRequest,
  RevokeFreezeAuthorityResponse,
  RevokeMintAuthorityRequest,
  RevokeUpdateAuthorityRequest,
  RevokeUpdateAuthorityResponse,
} from './spl.manage.dto';
import {
  createUpdateMetadataAccountV2Instruction,
  DataV2,
  Metadata,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
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
        !revokeUpdateAuthorityRequest.currentUpdateAuthPubKey
      ) {
        throw new Error(
          'Missing required parameters: mintPubKey or currentUpdateAuthPubKey',
        );
      }

      // Create public keys
      const mintTokenPublicKey = new PublicKey(
        revokeUpdateAuthorityRequest.mintPubKey,
      );

      const currentAuthorityPublicKey = new PublicKey(
        revokeUpdateAuthorityRequest.currentUpdateAuthPubKey,
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

      console.log('metadata');
      console.log(metadata);

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

      // Get latest blockhash with commitment
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash('finalized');

      // Convert metadata.data to DataV2 format
      const dataV2: DataV2 = {
        ...metadata.data,
        collection: metadata.collection || null,
        uses: metadata.uses || null,
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
              updateAuthority: null, // Set to null to revoke
              primarySaleHappened: metadata.primarySaleHappened,
              isMutable: metadata.isMutable,
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
            await this.connection.getLatestBlockhash('finalized');
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

  public async burnToken(burnTokenRequest: BurnTokenRequest) {
    const tokenAccountPublicKey = new PublicKey(
      burnTokenRequest.tokenAccountPubkey,
    );
    const mintTokenPublicKey = new PublicKey(burnTokenRequest.mintPubKey);
    const mintAuthority = new PublicKey(burnTokenRequest.mintAuthPubKey);
    const num = BigInt(burnTokenRequest.burnAmount) * BigInt(1_000_000_000);

    const burn = createBurnCheckedInstruction(
      tokenAccountPublicKey,
      mintTokenPublicKey,
      mintAuthority,
      num,
      9,
    );

    const transaction = new Transaction().add(burn);

    this.logger.log(
      `Burning ${burnTokenRequest.burnAmount} Tokens for ${burnTokenRequest.tokenAccountPubkey}`,
    );

    return base58.encode(
      transaction.serialize({ requireAllSignatures: false }),
    );
  }
}
