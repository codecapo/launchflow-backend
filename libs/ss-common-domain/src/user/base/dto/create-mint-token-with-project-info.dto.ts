export interface CreateMintTokenWithProjectInfoDto {
  userWalletAddress: string;
  type: string;
  name: string;
  symbol: string;
  metadataUri?: string;
  description: string;
  supply: number;
  mintPrivKey?: string;
  mintPubKey: string;
  mintAuthPrivKey: string;
  mintAuthPubKey: string;
  serialisedTransaction?: string;
}
