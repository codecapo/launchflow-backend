import {
  Connection,
  Keypair,
  NONCE_ACCOUNT_LENGTH,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import * as base58 from 'bs58';
import { CreateNonceAccountResponse } from '@app/ss-common-domain/mint/dto/spl.dtos';
import { SolsUtils } from '@app/solana/utils/sols-utils.service';
import { Logger } from '@nestjs/common';

export class CreateNonceService {
  private readonly logger: Logger = new Logger();
  private connection = new Connection(process.env.RPC_ENDPOINT);

  constructor(private readonly solsUtils: SolsUtils) {}

  public async createNonceAccount() {
    const chosenBackendDevWallet = await this.solsUtils.walletRandomiser();
    const backendWallet = Keypair.fromSecretKey(
      base58.decode(chosenBackendDevWallet.privKey),
    );

    const nonceAccount = Keypair.generate();
    const nonceAccountAuth = Keypair.generate();

    const createNonceAccount = SystemProgram.createAccount({
      fromPubkey: backendWallet.publicKey,
      newAccountPubkey: nonceAccount.publicKey,
      lamports:
        await this.connection.getMinimumBalanceForRentExemption(
          NONCE_ACCOUNT_LENGTH,
        ),
      space: NONCE_ACCOUNT_LENGTH,
      programId: SystemProgram.programId,
    });

    const initNonceAccount = SystemProgram.nonceInitialize({
      noncePubkey: nonceAccount.publicKey,
      authorizedPubkey: nonceAccountAuth.publicKey,
    });

    const transaction = new Transaction().add(
      createNonceAccount,
      initNonceAccount,
    );

    const sig = await this.connection.sendTransaction(transaction, [
      backendWallet,
      nonceAccount,
    ]);

    console.log(sig);

    const createNonceAccountResponse: CreateNonceAccountResponse = {
      createNonceAccountSignature: sig,
      nonceAccountAuthPrivKey: base58.encode(nonceAccountAuth.secretKey),
      nonceAccountAuthPubKey: nonceAccountAuth.publicKey.toBase58(),
      nonceAccountPrivKey: base58.encode(nonceAccount.secretKey),
      noncePublicKey: nonceAccount.publicKey.toBase58(),
    };

    const confirm = await this.connection.confirmTransaction(sig, 'finalized');

    if (confirm) {
      return createNonceAccountResponse;
    } else {
      return;
    }
  }
}
