import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { CreateTokenMintAccountService } from '../service/create.token-mint-account.service';

import { CreateMintTokenSupplyService } from '../service/create.mint-token-supply.service';

import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMintTokensService } from '../service/create-mint-tokens.service';
import { CreateMintTokenRequest } from "@app/ss-common-domain/mint/dto/spl.dtos";

interface TokenDeployedResponse {
  mintPubKey: string;
  mintPrivKey: string;
  backendPubKey: string;
  backendPrivKey: string;
  transaction: string;
}

interface CreateTokenWeb3js {
  name: string;
  symbol: string;
  description: string;
  uri: string;
  //userWalletAddress: string;
}

@Controller('spl')
export class SplMintController {
  constructor(
    private readonly createTokenMintAccountService: CreateTokenMintAccountService,
    private readonly createMintTokenSupply: CreateMintTokenSupplyService,
    private readonly createMintTokensService: CreateMintTokensService,
  ) {}

  @Post('mint')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async createMintSplToken(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMintToken: CreateMintTokenRequest,
  ) {
    return await this.createMintTokensService.createToken(
      createMintToken,
      file,
    );
  }
}

//   @Post('create/token-mint-account')
//   @HttpCode(201)
//   @UseInterceptors(FileInterceptor('file'))
//   async createMintTokenAccount(
//     @UploadedFile() file: Express.Multer.File,
//     @Body() body: CreateTokenMintAccountRequestDto,
//   ) {
//     // try {
//
//     return await this.createTokenMintAccountService.createTokenMintAccount(
//       file,
//       body,
//     );
//
//     // } catch (error) {
//     //   throw new BadRequestException(
//     //     'Please provide all fields to create token',
//     //   );
//     // }
//   }
//
//   @Post('mint/token-supply')
//   @HttpCode(201)
//   async mintTokenSupply(
//     @Body() createMintTokenSupplyDto: CreateMintTokenSupplyDto,
//   ) {
//     try {
//       return await this.createMintTokenSupply.mintProjectTokenSupply(
//         createMintTokenSupplyDto,
//       );
//     } catch (error) {
//       throw new BadRequestException(
//         'Please provide wallet address and mint token address to mint token supply',
//       );
//     }
//   }
//
//   @Post('create-token-web3js')
//   async web3jsCreateToken(@Body() createTokenWeb3Js: CreateTokenWeb3js) {
//     const connection = new Connection(clusterApiUrl('devnet'));
//
//     const mintWallet = Keypair.generate();
//
//     const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
//       'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
//     );
//
//     const tokenMintAccount = mintWallet.publicKey;
//
//     const backendWallet = Keypair.fromSecretKey(
//       base58.decode(
//         '2MsoSHdFWNCdCkGqW3Lr1HzahZTZPkniq38v89iJow12ZiamcQwsqwwX2zpzBTP9teBqhY5UYRnbbtXFneTknRNw',
//       ),
//     );
//
//     const mintSigner: Signer = {
//       publicKey: mintWallet.publicKey,
//       secretKey: mintWallet.secretKey,
//     };
//
//     const decimals = 9;
//
//     const metadata: TokenMetadata = {
//       mint: mintWallet.publicKey,
//       name: createTokenWeb3Js.name,
//       symbol: createTokenWeb3Js.symbol,
//       uri: createTokenWeb3Js.uri,
//       additionalMetadata: [['description', createTokenWeb3Js.description]],
//     };
//
//     const metadataPDAAndBump = PublicKey.findProgramAddressSync(
//       [
//         Buffer.from('metadata'),
//         TOKEN_METADATA_PROGRAM_ID.toBuffer(),
//         tokenMintAccount.toBuffer(),
//       ],
//       TOKEN_METADATA_PROGRAM_ID,
//     );
//
//     const metadataPDA = metadataPDAAndBump[0];
//
//     const metadataData = {
//       name: createTokenWeb3Js.name,
//       symbol: createTokenWeb3Js.symbol,
//       // Arweave / IPFS / Pinata etc link using metaplex standard for off-chain data
//       uri: createTokenWeb3Js.uri,
//       sellerFeeBasisPoints: 0,
//       creators: null,
//       collection: null,
//       uses: null,
//     };
//
//     const feePayer = new PublicKey(createTokenWeb3Js.userWalletAddress);
//     //const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
//     //const mintLamports = 2714400
//     //const mintLamports = 3000000;
//
//     const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
//       units: 1000,
//     });
//
//     const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
//       microLamports: 2000,
//     });
//
//     const recentBlockhash = await connection.getLatestBlockhash();
//
//     const createAccountInstruction = SystemProgram.createAccount({
//       fromPubkey: backendWallet.publicKey,
//       newAccountPubkey: mintWallet.publicKey,
//       space: MINT_SIZE,
//       lamports: await getMinimumBalanceForRentExemptMint(connection),
//       programId: TOKEN_PROGRAM_ID,
//     });
//
//     const mintInstruction = createInitializeMintInstruction(
//       mintWallet.publicKey,
//       decimals,
//       backendWallet.publicKey,
//       null,
//       TOKEN_PROGRAM_ID,
//     );
//
//     const createMetadataAccountInstruction =
//       createCreateMetadataAccountV3Instruction(
//         {
//           metadata: metadataPDA,
//           mint: tokenMintAccount,
//           mintAuthority: backendWallet.publicKey,
//           payer: feePayer,
//           updateAuthority: backendWallet.publicKey,
//         },
//         {
//           createMetadataAccountArgsV3: {
//             collectionDetails: null,
//             data: metadataData,
//             isMutable: true,
//           },
//         },
//       );
//
//     const metadataInstruction = createInitializeInstruction({
//       programId: TOKEN_PROGRAM_ID,
//       mint: mintWallet.publicKey,
//       metadata: mintWallet.publicKey,
//       name: metadata.name,
//       symbol: metadata.symbol,
//       uri: metadata.uri,
//       mintAuthority: backendWallet.publicKey,
//       updateAuthority: backendWallet.publicKey,
//     });
//
//     // legacy
//     //
//     const transactionBlockhashCtor: TransactionBlockhashCtor = {
//       blockhash: recentBlockhash.blockhash,
//       feePayer: feePayer,
//       lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
//     };
//
//     const transaction = new Transaction(transactionBlockhashCtor).add(
//       createAccountInstruction,
//       mintInstruction,
//       createMetadataAccountInstruction,
//       //metadataInstruction,
//
//       // modifyComputeUnits,
//       // addPriorityFee,
//     );
//
//     // transaction.recentBlockhash = recentBlockhash.blockhash;
//     //
//     // transaction.partialSign(backendSigner);
//     // transaction.partialSign(mintSigner);
//     //
//     // console.log(transaction.feePayer.toBase58());
//     //
//     // const serialisedTransaction = transaction.serialize({
//     //   requireAllSignatures: false,
//     //   verifySignatures: true,
//     // });
//     //
//     // const base64Trans = Buffer.from(serialisedTransaction).toString('base64');
//     //
//     // const response: TokenDeployedResponse = {
//     //   backendPrivKey: base58.encode(backendWallet.secretKey),
//     //   backendPubKey: backendWallet.publicKey.toBase58(),
//     //   mintPrivKey: base58.encode(mintWallet.secretKey),
//     //   mintPubKey: mintWallet.publicKey.toBase58(),
//     //   transaction: base64Trans,
//     // };
//
//     //version
//
//     // const messageV0 = new TransactionMessage({
//     //   payerKey: new PublicKey(createTokenWeb3Js.userWalletAddress),
//     //   recentBlockhash: recentBlockhash.blockhash,
//     //   instructions: [
//     //     createAccountInstruction,
//     //     metadataInstruction,
//     //     mintInstruction,
//     //     // modifyComputeUnits,
//     //     // addPriorityFee,
//     //   ],
//     // }).compileToV0Message();
//     //
//     // const versionTransaction = new VersionedTransaction(messageV0);
//     //
//     // //versionTransaction.sign([backendSigner]);
//     //
//     // const encodedSerialisedVersionedTransaction = base58.encode(
//     //   versionTransaction.serialize(),
//     // );
//     //
//     // const base64encoded = Buffer.from(versionTransaction.serialize()).toString(
//     //   'base64',
//     // );
//     // const versionResponse: TokenDeployedResponse = {
//     //   backendPrivKey: base58.encode(backendWallet.secretKey),
//     //   backendPubKey: backendWallet.publicKey.toBase58(),
//     //   mintPrivKey: base58.encode(mintWallet.secretKey),
//     //   mintPubKey: mintWallet.publicKey.toBase58(),
//     //   transaction: base64encoded,
//     // };
//     //
//   //   return response;
//   // }
//   //
//   // @Post('create-token-web3js')
//   // async web3jsCreateToken(@Body() createTokenWeb3Js: CreateTokenWeb3js) {
//   //   const connection = new Connection(clusterApiUrl('devnet'));
//   //
//   //   const mintWallet = Keypair.generate();
//   //
//   //   const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
//   //     'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
//   //   );
//   //
//   //   const tokenMintAccount = mintWallet.publicKey;
//   //
//   //   const backendWallet = Keypair.fromSecretKey(
//   //     base58.decode(process.env.MAIN_BACKEND_DEV_WALLET),
//   //   );
//   //
//   //   const backendSigner: Signer = {
//   //     publicKey: backendWallet.publicKey,
//   //     secretKey: backendWallet.secretKey,
//   //   };
//   //
//   //   const mintSigner: Signer = {
//   //     publicKey: mintWallet.publicKey,
//   //     secretKey: mintWallet.secretKey,
//   //   };
//   //
//   //   const decimals = 9;
//   //
//   //   const metadata: TokenMetadata = {
//   //     mint: mintWallet.publicKey,
//   //     name: createTokenWeb3Js.name,
//   //     symbol: createTokenWeb3Js.symbol,
//   //     uri: createTokenWeb3Js.uri,
//   //     additionalMetadata: [['description', createTokenWeb3Js.description]],
//   //   };
//   //
//   //   const metadataPDAAndBump = PublicKey.findProgramAddressSync(
//   //     [
//   //       Buffer.from('metadata'),
//   //       TOKEN_METADATA_PROGRAM_ID.toBuffer(),
//   //       tokenMintAccount.toBuffer(),
//   //     ],
//   //     TOKEN_METADATA_PROGRAM_ID,
//   //   );
//   //
//   //   const metadataPDA = metadataPDAAndBump[0];
//   //
//   //   const metadataData: DataV2 = {
//   //     name: createTokenWeb3Js.name,
//   //     symbol: createTokenWeb3Js.symbol,
//   //     uri: createTokenWeb3Js.uri,
//   //     sellerFeeBasisPoints: 0,
//   //     creators: null,
//   //     collection: null,
//   //     uses: null,
//   //   };
//   //
//   //   //const feePayer = new PublicKey(createTokenWeb3Js.userWalletAddress);
//   //   //const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
//   //   //const mintLamports = 2714400
//   //   //const mintLamports = 3000000;
//   //
//   //   const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
//   //     units: 1000,
//   //   });
//   //
//   //   const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
//   //     microLamports: 2000,
//   //   });
//   //
//   //   const recentBlockhash = await connection.getLatestBlockhash();
//   //
//   //   const createAccountInstruction = SystemProgram.createAccount({
//   //     fromPubkey: backendWallet.publicKey,
//   //     newAccountPubkey: mintWallet.publicKey,
//   //     space: MINT_SIZE,
//   //     lamports: await getMinimumBalanceForRentExemptMint(connection),
//   //     programId: TOKEN_PROGRAM_ID,
//   //   });
//   //
//   //   const mintInstruction = createInitializeMintInstruction(
//   //     mintWallet.publicKey,
//   //     decimals,
//   //     backendWallet.publicKey,
//   //     null,
//   //     TOKEN_PROGRAM_ID,
//   //   );
//   //
//   //   const createMetadataAccountInstruction =
//   //     createCreateMetadataAccountV3Instruction(
//   //       {
//   //         metadata: metadataPDA,
//   //         mint: tokenMintAccount,
//   //         mintAuthority: backendWallet.publicKey,
//   //         payer: backendWallet.publicKey,
//   //         updateAuthority: backendWallet.publicKey,
//   //       },
//   //       {
//   //         createMetadataAccountArgsV3: {
//   //           collectionDetails: null,
//   //           data: metadataData,
//   //           isMutable: true,
//   //         },
//   //       },
//   //     );
//   //
//   //   // const metadataInstruction = createInitializeInstruction({
//   //   //   programId: TOKEN_PROGRAM_ID,
//   //   //   mint: mintWallet.publicKey,
//   //   //   metadata: mintWallet.publicKey,
//   //   //   name: metadata.name,
//   //   //   symbol: metadata.symbol,
//   //   //   uri: metadata.uri,
//   //   //   mintAuthority: backendWallet.publicKey,
//   //   //   updateAuthority: backendWallet.publicKey,
//   //   // });
//   //
//   //   const transactionBlockhashCtor: TransactionBlockhashCtor = {
//   //     blockhash: recentBlockhash.blockhash,
//   //     feePayer: backendWallet.publicKey,
//   //     lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
//   //   };
//   //
//   //   const transaction = new Transaction(transactionBlockhashCtor).add(
//   //     createAccountInstruction,
//   //     mintInstruction,
//   //     createMetadataAccountInstruction,
//   //     //metadataInstruction,
//   //     // modifyComputeUnits,
//   //     // addPriorityFee,
//   //   );
//   //
//   //   const send = await connection.sendTransaction(transaction, [
//   //     backendSigner,
//   //     mintSigner,
//   //   ]);
//   //
//   //   console.log(send);
//   //
//   //   const confirmed = await connection.confirmTransaction(send, 'finalized');
//   //
//   //   return confirmed;
//   // }
//
//   @Post('create-mint')
//   @UseInterceptors(FileInterceptor('file'))
//   public async createMintToken(
//     @UploadedFile() file: Express.Multer.File,
//     @Body() createMintTokenRequest: CreateMintTokenRequest
//   ) {
//     return
//
//   }
// }
