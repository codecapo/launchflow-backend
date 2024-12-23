import { Injectable, Logger } from '@nestjs/common';
import {
  Connection,
  Keypair,
  NonceAccount,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { CreateAndMintTokenRequest } from '@app/ss-common-domain/mint/dto/spl.dtos';
import * as base58 from 'bs58';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import { CreateMetadataService } from '@app/solana/metadata/create.metadata.service';

@Injectable()
export class AdminCreateMintTokenService {
  private readonly logger: Logger = new Logger();
  private connection = new Connection(process.env.RPC_ENDPOINT);

  constructor(
    private readonly solsUtils: SolsUtils,
    private readonly createMetadataService: CreateMetadataService,
  ) {}

  public async createMintTokens(
    createAndMintTokenRequest: CreateAndMintTokenRequest,
    image: Express.Multer.File,
  ) {
    this.logger.debug('#####################################');
    this.logger.debug('Create Mint Token Started');

    const createUploadMetadataResponse =
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

    // Keypairs
    const mint = Keypair.generate();
    const authority = Keypair.generate();

    const nonceAccountAuth = Keypair.fromSecretKey(
      base58.decode(process.env.NONCE_ACCOUNT_AUTH_PRIV_KEY),
    );

    // Public Keys
    const nonceAccountPubkey = new PublicKey(process.env.NONCE_ACCOUNT_PUB_KEY);

    // Signers
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

    // Durable Nonce Instruction
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
      uri: createUploadMetadataResponse.uri,
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

    // Create Token Account
    const createTokenAccount = SystemProgram.createAccount({
      fromPubkey: backendWallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports: await getMinimumBalanceForRentExemptMint(this.connection),
      programId: TOKEN_PROGRAM_ID,
    });

    this.logger.debug('Create Token account instruction created');

    // Initialize mint with temporary authority
    const initMintInstruction = createInitializeMintInstruction(
      mint.publicKey,
      9, // decimals
      authority.publicKey, // Temporary mint authority
      null, // No freeze authority from the start
    );

    this.logger.debug('Init Mint instruction created');

    // Create Associated Token Account
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

    // Mint tokens instruction
    const mintAmount =
      BigInt(createAndMintTokenRequest.mintAmount) * BigInt(1_000_000_000);
    const mintTokensInstruction = createMintToInstruction(
      mint.publicKey,
      ata,
      authority.publicKey,
      mintAmount,
    );

    this.logger.debug('Mint tokens instruction created');

    // Create instruction to remove mint authority
    const removeMintAuthorityInstruction = createSetAuthorityInstruction(
      mint.publicKey,
      authority.publicKey,
      AuthorityType.MintTokens,
      null,
    );

    this.logger.debug('Remove mint authority instruction created');

    // Build and send transaction
    const transaction = new Transaction().add(
      nonceAdvance,
      createTokenAccount,
      initMintInstruction,
      createMetadataAccountInstruction,
      createAssociatedTokenInstruction,
      mintTokensInstruction,
      removeMintAuthorityInstruction,
    );

    this.logger.debug('Transaction created');

    transaction.recentBlockhash = nonceAccount.nonce;
    transaction.feePayer = backendDevWalletSigner.publicKey;

    transaction.partialSign(nonceAccountAuthSigner);
    transaction.partialSign(backendDevWalletSigner);
    transaction.partialSign(mintAuthoritySigner);
    transaction.partialSign(mintSigner);

    this.logger.debug('Sending transaction');

    const send = await this.connection.sendTransaction(transaction, [
      nonceAccountAuthSigner,
      backendDevWalletSigner,
      mintAuthoritySigner,
      mintSigner,
    ]);

    const response = {
      authoritySignerPrivKey: base58.encode(mintAuthoritySigner.secretKey),
      authoritySignerPubKey: mintAuthoritySigner.publicKey,
      mintSignerPrivKey: base58.encode(mintSigner.secretKey),
      mintSignerPubKey: mintSigner.publicKey,
      transactionSignature: send,
    };

    this.logger.debug('Production Mint Keys');
    this.logger.debug(`${JSON.stringify(response)}`);

    const confirm = await this.connection.confirmTransaction(send, 'confirmed');

    if (confirm) {
      this.logger.debug(`Transaction sent and confirmed: ${send}`);
    }

    return response;
  }
}
