import { Controller, HttpCode, Post } from '@nestjs/common';
import { DraftMintService } from './draft.mint.service';
import { DraftMintDto } from '@app/ss-common-domain/mint/dto/draft-mint.dto';

@Controller()
export class DraftMintController {
  constructor(private readonly draftMintService: DraftMintService) {}

  @Post()
  @HttpCode(201)
  async createDraftMint(userWalletAddress: string): Promise<DraftMintDto> {
    return await this.draftMintService.createDraftMint(userWalletAddress);
  }
}
