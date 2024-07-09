import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { DraftMintService } from './draft.mint.service';
import { DraftMintDto } from '@app/ss-common-domain/mint/dto/draft-mint.dto';

class DraftMintTokenRequestDto {
  userWalletAddress: string;
}

@Controller('draft')
export class DraftMintController {
  constructor(private readonly draftMintService: DraftMintService) {}

  @Post('project-token')
  @HttpCode(201)
  async createDraftMint(
    @Body() draftMintTokenRequestDto: DraftMintTokenRequestDto,
  ): Promise<DraftMintDto> {

    console.log(draftMintTokenRequestDto);

    return await this.draftMintService.createDraftMint(
      draftMintTokenRequestDto.userWalletAddress,
    );
  }
}
