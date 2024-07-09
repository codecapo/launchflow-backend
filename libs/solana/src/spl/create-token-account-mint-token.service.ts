import { Injectable, Logger } from '@nestjs/common';
import * as base58 from 'bs58';
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import {
  createNoopSigner,
  createSignerFromKeypair,
  generatedSignerPayer,
  Keypair,
  keypairIdentity,
  keypairPayer,
  percentAmount,
  publicKey,
  signerIdentity,
  signerPayer,
  some,
  TransactionBuilder,
} from '@metaplex-foundation/umi';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import { MintTokenSupplyVal } from '@app/solana/spl/mint-token-supply.val';
import {
  toWeb3JsInstruction,
  toWeb3JsKeypair,
  toWeb3JsTransaction,
} from '@metaplex-foundation/umi-web3js-adapters';
import { toWeb3JsLegacyTransaction } from '@metaplex-foundation/umi-web3js-adapters/src/Transaction';
import { Connection, Signer, SystemProgram, Transaction } from "@solana/web3.js";

@Injectable()
export class CreateTokenAccountMintTokenService {
  private logger: Logger = new Logger();
  private connection = new Connection(process.env.QUICKNODE_ENDPOINT);

  constructor(private readonly solanaBlockchainUtils: SolsUtils) {}

  public createMintTokenAccount() {
    // backendSigner
  }

  // public async createMintTokenAccount(
  //   mintTokenAccount: MintTokenAccountVal,
  // ): Promise<string> {
  //   const mintSigner = await this.solanaBlockchainUtils.getMintSignerKeyPair(
  //     mintTokenAccount.mintKeyPair,
  //   );
  //   const userPubKey = publicKey(mintTokenAccount.userWalletPubKey);
  //
  //   const userWalletNoopSigner = createNoopSigner(
  //     publicKey('GVwWKQYQ7JhPcZ6vJjTAi4qnymgQkcgEiH3JFGYUKWDW'),
  //   );
  //   const solstackKeyPair =
  //     await this.solanaBlockchainUtils.getSolStackBackendSigner();
  //   const umiWithBackendSigner = this.solanaBlockchainUtils
  //     .getUmi()
  //     //.use(signerIdentity(userWalletNoopSigner,true));
  //     .use(keypairIdentity(solstackKeyPair));
  //   //.use(signerPayer(userWalletNoopSigner));
  //
  //   console.log(mintTokenAccount);
  //
  //   const createAccountInstruction = createV1(
  //     this.solanaBlockchainUtils.getUmi(),
  //     {
  //       mint: mintSigner,
  //       authority: mintSigner,
  //       name: mintTokenAccount.tokenName,
  //       symbol: mintTokenAccount.tokenSymbol,
  //       uri: mintTokenAccount.tokenUri,
  //       sellerFeeBasisPoints: percentAmount(
  //         mintTokenAccount.sellerFeeBasisPoints,
  //       ),
  //       decimals: some(mintTokenAccount.decimals),
  //       tokenStandard: TokenStandard.NonFungible,
  //     },
  //   );
  //
  //   const transactions = new TransactionBuilder()
  //     .add(createAccountInstruction)
  //     .getInstructions();
  //
  //   const latestBlockhash = await umiWithBackendSigner.rpc.getLatestBlockhash();
  //
  //   const getBlockhash = latestBlockhash.blockhash;
  //
  //   const transaction = umiWithBackendSigner.transactions.create({
  //     version: 0,
  //     payer: userPubKey,
  //     instructions: transactions,
  //     blockhash: getBlockhash,
  //   });
  //
  //   const wrapped: WrappedInstruction = {
  //     bytesCreatedOnChain: 0,
  //     instruction: undefined,
  //     signers: [],
  //   };
  //
  //   const helperFungi = createFungible(umiWithBackendSigner, {
  //     mint: mintSigner,
  //     authority: mintSigner,
  //     updateAuthority: mintSigner,
  //     name: mintTokenAccount.tokenName,
  //     symbol: mintTokenAccount.tokenSymbol,
  //     uri: mintTokenAccount.tokenUri,
  //     sellerFeeBasisPoints: percentAmount(0),
  //     decimals: some(9), // for 0 decimals use some(0)
  //   }).getInstructions();
  //   //.setFeePayer(userWalletNoopSigner)
  //   //.buildWithLatestBlockhash(umiWithBackendSigner);
  //
  //   const transaction2 = umiWithBackendSigner.transactions.create({
  //     version: 0,
  //     payer: userPubKey,
  //     instructions: helperFungi,
  //     blockhash: getBlockhash,
  //   });
  //
  //   const oldskool = toWeb3JsTransaction(transaction2);
  //   const kp = toWeb3JsKeypair(solstackKeyPair);
  //   const signer: Signer = {
  //     secretKey: kp.secretKey,
  //     publicKey: kp.publicKey,
  //   };
  //
  //   oldskool.sign([signer]);
  //
  //
  //
  //   this.logger.log(
  //     `Creating mint token account for ${mintTokenAccount.tokenName} with supply of ${mintTokenAccount.totalSupply} for user ${mintTokenAccount.userWalletPubKey}`,
  //   );
  //
  //   //console.log(base58.encode(helperFungi.signature));
  //   //return base58.encode(helperFungi.signature);
  //
  //   // const trans = await umiWithBackendSigner.payer.signTransaction(helperFungi);
  //   //
  //   // const msg = base58.encode(
  //   //   umiWithBackendSigner.transactions.serialize(helperFungi),
  //   // );
  //
  //   // const msg = base58.encode(
  //   //   umiWithBackendSigner.transactions.serialize(transaction2),
  //   // );
  //
  //   //await umiWithBackendSigner.rpc.sendTransaction(trans);
  //   return base58.encode(oldskool.serialize());
  // }

