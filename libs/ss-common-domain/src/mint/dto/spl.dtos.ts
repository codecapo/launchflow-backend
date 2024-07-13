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
  name: string;
  symbol: string;
  description: string;
  mintToPublishAddress: string;
  mintAmount: number;
}

export class CreateAndMintTokenResponse {
  mintPrivKey: string;
  mintPubkey: string;
  mintAuthPrivKey: string;
  mintAuthPubKey: string;
  serialisedTransaction: string;
}

/*
* {
    "name": "YELLOW BIRDY",
    "symbol": "$YBIRDY",
    "description": "Lucky yellow bird, mint token and 10x your investment!!!!",
    "mintToPublishAddress": "GVwWKQYQ7JhPcZ6vJjTAi4qnymgQkcgEiH3JFGYUKWDW",
    "mintAmount": 1000
}
* */
