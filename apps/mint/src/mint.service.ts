import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
  Signer,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token';
import { NonceAccount } from '@solana/web3.js';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';
import * as base58 from 'bs58';
import { Logger } from '@nestjs/common';
import { CreateMetadataService } from '@app/solana/metadata/create.metadata.service';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import { CreateMintTokenRequest } from './mint.dto';
import { MintRepo } from './mint.repo';
import { MintedToken } from './mint.schema';
import { MetadataPinResponse } from '@app/solana/metadata/metadata.service';

export class MintService {
  private readonly logger: Logger = new Logger(MintService.name);
  constructor(
    private readonly connection: Connection,
    private readonly createMetadataService: CreateMetadataService,
    private readonly solsUtils: SolsUtils,
    private readonly mintRepo: MintRepo,
  ) {}

  private async setupWalletsAndSigners() {
    const chosenBackendDevWallet = await this.solsUtils.walletRandomiser();
    const backendWallet = Keypair.fromSecretKey(
      base58.decode(chosenBackendDevWallet.privKey),
    );

    const mint = Keypair.generate();
    const authority = Keypair.generate();
    const nonceAccountAuth = Keypair.fromSecretKey(
      base58.decode(process.env.NONCE_ACCOUNT_AUTH_PRIV_KEY),
    );

    return {
      backendWallet,
      mint,
      authority,
      nonceAccountAuth,
      signers: {
        nonceAccountAuth: {
          publicKey: nonceAccountAuth.publicKey,
          secretKey: nonceAccountAuth.secretKey,
        },
        backendDevWallet: {
          publicKey: backendWallet.publicKey,
          secretKey: backendWallet.secretKey,
        },
        mint: {
          publicKey: mint.publicKey,
          secretKey: mint.secretKey,
        },
        authority: {
          publicKey: authority.publicKey,
          secretKey: authority.secretKey,
        },
      },
    };
  }

  private async setupNonceInstruction(nonceAccountAuth: Keypair) {
    const nonceAccountPubkey = new PublicKey(process.env.NONCE_ACCOUNT_PUB_KEY);
    const accountInfo = await this.connection.getAccountInfo(
      nonceAccountPubkey,
      'confirmed',
    );
    const nonceAccount = NonceAccount.fromAccountData(accountInfo.data);

    return {
      nonceAccountPubkey,
      nonceAccount,
      nonceAdvance: SystemProgram.nonceAdvance({
        noncePubkey: nonceAccountPubkey,
        authorizedPubkey: nonceAccountAuth.publicKey,
      }),
    };
  }