  // public async mintTokenSupply(mintSupplyVal: MintTokenSupplyVal) {
  //   const mintSigner = createSignerFromKeypair(
  //     this.solanaBlockchainUtils.getUmi(),
  //     mintSupplyVal.mintKeyPair,
  //   );
  //   const userPubKey = publicKey(mintSupplyVal.userWalletPubKey);
  //   const userWalletNoopSigner = createNoopSigner(userPubKey);
  //   const solstackKeyPair =
  //     await this.solanaBlockchainUtils.getSolStackBackendSigner();
  //   const backendSigner = createSignerFromKeypair(
  //     this.solanaBlockchainUtils.getUmi(),
  //     solstackKeyPair,
  //   );
  //
  //   const mintTokenInstruction = mintV1(this.solanaBlockchainUtils.getUmi(), {
  //     mint: mintSigner.publicKey,
  //     authority: userWalletNoopSigner,
  //     amount: mintSupplyVal.totalSupply,
  //     tokenOwner: userPubKey,
  //     tokenStandard: TokenStandard.FungibleAsset,
  //   });
  //
  //   const latestBlockhash = await this.solanaBlockchainUtils
  //     .getUmi()
  //     .rpc.getLatestBlockhash();
  //
  //   const transactions = new TransactionBuilder()
  //     .add(mintTokenInstruction)
  //     .getInstructions();
  //
  //   const transaction = this.solanaBlockchainUtils
  //     .getUmi()
  //     .transactions.create({
  //       version: 0,
  //       payer: userPubKey,
  //       instructions: transactions,
  //       blockhash: latestBlockhash.blockhash,
  //     });
  //
  //   this.logger.log(
  //     `Minting token ${mintSupplyVal.tokenName} with supply of ${mintSupplyVal.totalSupply} for user ${mintSupplyVal.userWalletPubKey}`,
  //   );
  //   await backendSigner.signTransaction(transaction);
  //
  //   return base58.encode(
  //     this.solanaBlockchainUtils.getUmi().transactions.serialize(transaction),
  //   );
  // }

  // public async createMintTokenAccountAndMintSupply(
  //   mintKeyPair: Keypair,
  //   userWalletPubKey: string,
  //   tokenName: string,
  //   tokenSymbol: string,
  //   tokenUri: string,
  //   sellerFeeBasisPoints: number,
  //   decimals: number,
  //   totalSupply: number,
  // ) {
  //   const mintSigner = createSignerFromKeypair(
  //     this.solanaBlockchainUtils.getUmi(),
  //     mintKeyPair,
  //   );
  //   const userWalletAddress = publicKey(userWalletPubKey);
  //   const userWalletNoopSigner = createNoopSigner(userWalletAddress);
  //   const solStackKeyPair =
  //     await this.solanaBlockchainUtils.getSolStackBackendSigner();
  //   const backendSigner = createSignerFromKeypair(
  //     this.solanaBlockchainUtils.getUmi(),
  //     solStackKeyPair,
  //   );
  //
  //   const createAccountInstruction = createV1(
  //     this.solanaBlockchainUtils.getUmi(),
  //     {
  //       mint: mintSigner,
  //       authority: userWalletNoopSigner,
  //       name: tokenName,
  //       symbol: tokenSymbol,
  //       uri: tokenUri,
  //       sellerFeeBasisPoints: percentAmount(sellerFeeBasisPoints),
  //       decimals: some(decimals),
  //       tokenStandard: TokenStandard.NonFungible,
  //     },
  //   );
  //
  //   // save keypair into backend, make sure its encrypted
  //   const mintTokenInstruction = mintV1(this.solanaBlockchainUtils.getUmi(), {
  //     mint: mintSigner.publicKey,
  //     authority: userWalletNoopSigner,
  //     amount: totalSupply,
  //     tokenOwner: userWalletAddress,
  //     tokenStandard: TokenStandard.Fungible,
  //   });
  //
  //   const transactions = new TransactionBuilder()
  //     .add(createAccountInstruction)
  //     .add(mintTokenInstruction)
  //     .getInstructions();
  //
  //   const latestBlockhash = await this.solanaBlockchainUtils
  //     .getUmi()
  //     .rpc.getLatestBlockhash();
  //
  //   const transaction = this.solanaBlockchainUtils
  //     .getUmi()
  //     .transactions.create({
  //       version: 0,
  //       payer: userWalletAddress,
  //       instructions: transactions,
  //       blockhash: latestBlockhash.blockhash,
  //     });
  //
  //   this.logger.log(
  //     `Creating accounts and minting token ${tokenName} with supply of ${totalSupply} for user ${userWalletPubKey}`,
  //   );
  //   await backendSigner.signTransaction(transaction);
  //
  //   return base58.encode(
  //     this.solanaBlockchainUtils.getUmi().transactions.serialize(transaction),
  //   );
  // }
  // public async createMintToken(
  //   name: string,
  //   symbol: string,
  //   description: string,
  //   metadataUri: string,
  // ) {
  //
  //   const backendDevWallet = proces
  //
  //   const createMintTokenInstruction = SystemProgram.createAccount({
  //
  //   })
  //
  //   const createMintTokens = new Transaction();
  //
  //
  //

  //}
}
