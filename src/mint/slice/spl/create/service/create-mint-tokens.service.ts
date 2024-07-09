import { CreateMetadataService } from '../../../metadata/service/create.metadata.service';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  createMintToCheckedInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as base58 from 'bs58';
import {
  createCreateMetadataAccountV3Instruction,
  Key,
} from '@metaplex-foundation/mpl-token-metadata';
import { Injectable, Logger } from '@nestjs/common';
import {
  CreateMintTokenRequest,
  CreateMintTokenResponse,
} from '@app/ss-common-domain/mint/dto/spl.dtos';

@Injectable()
export class CreateMintTokensService {
  private logger: Logger = new Logger(CreateMintTokensService.name);

  private connection: Connection = new Connection(
    clusterApiUrl('mainnet-beta'),
  );
  constructor(
    private readonly createMetadataService: CreateMetadataService,
    private readonly solsUtils: SolsUtils,
  ) {}

  public async createToken(
    createMintTokens: CreateMintTokenRequest,
    image: Express.Multer.File,
  ) {
    console.log(createMintTokens);

    const createUploadMetadata =
      await this.createMetadataService.createAndPinMetadataForSplToken(
        image,
        createMintTokens.name,
        createMintTokens.symbol,
        createMintTokens.description,
      );

    const mint = Keypair.generate();
    const authority = Keypair.generate();

    const chosenBackendDevWallet = await this.solsUtils.walletRandomiser();
    const backendWallet = Keypair.fromSecretKey(
      base58.decode(chosenBackendDevWallet.privKey),
    );

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
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
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

    const mintTokens = createInitializeMintInstruction(
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

    const transaction = new Transaction().add(
      createTokenAccount,
      mintTokens,
      createMetadataAccountInstruction,
    );

    this.logger.log(
      `mint signer pub key${mintSigner.publicKey} min included in Signature successfully.`,
    );
    this.logger.log(
      `authority signer ${authoritySigner.publicKey} included in Signature successfully.`,
    );
    this.logger.log(
      `backend wallet signer ${backendDevWalletSigner.publicKey} included in Signature successfully.`,
    );

    const transactionSignature = await this.connection.sendTransaction(
      transaction,
      [backendDevWalletSigner, mintSigner, authoritySigner],
    );
    const response: CreateMintTokenResponse = {
      createTokenTransactionSignature: transactionSignature,
      mintAuthorityPrivateKey: base58.encode(authoritySigner.secretKey),
      mintAuthorityPublicKey: authoritySigner.publicKey.toString(),
      mintPrivateKey: base58.encode(authoritySigner.secretKey),
      mintPublicKey: '',
    };
    return response;
  }

  async createTokenSerialised(
    createMintTokens: CreateMintTokenRequest,
    image: Express.Multer.File,
  ) {
    console.log(createMintTokens);

    const createUploadMetadata =
      await this.createMetadataService.createAndPinMetadataForSplToken(
        image,
        createMintTokens.name,
        createMintTokens.symbol,
        createMintTokens.description,
      );

    const mint = Keypair.generate();
    const authority = Keypair.generate();

    const chosenBackendDevWallet = await this.solsUtils.walletRandomiser();
    const backendWallet = Keypair.fromSecretKey(
      base58.decode(chosenBackendDevWallet.privKey),
    );

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
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
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

    const mintTokens = createInitializeMintInstruction(
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

    const transaction = new Transaction().add(
      createTokenAccount,
      mintTokens,
      createMetadataAccountInstruction,
    );

    transaction.partialSign(mintSigner);
    transaction.partialSign(authoritySigner);

    const serialise = transaction.serialize({
      requireAllSignatures: false,
    });

    return base58.encode(serialise);
  }

  // user durable nounces to ensure the transaction doesnt error out because the resent blockhash is not gone old

  async sendPartialSignedDeserialisedTransaction(
    serialisedTransaction: string,
  ) {
    const decoded = base58.decode(serialisedTransaction);
    const recoveredTransaction = Transaction.from(decoded);
    const raw = recoveredTransaction.serialize();
    const tx = await this.connection.sendRawTransaction(raw);


  }

  async createMint(
    mintPublicKey: PublicKey,
    destination: PublicKey,
    mintAuthority: PublicKey,
    mintAmount: number,
  ) {
    const chosenBackendDevWallet = await this.solsUtils.walletRandomiser();
    const backendWallet = Keypair.fromSecretKey(
      base58.decode(chosenBackendDevWallet.privKey),
    );
    const backendDevWalletSigner: Signer = {
      publicKey: backendWallet.publicKey,
      secretKey: backendWallet.secretKey,
    };

    const mint = Keypair.generate();

    const mintSigner: Signer = {
      publicKey: mint.publicKey,
      secretKey: mint.secretKey,
    };

    const amount = BigInt(mintAmount) * BigInt(1_000_000_000);

    const createMintTransfer = createMintToCheckedInstruction(
      mintPublicKey,
      destination,
      mintAuthority,
      amount,
      9,
    );

    const createMintTransfer1 = createMintToCheckedInstruction(
      mintPublicKey,
      destination,
      mintAuthority,
      amount,
      9,
    );

    const tx = new Transaction().add(createMintTransfer);
    const txSigned = new Transaction().add(createMintTransfer1);
    txSigned.partialSign(backendDevWalletSigner);

    const serializedTransaction = txSigned.serialize({
      requireAllSignatures: false,
    });

    const serialised = base58.encode(serializedTransaction);

    const deserialised = base58.decode(serialised);

    Transaction.from(Buffer.from(deserialised));

    return await this.connection.sendTransaction(tx, [backendDevWalletSigner]);
  }
}
