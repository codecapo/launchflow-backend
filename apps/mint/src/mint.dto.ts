import { MultipartFile } from '@fastify/multipart';

export class CreateMintTokenRequest {
  userWalletAddress?: string;
  image: MultipartFile;
  name: string;
  symbol: string;
  description: string;
  mintAmount: number;
}
