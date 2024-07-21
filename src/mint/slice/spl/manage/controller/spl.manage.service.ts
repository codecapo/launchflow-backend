import { RevokeMintAuthorityResponse } from '@app/ss-common-domain/mint/dto/spl.dtos';
import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
} from '@solana/web3.js';
import * as base58 from 'bs58';
import {
  AuthorityType,
  createBurnCheckedInstruction,
  createSetAuthorityInstruction,
} from '@solana/spl-token';
import { Injectable, Logger } from '@nestjs/common';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';

@Injectable()
export class SplManageService {
  private logger: Logger = new Logger();
  private connection = new Connection(process.env.RPC_ENDPOINT);

  constructor(private readonly solsUtils: SolsUtils) {}

  public async revokeMintAuthority(
    mintPubKey: string,
    currentMintAuthPubKey,
  ): Promise<RevokeMintAuthorityResponse> {
    const chosenBackendDevWallet = await this.solsUtils.walletRandomiser();
    const backendWallet = Keypair.fromSecretKey(
      base58.decode(chosenBackendDevWallet.privKey),
    );

    const backendDevWalletSigner: Signer = {
      publicKey: backendWallet.publicKey,
      secretKey: backendWallet.secretKey,
    };

    const mintTokenPublicKey = new PublicKey(mintPubKey);
    const currentAuthorityPublicKey = new PublicKey(currentMintAuthPubKey);
    const setAuthority = createSetAuthorityInstruction(
      mintTokenPublicKey,
      currentAuthorityPublicKey,
      AuthorityType.MintTokens,
      null,
    );

    const transaction = new Transaction().add(setAuthority);

    const send = await this.connection.sendTransaction(transaction, [
      backendDevWalletSigner,
    ]);

    const confirm = await this.connection.confirmTransaction(send, 'confirmed');

    if (confirm) {
      const response: RevokeMintAuthorityResponse = {
        transactionSignature: send,
      };

      this.logger.log(`Mint authority revoked for ${mintPubKey}`);

      return response;
    }
  }

  public async burnToken(
    tokenAccountPubkey: string,
    mintPubKey: string,
    mintAuthPubKey: string,
    burnAmount: number,
  ) {
    const tokenAccountPublicKey = new PublicKey(tokenAccountPubkey);
    const mintTokenPublicKey = new PublicKey(mintPubKey);
    const mintAuthority = new PublicKey(mintAuthPubKey);
    const num = BigInt(burnAmount) * BigInt(1_000_000_000);

    const burn = createBurnCheckedInstruction(
      tokenAccountPublicKey,
      mintTokenPublicKey,
      mintAuthority,
      num,
      9,
    );

    const transaction = new Transaction().add(burn);

    this.logger.log(`Burning ${burnAmount} Tokens for ${tokenAccountPubkey}`);

    return base58.encode(
      transaction.serialize({ requireAllSignatures: false }),
    );
  }
}
