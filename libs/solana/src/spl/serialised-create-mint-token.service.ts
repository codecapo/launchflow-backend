import { Injectable, Logger } from '@nestjs/common';
import * as base58 from 'bs58';

import { SolsUtils } from '@app/solana/utils/sols-utils.service';

import {
  Connection,
  Keypair,
  NonceAccount,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  CreateAndMintTokenRequest,
  CreateAndMintTokenResponse,
  CreateMintTokenRequest,
  CreateTokenSerialisedResponse,
  MintTokenResponse,
  MintTokenSerialised,
} from '@app/ss-common-domain/mint/dto/spl.dtos';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToCheckedInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { CreateMetadataService } from '@app/solana/metadata/create.metadata.service';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';

@Injectable()
export class SerialisedCreateMintTokenService {
  private readonly logger: Logger = new Logger();
  private connection = new Connection(process.env.RPC_ENDPOINT);

  constructor(
    private readonly solsUtils: SolsUtils,
    private readonly createMetadataService: CreateMetadataService,
  ) {}

  /*
   * Creates a new sol token along with the metadata
   * The transaction is serialised
   * */
  async createToken(
    createMintTokens: CreateMintTokenRequest,
    image: Express.Multer.File,
  ) {
    const createUploadMetadata =
      await this.createMetadataService.createAndPinMetadataForSplToken(
        image,
        createMintTokens.name,
        createMintTokens.symbol,
        createMintTokens.description,
      );

    const chosenBackendDevWallet = await this.solsUtils.walletRandomiser();
    const backendWallet = Keypair.fromSecretKey(
      base58.decode(chosenBackendDevWallet.privKey),
    );

    const mint = Keypair.generate();
    const authority = Keypair.generate();

    const nonceAccountPubkey = new PublicKey(process.env.NONCE_ACCOUNT_PUB_KEY);

    const nonceAccountAuth = Keypair.fromSecretKey(
      base58.decode(process.env.NONCE_ACCOUNT_AUTH_PRIV_KEY),
    );

    const nonceAccountAuthSigner: Signer = {
      publicKey: nonceAccountAuth.publicKey,
      secretKey: nonceAccountAuth.secretKey,
    };

    const accountInfo =
      await this.connection.getAccountInfo(nonceAccountPubkey);
    const nonceAccount = NonceAccount.fromAccountData(accountInfo.data);

    const backendDevWalletSigner: Signer = {
      publicKey: backendWallet.publicKey,
      secretKey: backendWallet.secretKey,
    };

    const mintSigner: Signer = {
      publicKey: mint.publicKey,
      secretKey: mint.secretKey,
    };

    const authoritySigner: Signer = {
      publicKey: authority.publicKey,
      secretKey: authority.secretKey,
    };

    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
      process.env.METAPLEX_METADATA_PROGRAM,
    );

