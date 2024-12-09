import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { SplManageService } from './spl.manage.service';
import {
  RevokeFreezeAuthorityRequest,
  RevokeMetadataUpdateRequest,
  RevokeMintAuthorityRequest,
  RevokeUpdateAuthorityRequest,
} from './spl.manage.dto';

interface BurnRaydiumTokens {
  lpMint: string;
  lpTokenAccount: string;
  amountToBurn: number;
}

@Controller('spl')
export class SplManageController {
  constructor(private readonly manageTokenService: SplManageService) {}

  @Post('admin/burn-tokens')
  async burnToken(@Body() burnRaydiumTokens: BurnRaydiumTokens) {
    console.log(burnRaydiumTokens);

    await this.manageTokenService.burnRaydiumLPToken(
      burnRaydiumTokens.lpMint,
      burnRaydiumTokens.lpTokenAccount,
      burnRaydiumTokens.amountToBurn,
    );
  }

  @Post('admin/revoke-mint-authority')
  async removeMintAuthority(
    @Body() revokeMintAuthority: RevokeMintAuthorityRequest,
  ) {
    try {
      return await this.manageTokenService.revokeMintAuthority(
        revokeMintAuthority,
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Could not revoke mint authority',
      });
    }
  }

  @Post('admin/revoke-freeze-authority')
  async removeFreezeAuthority(
    @Body() revokeFreezeAuthority: RevokeFreezeAuthorityRequest,
  ) {
    try {
      return await this.manageTokenService.revokeFreezeAuthority(
        revokeFreezeAuthority,
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Could not revoke FreezeAuthority',
      });
    }
  }

  @Post('admin/revoke-update-authority')
  async revokeUpdateAuthority(
    @Body() revokeUpdateAuthority: RevokeUpdateAuthorityRequest,
  ) {
    try {
      return await this.manageTokenService.revokeUpdateAuthority(
        revokeUpdateAuthority,
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Could not revoke FreezeAuthority',
      });
    }
  }

  @Post('admin/revoke-update-token-metadata-authority')
  async revokeUpdateTokenMetadataAuthority(
    @Body() revokeMetadataUpdateRequest: RevokeMetadataUpdateRequest,
  ) {
    try {
      return await this.manageTokenService.revokeMetadataUpdateAuthority(
        revokeMetadataUpdateRequest,
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Could not revoke FreezeAuthority',
      });
    }
  }
}
