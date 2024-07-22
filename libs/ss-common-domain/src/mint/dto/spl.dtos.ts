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

export class MintTokenResponse {
  transactionSignature: string;
}

export class CreateNonceAccountResponse {
  nonceAccountPrivKey: string;
  noncePublicKey: string;
  nonceAccountAuthPrivKey: string;
  nonceAccountAuthPubKey: string;
  createNonceAccountSignature: string;
}

export class SendSerialisedTransaction {
  serialisedTransaction: string;
}

export class MintTokenSerialised {
  mintTokenAccountPublicKey: string;
  mintTokenAccountPrivKey: string;
  mintedToAddress: string;
  mintAuthorityPublicKey: string;
  mintAuthorityPrivateKey: string;
  mintTokenAmount: number;
}

export class CreateTokenSerialisedResponse {
  serialisedTransaction: string;
  mintPubkey: string;
  mintPrivKey: string;
  mintAuthPubKey: string;
  mintAuthPrivKey: string;
}

export class CreateAndMintTokenRequest {
  type?: string;
  userWalletAddress?: string;
  name: string;
  symbol: string;
  description: string;
  mintAmount: number;
  unmodifiableMetadata?: boolean;
  revokeMintAuthority?: boolean;
  revokeFreezeAuthority?: boolean;
}

export class CreateAndMintTokenResponse {
  metadataUri?: string;
  mintPrivKey: string;
  mintPubkey: string;
  mintAuthPrivKey: string;
  mintAuthPubKey: string;
  serialisedTransaction: string;
}

export class RevokeMintAuthorityResponse {
  transactionSignature: string;
}

export class CreateAndMintSerialisedTransactionWithUserResponse {
  serialisedTransaction: string;
  userWalletAddress: string;
}