  private async createMetadataInstruction(
    mint: Keypair,
    authority: Keypair,
    backendWallet: Keypair,
    metadataData: any,
    isMutable: boolean,
  ) {
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
      process.env.METAPLEX_METADATA_PROGRAM,
    );

    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    );

    return createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: mint.publicKey,
        mintAuthority: authority.publicKey,
        payer: backendWallet.publicKey,
        updateAuthority: authority.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          collectionDetails: null,
          data: metadataData,
          isMutable,
        },
      },
    );
  }

  private async createTokenInstructions(
    mint: Keypair,
    authority: Keypair,
    backendWallet: Keypair,
    mintAmount: bigint,
  ) {
    const createTokenAccount = SystemProgram.createAccount({
      fromPubkey: backendWallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports: await getMinimumBalanceForRentExemptMint(this.connection),
      programId: TOKEN_PROGRAM_ID,
    });

    const initMintInstruction = createInitializeMintInstruction(
      mint.publicKey,
      9, // decimals
      authority.publicKey,
      null,
    );

    const ata = await getAssociatedTokenAddress(
      mint.publicKey,
      authority.publicKey,
    );

    const createAssociatedTokenInstruction =
      createAssociatedTokenAccountInstruction(
        backendWallet.publicKey,
        ata,
        authority.publicKey,
        mint.publicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

    const mintTokensInstruction = createMintToInstruction(
      mint.publicKey,
      ata,
      authority.publicKey,
      mintAmount,
    );

    return {
      createTokenAccount,
      initMintInstruction,
      createAssociatedTokenInstruction,
      mintTokensInstruction,
      ata,
    };
  }

  async createMemeToken(createTokenRequest: CreateMintTokenRequest) {
    this.logger.debug('Create Meme Token Started');

    const metadataResponse =
      await this.createMetadataService.createAndPinMetadataForSplToken(
        createTokenRequest.image,
        createTokenRequest.name,
        createTokenRequest.symbol,
        createTokenRequest.description,
      );

    const { backendWallet, mint, authority, nonceAccountAuth, signers } =
      await this.setupWalletsAndSigners();

    const { nonceAccount, nonceAdvance } =
      await this.setupNonceInstruction(nonceAccountAuth);

    const metadataInstruction = await this.createMetadataInstruction(
      mint,
      authority,
      backendWallet,
      {
        name: createTokenRequest.name,
        symbol: createTokenRequest.symbol,
        uri: metadataResponse.uri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      },
      false, // Immutable metadata for meme tokens
    );

    const mintAmount =
      BigInt(createTokenRequest.mintAmount) * BigInt(1_000_000_000);
    const tokenInstructions = await this.createTokenInstructions(
      mint,
      authority,
      backendWallet,
      mintAmount,
    );

    // Remove both mint and freeze authorities
    const removeMintAuthorityInstruction = createSetAuthorityInstruction(
      mint.publicKey,
      authority.publicKey,
      AuthorityType.MintTokens,
      null,
    );

    const transaction = new Transaction().add(
      nonceAdvance,
      tokenInstructions.createTokenAccount,
      tokenInstructions.initMintInstruction,
      metadataInstruction,
      tokenInstructions.createAssociatedTokenInstruction,
      tokenInstructions.mintTokensInstruction,
      removeMintAuthorityInstruction,
    );

    return await this.sendAndConfirmTransaction(
      createTokenRequest,
      metadataResponse,
      transaction,
      nonceAccount,
      signers,
    );
  }

  async createUtilityToken(createTokenRequest: CreateMintTokenRequest) {
    this.logger.debug('Create Utility Token Started');

    const metadataResponse =
      await this.createMetadataService.createAndPinMetadataForSplToken(
        createTokenRequest.image,
        createTokenRequest.name,
        createTokenRequest.symbol,
        createTokenRequest.description,
      );

    const { backendWallet, mint, authority, nonceAccountAuth, signers } =
      await this.setupWalletsAndSigners();

    const { nonceAccount, nonceAdvance } =
      await this.setupNonceInstruction(nonceAccountAuth);

    const metadataInstruction = await this.createMetadataInstruction(
      mint,
      authority,
      backendWallet,
      {
        name: createTokenRequest.name,
        symbol: createTokenRequest.symbol,
        uri: metadataResponse.uri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      },
      true, // Mutable metadata for utility tokens
    );

    const mintAmount =
      BigInt(createTokenRequest.mintAmount) * BigInt(1_000_000_000);
    const tokenInstructions = await this.createTokenInstructions(
      mint,
      authority,
      backendWallet,
      mintAmount,
    );

    // For utility tokens, we keep the mint and freeze authorities

    const transaction = new Transaction().add(
      nonceAdvance,
      tokenInstructions.createTokenAccount,
      tokenInstructions.initMintInstruction,
      metadataInstruction,
      tokenInstructions.createAssociatedTokenInstruction,
      tokenInstructions.mintTokensInstruction,
    );

    return await this.sendAndConfirmTransaction(
      createTokenRequest,
      metadataResponse,
      transaction,
      nonceAccount,
      signers,
    );
  }

  private async sendAndConfirmTransaction(
    createMintTokenRequest: CreateMintTokenRequest,
    metadata: MetadataPinResponse,
    transaction: Transaction,
    nonceAccount: NonceAccount,
    signers: Record<string, Signer>,
  ) {
    transaction.recentBlockhash = nonceAccount.nonce;
    transaction.feePayer = signers.backendDevWallet.publicKey;

    transaction.partialSign(signers.nonceAccountAuth);
    transaction.partialSign(signers.backendDevWallet);
    transaction.partialSign(signers.authority);
    transaction.partialSign(signers.mint);

    this.logger.debug('Sending transaction');

    const signature = await this.connection.sendTransaction(transaction, [
      signers.nonceAccountAuth,
      signers.backendDevWallet,
      signers.authority,
      signers.mint,
    ]);

    const response = {
      authoritySignerPrivKey: base58.encode(signers.authority.secretKey),
      authoritySignerPubKey: signers.authority.publicKey,
      mintSignerPrivKey: base58.encode(signers.mint.secretKey),
      mintSignerPubKey: signers.mint.publicKey,
      transactionSignature: signature,
    };

    this.logger.debug('Token Keys:');
    this.logger.debug(JSON.stringify(response));

    const confirm = await this.connection.confirmTransaction(
      signature,
      'confirmed',
    );

    if (confirm) {
      this.logger.debug(`Transaction sent and confirmed: ${signature}`);
      if (createMintTokenRequest.userWalletAddress != null) {
        const mintToken: MintedToken = {
          userWalletAddress: createMintTokenRequest.userWalletAddress,
          name: createMintTokenRequest.name,
          symbol: createMintTokenRequest.symbol,
          description: createMintTokenRequest.symbol,
          metadata: metadata.uri,
        };

        await this.mintRepo.createToken(mintToken);
      }
    }

    return response;
  }
}
