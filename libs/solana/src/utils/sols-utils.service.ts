import { Injectable, Logger } from '@nestjs/common';
import * as base58 from 'bs58';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { createSignerFromKeypair, Keypair } from '@metaplex-foundation/umi';

@Injectable()
export class SolsUtils {
  private endpoint: string = process.env.QUICKNODE_ENDPOINT;
  private privKey: string = process.env.BACKEND_PRIV_KEY;
  private umi = createUmi(this.endpoint).use(mplTokenMetadata());
  private logger: Logger = new Logger(SolsUtils.name);
  constructor() {}

  public getUmi() {
    return this.umi;
  }
  public async getEndpointInfo() {
    return this.umi.rpc.getEndpoint();
  }

  public async recreateMinKeyPair(mintPrivKey: string) {
    const decodedPrivKey = base58.decode(mintPrivKey);
    return this.umi.eddsa.createKeypairFromSecretKey(decodedPrivKey);
  }

  public async getSolStackBackendSigner() {
    const decodedPrivKey = base58.decode(this.privKey);
    return this.umi.eddsa.createKeypairFromSecretKey(decodedPrivKey);
  }

  public async getLatestBlockhash() {
    return await this.umi.rpc.getLatestBlockhash();
  }

  public async getMintSignerKeyPair(mintKeyPair: Keypair) {
    return createSignerFromKeypair(this.umi, mintKeyPair);
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
}
