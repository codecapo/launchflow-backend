export class CreateTokenMintAccountRequestDto {
  walletAddress: string;

  tokenMintPubKey?: string;

  type?: string;

  name?: string;

  symbol?: string;

  metadataUri?: string;

  description?: string;

  supply?: number;

  mintAccountAddress?: string;
}
