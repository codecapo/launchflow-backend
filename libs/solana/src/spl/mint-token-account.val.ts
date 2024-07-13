import { Keypair } from '@metaplex-foundation/umi';

export class MintTokenAccountVal {
  mintKeyPair: Keypair;
  userWalletPubKey: string;
  tokenName: string;
  tokenSymbol: string;
  tokenUri: string;
  sellerFeeBasisPoints: number;
  decimals: number;
  totalSupply: number;
}
