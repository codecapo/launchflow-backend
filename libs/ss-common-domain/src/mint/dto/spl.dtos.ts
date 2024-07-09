export class CreateMintTokenRequest {
  name: string;
  symbol: string;
  description: string;
  mintAmount?: number;
}

export class CreateMintTokenResponse {
  mintPrivateKey: string;
  mintPublicKey: string;
  mintAuthorityPrivateKey: string;
  mintAuthorityPublicKey: string;
  createTokenTransactionSignature: string;
}
