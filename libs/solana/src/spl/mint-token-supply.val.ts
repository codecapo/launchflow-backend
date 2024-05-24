import { Keypair } from '@metaplex-foundation/umi';

export class MintTokenSupplyVal {
  mintKeyPair: Keypair;
  userWalletPubKey: string;
  totalSupply: number;
  tokenName: string;
}
