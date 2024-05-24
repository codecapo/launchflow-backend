import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { CreateTokenMintAccountService } from '../service/create.token-mint-account.service';

import { CreateMintTokenSupplyService } from '../service/create.mint-token-supply.service';
import { CreateMintTokenSupplyDto } from "@app/ss-common-domain/mint/dto/create.mint-token-supply.dto";
import { CreateTokenMintAccountRequestDto } from "@app/ss-common-domain/mint/dto/create.token-mint-account.request.dto";

@Controller('standard-token')
export class SplMintController {
  constructor(
    private readonly createTokenMintAccountService: CreateTokenMintAccountService,
    private readonly createMintTokenSupply: CreateMintTokenSupplyService,
  ) {}

  @Post('create/token-mint-account')
  @HttpCode(201)
  async createMintTokenAccount(
    @Body() createTokenMintAccountRequestDto: CreateTokenMintAccountRequestDto,
  ) {
    try {
      return await this.createTokenMintAccountService.createTokenMintAccount(
        createTokenMintAccountRequestDto,
      );
    } catch (error) {
      throw new BadRequestException(
        'Please provide all fields to create token',
      );
    }
  }

  @Post('mint/token-supply')
  @HttpCode(201)
  async mintTokenSupply(
    @Body() createMintTokenSupplyDto: CreateMintTokenSupplyDto,
  ) {
    try {
      return await this.createMintTokenSupply.mintProjectTokenSupply(
        createMintTokenSupplyDto,
      );
    } catch (error) {
      throw new BadRequestException(
        'Please provide wallet address and mint token address to mint token supply',
      );
    }
  }
}
