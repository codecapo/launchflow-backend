import { Injectable, Logger } from '@nestjs/common';
import * as base58 from 'bs58';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

import { EncryptionService } from '@app/encryption';
import { Keypair, PublicKey, Signer } from '@solana/web3.js';

interface DevWallet {
  privKey: string;
  pubKey: string;
}

@Injectable()
export class SolsUtils {
  private endpoint: string = process.env.RPC_ENDPOINT;
  private privKey: string = process.env.BACKEND_PRIV_KEY;
  private umi = createUmi(this.endpoint);

  private logger: Logger = new Logger(SolsUtils.name);
  constructor(private readonly encryptionService: EncryptionService) {}

  public async decryptAndRecreateMinKeyPair(mintPrivKey: string) {
    const decryptedPrivKey =
      await this.encryptionService.kmsDecryptAndVerify(mintPrivKey);
    const decodedPrivKey = base58.decode(decryptedPrivKey);
    return this.umi.eddsa.createKeypairFromSecretKey(decodedPrivKey);
  }

  public async initialiseMintKeyPair() {
    return this.umi.eddsa.generateKeypair();
  }

  public async encodeMintPrivKey(privKey: Uint8Array): Promise<string> {
    return base58.encode(privKey);
  }

  public async decodeMintPrivKey(privKey: string): Promise<Uint8Array> {
    return base58.decode(privKey);
  }

  public async walletRandomiser() {
    const walletPick = Math.floor(Math.random() * 4) + 1;

    const walletDetails: DevWallet[] = [
      {
        privKey: `${process.env.SOLSTACK_DEV_ONE_PRIV_KEY}`,
        pubKey: `${process.env.SOLSTACK_DEV_ONE_PUB_KEY}`,
      },
      {
        privKey: `${process.env.SOLSTACK_DEV_TWO_PRIV_KEY}`,
        pubKey: `${process.env.SOLSTACK_DEV_TWO_PUB_KEY}`,
      },
      {
        privKey: `${process.env.SOLSTACK_DEV_THREE_PRIV_KEY}`,
        pubKey: `${process.env.SOLSTACK_DEV_THREE_PUB_KEY}`,
      },
      {
        privKey: `${process.env.SOLSTACK_DEV_FOUR_PRIV_KEY}`,
        pubKey: `${process.env.SOLSTACK_DEV_FOUR_PUB_KEY}`,
      },
      {
        privKey: `${process.env.SOLSTACK_DEV_FIVE_PRIV_KEY}`,
        pubKey: `${process.env.SOLSTACK_DEV_FIVE_PUB_KEY}`,
      },
    ];

    const picked = walletDetails[walletPick];

    this.logger.log(
      `Dev wallet at position ${walletPick} with address ${picked.pubKey} was picked`,
    );

    return walletDetails[walletPick];
  }

  public async getNonceAccount() {
    const nonceAccountPubkey = new PublicKey(process.env.NONCE_ACCOUNT_PUB_KEY);

    const nonceAccountAuth = Keypair.fromSecretKey(
      base58.decode(process.env.NONCE_ACCOUNT_AUTH_PRIV_KEY),
    );

    const nonceAccountAuthSigner: Signer = {
      publicKey: nonceAccountAuth.publicKey,
      secretKey: nonceAccountAuth.secretKey,
    };
  }
}