    const metadataPDAAndBump = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    );

    const metadataPDA = metadataPDAAndBump[0];

    const metadataData = {
      name: createMintTokens.name,
      symbol: createMintTokens.symbol,
      uri: createUploadMetadata.uri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    };

    const createTokenAccount = SystemProgram.createAccount({
      fromPubkey: backendWallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports: await getMinimumBalanceForRentExemptMint(this.connection),
      programId: TOKEN_PROGRAM_ID,
    });

    const initMintTokenAccount = createInitializeMintInstruction(
      mint.publicKey, // mint pubkey
      9,
      authority.publicKey,
      null,
    );

    const createMetadataAccountInstruction =
      createCreateMetadataAccountV3Instruction(
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
            isMutable: true,
          },
        },
      );

    const nonceAdvance = SystemProgram.nonceAdvance({
      noncePubkey: nonceAccountPubkey,
      authorizedPubkey: nonceAccountAuth.publicKey,
    });

    const transaction = new Transaction().add(
      nonceAdvance,
      createTokenAccount,
      initMintTokenAccount,
      createMetadataAccountInstruction,
    );

    transaction.recentBlockhash = nonceAccount.nonce;
    transaction.feePayer = backendDevWalletSigner.publicKey;

    transaction.partialSign(nonceAccountAuthSigner);
    transaction.partialSign(backendDevWalletSigner);
    transaction.partialSign(mintSigner);
    transaction.partialSign(authoritySigner);

    const serialise = transaction.serialize({
      requireAllSignatures: false,
    });

    const createSerialisedTokenResponse: CreateTokenSerialisedResponse = {
      mintAuthPrivKey: base58.encode(authority.secretKey),
      mintAuthPubKey: authority.publicKey.toBase58(),
      mintPrivKey: base58.encode(mint.secretKey),
      mintPubkey: mint.publicKey.toBase58(),
      serialisedTransaction: base58.encode(serialise),
    };

    return createSerialisedTokenResponse;
  }

  /*
   * Mint tokens to specified wallet address
   * The transaction is serialised
   * */
  public async mintToken(mintTokenSerialisedTransaction: MintTokenSerialised) {
    const chosenBackendDevWallet = await this.solsUtils.walletRandomiser();
    const backendWallet = Keypair.fromSecretKey(
      base58.decode(chosenBackendDevWallet.privKey),
    );

    const backendDevWalletSigner: Signer = {
      publicKey: backendWallet.publicKey,
      secretKey: backendWallet.secretKey,
    };

    const mintAccountWallet = Keypair.fromSecretKey(
      base58.decode(mintTokenSerialisedTransaction.mintTokenAccountPrivKey),
    );

    const mintAuthKeyPair = Keypair.fromSecretKey(
      base58.decode(mintTokenSerialisedTransaction.mintAuthorityPrivateKey),
    );

    const mintTokenAccountSigner: Signer = {
      publicKey: mintAccountWallet.publicKey,
      secretKey: mintAccountWallet.secretKey,
    };

    const mintAccountAuthoritySigner: Signer = {
      publicKey: mintAuthKeyPair.publicKey,
      secretKey: mintAuthKeyPair.secretKey,
    };

    const nonceAccountPubkey = new PublicKey(process.env.NONCE_ACCOUNT_PUB_KEY);

    const nonceAccountAuth = Keypair.fromSecretKey(
      base58.decode(process.env.NONCE_ACCOUNT_AUTH_PRIV_KEY),
    );

    const nonceAccountAuthSigner: Signer = {
      publicKey: nonceAccountAuth.publicKey,
      secretKey: nonceAccountAuth.secretKey,
    };

    const accountInfo =
      await this.connection.getAccountInfo(nonceAccountPubkey);
    const nonceAccount = NonceAccount.fromAccountData(accountInfo.data);

    const nonceAdvance = SystemProgram.nonceAdvance({
      noncePubkey: nonceAccountPubkey,
      authorizedPubkey: nonceAccountAuth.publicKey,
    });

    const mintTo = await Keypair.generate();

    const ata = await getAssociatedTokenAddress(
      mintTokenAccountSigner.publicKey,
      mintTo.publicKey,
    );

    const createAssociatedTokenInstruction =
      createAssociatedTokenAccountInstruction(
        backendDevWalletSigner.publicKey,
        ata,
        mintTo.publicKey,
        mintTokenAccountSigner.publicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

    const num =
      BigInt(mintTokenSerialisedTransaction.mintTokenAmount) *
      BigInt(1_000_000_000);

    const mintTokens = createMintToCheckedInstruction(
      mintTokenAccountSigner.publicKey, // mint
      ata, // receiver (should be a token account)
      mintAccountAuthoritySigner.publicKey, // mint authority
      num, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      9, // decimals
      // [signer1, signer2 ...], // only multisig account will use
    );
    const transaction = new Transaction().add(
      nonceAdvance,
      createAssociatedTokenInstruction,
      mintTokens,
    );

    transaction.recentBlockhash = nonceAccount.nonce;

    transaction.feePayer = backendDevWalletSigner.publicKey;

    transaction.partialSign(nonceAccountAuthSigner);
    transaction.partialSign(backendDevWalletSigner);
    transaction.partialSign(mintAccountAuthoritySigner);

    const mintTokenResponse: MintTokenResponse = {
      transactionSignature: base58.encode(
        transaction.serialize({ requireAllSignatures: false }),
      ),
    };
    return mintTokenResponse;
  }

  public async sendSerialisedTransaction(serialisedTransaction: string) {
    const decoded = base58.decode(serialisedTransaction);
    const recoveredTransaction = Transaction.from(decoded);
    const raw = recoveredTransaction.serialize();
    const send = await this.connection.sendRawTransaction(raw);
    const confirm = await this.connection.confirmTransaction(send, 'finalized');
    if (confirm) {
      this.logger.log(`Transaction sent and confirmed ${send}`);
      return send;
    } else {
      return;
    }
  }

  // for saturday
  public async createAndMintSupplyToken(
    image: Express.Multer.File,
    createAndMintTokenRequest: CreateAndMintTokenRequest,
  ) {
    this.logger.debug('#####################################');
    this.logger.debug('Create Mint Token Started');

    //Upload and Create Metadata
    const createUploadMetadata =
      await this.createMetadataService.createAndPinMetadataForSplToken(
        image,
        createAndMintTokenRequest.name,
        createAndMintTokenRequest.symbol,
        createAndMintTokenRequest.description,
      );

    const chosenBackendDevWallet = await this.solsUtils.walletRandomiser();
    const backendWallet = Keypair.fromSecretKey(
      base58.decode(chosenBackendDevWallet.privKey),
    );

    //Keypairs

    const mint = Keypair.generate();
    const authority = Keypair.generate();

    const nonceAccountAuth = Keypair.fromSecretKey(
      base58.decode(process.env.NONCE_ACCOUNT_AUTH_PRIV_KEY),
    );

    //Public Keys
    const nonceAccountPubkey = new PublicKey(process.env.NONCE_ACCOUNT_PUB_KEY);

    //Signers
    const nonceAccountAuthSigner: Signer = {
      publicKey: nonceAccountAuth.publicKey,
      secretKey: nonceAccountAuth.secretKey,
    };

    const backendDevWalletSigner: Signer = {
      publicKey: backendWallet.publicKey,
      secretKey: backendWallet.secretKey,
    };

    const mintSigner: Signer = {
      publicKey: mint.publicKey,
      secretKey: mint.secretKey,
    };

    const mintAuthoritySigner: Signer = {
      publicKey: authority.publicKey,
      secretKey: authority.secretKey,
    };

    this.logger.debug('Keypairs Public Keys and Signers mapped');

    //Durable Nonce Instruction
    const accountInfo = await this.connection.getAccountInfo(
      nonceAccountPubkey,
      'confirmed',
    );

    const nonceAccount = NonceAccount.fromAccountData(accountInfo.data);

    const nonceAdvance = SystemProgram.nonceAdvance({
      noncePubkey: nonceAccountPubkey,
      authorizedPubkey: nonceAccountAuth.publicKey,
    });

    this.logger.debug('Durable nonce created');

    // Create Token Instructions

    //Metadata Instruction
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
      process.env.METAPLEX_METADATA_PROGRAM,
    );

    const metadataPDAAndBump = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    );

    const metadataPDA = metadataPDAAndBump[0];

    const metadataData = {
      name: createAndMintTokenRequest.name,
      symbol: createAndMintTokenRequest.symbol,
      uri: createUploadMetadata.uri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    };

    let isMutableArgs: boolean;

    if (createAndMintTokenRequest.unmodifiableMetadata) {
      isMutableArgs = false;
    } else {
      isMutableArgs = true;
    }

    const createMetadataAccountInstruction =
      createCreateMetadataAccountV3Instruction(
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
            isMutable: isMutableArgs,
          },
        },
      );

    this.logger.debug('Metadata instruction created');

    //Create Token Instruction
    const createTokenAccount = SystemProgram.createAccount({
      fromPubkey: backendWallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports: await getMinimumBalanceForRentExemptMint(this.connection),
      programId: TOKEN_PROGRAM_ID,
    });

    this.logger.debug('Create Token instruction created');

    //Init Token Instruction

    const initMintTokenAccount = createInitializeMintInstruction(
      mint.publicKey, // mint pubkey
      9,
      authority.publicKey,
      authority.publicKey,
    );

    this.logger.debug('Init Mint Token instruction created');

    //MintTokenInstructions

    //Create Associated Token Account Instruction
    const ata = await getAssociatedTokenAddress(
      mintSigner.publicKey,
      authority.publicKey,
    );

    const createAssociatedTokenInstruction =
      createAssociatedTokenAccountInstruction(
        backendDevWalletSigner.publicKey,
        ata,
        authority.publicKey,
        mintSigner.publicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

    this.logger.debug('Create associated token account instruction created');

    const num =
      BigInt(createAndMintTokenRequest.mintAmount) * BigInt(1_000_000_000);

    const mintTokens = createMintToCheckedInstruction(
      mintSigner.publicKey, // mint
      ata, // receiver (should be a token account)
      mintAuthoritySigner.publicKey, // mint authority
      num, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      9, // decimals
    );

    this.logger.debug('Mint token instruction created');

    // Transaction

    let revokeFreezeAuthority: TransactionInstruction;
    let revokeMintAuthority: TransactionInstruction;

    if (createAndMintTokenRequest.revokeMintAuthority) {
      revokeMintAuthority = createSetAuthorityInstruction(
        mintSigner.publicKey, // mint acocunt || token account
        authority.publicKey, // current auth
        AuthorityType.MintTokens, // authority type
        null, // new auth (you can pass `null` to close it)
      );
    }

    if (createAndMintTokenRequest.revokeFreezeAuthority) {
      revokeFreezeAuthority = createSetAuthorityInstruction(
        mintSigner.publicKey, // mint acocunt || token account
        authority.publicKey, // current auth
        AuthorityType.FreezeAccount, // authority type
        null, // new auth (you can pass `null` to close it)
      );
    }

    let transaction: Transaction;

    if (
      createAndMintTokenRequest.revokeFreezeAuthority &&
      !createAndMintTokenRequest.revokeFreezeAuthority
    ) {
      this.logger.debug('Revoking freeze authority');
      transaction = new Transaction().add(
        nonceAdvance,
        createTokenAccount,
        initMintTokenAccount,
        createMetadataAccountInstruction,
        createAssociatedTokenInstruction,
        mintTokens,
        revokeFreezeAuthority,
      );
    } else if (
      createAndMintTokenRequest.revokeMintAuthority &&
      !createAndMintTokenRequest.revokeFreezeAuthority
    ) {
      this.logger.debug('Revoking mint authority');
      transaction = new Transaction().add(
        nonceAdvance,
        createTokenAccount,
        initMintTokenAccount,
        createMetadataAccountInstruction,
        createAssociatedTokenInstruction,
        mintTokens,
        revokeMintAuthority,
      );
    } else if (
      createAndMintTokenRequest.revokeMintAuthority &&
      createAndMintTokenRequest.revokeFreezeAuthority
    ) {
      this.logger.debug('Revoking mint and freeze authority');
      transaction = new Transaction().add(
        nonceAdvance,
        createTokenAccount,
        initMintTokenAccount,
        createMetadataAccountInstruction,
        createAssociatedTokenInstruction,
        mintTokens,
        revokeMintAuthority,
        revokeFreezeAuthority,
      );
    } else {
      transaction = new Transaction().add(
        nonceAdvance,
        createTokenAccount,
        initMintTokenAccount,
        createMetadataAccountInstruction,
        createAssociatedTokenInstruction,
        mintTokens,
      );
    }

    this.logger.debug('Create Mint Token transaction created');

    transaction.recentBlockhash = nonceAccount.nonce;
    transaction.feePayer = backendDevWalletSigner.publicKey;

    transaction.partialSign(nonceAccountAuthSigner);
    transaction.partialSign(backendDevWalletSigner);
    transaction.partialSign(mintAuthoritySigner);
    transaction.partialSign(mintSigner);

    this.logger.debug('Transaction signed with prepared signers');

    const createAndMintSerialisedTransactionResponse: CreateAndMintTokenResponse =
      {
        metadataUri: metadataData.uri,
        mintPrivKey: base58.encode(mint.secretKey),
        mintPubkey: mintSigner.publicKey.toBase58(),
        mintAuthPrivKey: base58.encode(mintAuthoritySigner.secretKey),
        mintAuthPubKey: mintAuthoritySigner.publicKey.toBase58(),
        serialisedTransaction: base58.encode(
          transaction.serialize({ requireAllSignatures: false }),
        ),
      };

    this.logger.debug('Transaction serialised and ready to send');
    this.logger.debug('Create Mint Token Ended');
    this.logger.debug('#####################################');
    return createAndMintSerialisedTransactionResponse;
  }
}
