export class BurnTokenRequest {
  tokenAccountPubkey: string;
  mintPubKey: string;
  mintAuthPubKey: string;
  burnAmount: number;
}

export class CloseMintAccountRequest {
  tokenMintAddress: string;
  mintAuthPublicKey: string;
}

export interface RevokeMintAuthorityRequest {
  mintPubKey: string;
  currentMintAuthPubKey: string;
  currentMintAuthPrivKey: string;
}

export interface RevokeFreezeAuthorityRequest {
  mintPubKey: string;
  currentFreezeAuthPubKey: string;
  currentFreezeAuthPrivKey: string;
}

export interface RevokeFreezeAuthorityResponse {
  transactionSignature: string;
}

// Interface definitions
export interface RevokeUpdateAuthorityRequest {
  mintPubKey: string;
  currentUpdateAuthPubKey: string;
  currentUpdateAuthPrivKey: string;
}

export interface RevokeUpdateAuthorityResponse {
  transactionSignature: string;
}

export interface RevokeMetadataUpdateRequest {
  mintPubKey: string;
  currentUpdateAuthPubKey: string;
  currentUpdateAuthPrivKey: string;
}

export interface RevokeMetadataUpdateResponse {
  transactionSignature: string;
}