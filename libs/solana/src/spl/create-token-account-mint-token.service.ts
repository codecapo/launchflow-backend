import { Injectable, Logger } from '@nestjs/common';
import * as base58 from 'bs58';
import {
  createV1,
  mintV1,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  createNoopSigner,
  createSignerFromKeypair,
  Keypair,
  percentAmount,
  publicKey,
  some,
  TransactionBuilder,
} from '@metaplex-foundation/umi';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import { MintTokenAccountVal } from '@app/solana/spl/mint-token-account.val';
import { MintTokenSupplyVal } from '@app/solana/spl/mint-token-supply.val';

@Injectable()
export class CreateTokenAccountMintTokenService {
  private logger: Logger = new Logger();

  constructor(private readonly solanaBlockchainUtils: SolsUtils) {}

  public async createMintTokenAccount(
    mintTokenAccount: MintTokenAccountVal,
  ): Promise<string> {
    const mintSigner = await this.solanaBlockchainUtils.getMintSignerKeyPair(
      mintTokenAccount.mintKeyPair,
    );
    const userPubKey = publicKey(mintTokenAccount.userWalletPubKey);
    const userWalletNoopSigner = createNoopSigner(userPubKey);
    const solstackKeyPair =
      await this.solanaBlockchainUtils.getSolStackBackendSigner();
    const backendSigner = createSignerFromKeypair(
      this.solanaBlockchainUtils.getUmi(),
      solstackKeyPair,
    );

    const createAccountInstruction = createV1(
      this.solanaBlockchainUtils.getUmi(),
      {
        mint: mintSigner,
        authority: userWalletNoopSigner,
        name: mintTokenAccount.tokenName,
        symbol: mintTokenAccount.tokenSymbol,
        uri: mintTokenAccount.tokenUri,
        sellerFeeBasisPoints: percentAmount(
          mintTokenAccount.sellerFeeBasisPoints,
        ),
        decimals: some(mintTokenAccount.decimals),
        tokenStandard: TokenStandard.NonFungible,
      },
    );

    const transactions = new TransactionBuilder()
      .add(createAccountInstruction)
      .getInstructions();

    const latestBlockhash =
      await this.solanaBlockchainUtils.getLatestBlockhash();

    const transaction = this.solanaBlockchainUtils
      .getUmi()
      .transactions.create({
        version: 0,
        payer: userPubKey,
        instructions: transactions,
        blockhash: latestBlockhash.blockhash,
      });

    this.logger.log(
      `Creating mint token account for ${mintTokenAccount.tokenName} with supply of ${mintTokenAccount.totalSupply} for user ${mintTokenAccount.userWalletPubKey}`,
    );

    await backendSigner.signTransaction(transaction);

    return base58.encode(
      this.solanaBlockchainUtils.getUmi().transactions.serialize(transaction),
    );
  }

  public async mintTokenSupply(mintSupplyVal: MintTokenSupplyVal) {
    const mintSigner = createSignerFromKeypair(
      this.solanaBlockchainUtils.getUmi(),
      mintSupplyVal.mintKeyPair,
    );
    const userPubKey = publicKey(mintSupplyVal.userWalletPubKey);
    const userWalletNoopSigner = createNoopSigner(userPubKey);
    const solstackKeyPair =
      await this.solanaBlockchainUtils.getSolStackBackendSigner();
    const backendSigner = createSignerFromKeypair(
      this.solanaBlockchainUtils.getUmi(),
      solstackKeyPair,
    );

    const mintTokenInstruction = mintV1(this.solanaBlockchainUtils.getUmi(), {
      mint: mintSigner.publicKey,
      authority: userWalletNoopSigner,
      amount: mintSupplyVal.totalSupply,
      tokenOwner: userPubKey,
      tokenStandard: TokenStandard.FungibleAsset,
    });

    const latestBlockhash = await this.solanaBlockchainUtils
      .getUmi()
      .rpc.getLatestBlockhash();

    const transactions = new TransactionBuilder()
      .add(mintTokenInstruction)
      .getInstructions();

    const transaction = this.solanaBlockchainUtils
      .getUmi()
      .transactions.create({
        version: 0,
        payer: userPubKey,
        instructions: transactions,
        blockhash: latestBlockhash.blockhash,
      });

    this.logger.log(
      `Minting token ${mintSupplyVal.tokenName} with supply of ${mintSupplyVal.totalSupply} for user ${mintSupplyVal.userWalletPubKey}`,
    );
    await backendSigner.signTransaction(transaction);

    return base58.encode(
      this.solanaBlockchainUtils.getUmi().transactions.serialize(transaction),
    );
  }

  public async createMintTokenAccountAndMintSupply(
    mintKeyPair: Keypair,
    userWalletPubKey: string,
    tokenName: string,
    tokenSymbol: string,
    tokenUri: string,
    sellerFeeBasisPoints: number,
    decimals: number,
    totalSupply: number,
  ) {
    const mintSigner = createSignerFromKeypair(
      this.solanaBlockchainUtils.getUmi(),
      mintKeyPair,
    );
    const userWalletAddress = publicKey(userWalletPubKey);
    const userWalletNoopSigner = createNoopSigner(userWalletAddress);
    const solStackKeyPair =
      await this.solanaBlockchainUtils.getSolStackBackendSigner();
    const backendSigner = createSignerFromKeypair(
      this.solanaBlockchainUtils.getUmi(),
      solStackKeyPair,
    );

    const createAccountInstruction = createV1(
      this.solanaBlockchainUtils.getUmi(),
      {
        mint: mintSigner,
        authority: userWalletNoopSigner,
        name: tokenName,
        symbol: tokenSymbol,
        uri: tokenUri,
        sellerFeeBasisPoints: percentAmount(sellerFeeBasisPoints),
        decimals: some(decimals),
        tokenStandard: TokenStandard.NonFungible,
      },
    );

    // save keypair into backend, make sure its encrypted
    const mintTokenInstruction = mintV1(this.solanaBlockchainUtils.getUmi(), {
      mint: mintSigner.publicKey,
      authority: userWalletNoopSigner,
      amount: totalSupply,
      tokenOwner: userWalletAddress,
      tokenStandard: TokenStandard.Fungible,
    });

    const transactions = new TransactionBuilder()
      .add(createAccountInstruction)
      .add(mintTokenInstruction)
      .getInstructions();

    const latestBlockhash = await this.solanaBlockchainUtils
      .getUmi()
      .rpc.getLatestBlockhash();

    const transaction = this.solanaBlockchainUtils
      .getUmi()
      .transactions.create({
        version: 0,
        payer: userWalletAddress,
        instructions: transactions,
        blockhash: latestBlockhash.blockhash,
      });

    this.logger.log(
      `Creating accounts and minting token ${tokenName} with supply of ${totalSupply} for user ${userWalletPubKey}`,
    );
    await backendSigner.signTransaction(transaction);

    return base58.encode(
      this.solanaBlockchainUtils.getUmi().transactions.serialize(transaction),
    );
  }
}
