// get everything working first then add validation
export class CreateTokenMintAccountRequestDto {
  //@IsString()
  //@IsNotEmpty()
  walletAddress: string;
  //@IsString()
  //@IsNotEmpty()
  projectTokenMintPubKey: string;
  //@IsString()
  //@IsNotEmpty()
  tokenMintPubKey: string;
  //@IsString()
  //@IsNotEmpty()
  type: string;
  //@IsString()
  //@IsNotEmpty()
  name: string;
  //@IsString()
  //@IsNotEmpty()
  symbol: string;
  //@IsString()
  //@IsNotEmpty()
  metadataUri: string;
  //@IsString()
  //@IsNotEmpty()
  mintAccountAddress: string;
  //@IsNumber()
  //@IsNotEmpty()
  supply: number;
}
