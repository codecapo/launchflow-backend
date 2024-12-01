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
  legacySerialisedTransaction?: string;
  versionedSerialisedTransaction?: string;
  addressLookupTableAccount?: string;
}


export class TransferMintedTokensRequest {
  mintTokenAccountPrivKey: string;
  mintAuthorityPrivateKey: string;
  mintAmount: number;
}

export interface serialisedTransferMintTokenResponse {
  amount: number;
  transactionSignature: string;
}
