import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateAndMintTokenRequest,
  CreateMintTokenRequest,
  CreateTokenSerialisedResponse,
  MintTokenSerialised,
  SendSerialisedTransaction,
} from '@app/ss-common-domain/mint/dto/spl.dtos';
import { SerialisedCreateMintTokenService } from '@app/solana';
import { CreateNonceService } from '@app/solana/spl/create-nonce.service';

@Controller('spl')
export class SplMintController {
  constructor(
    private readonly createNonceService: CreateNonceService,
    private readonly serialisedCreateMintTokenService: SerialisedCreateMintTokenService,
  ) {}

  @Post('create/serialised')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async createMintSplTokenSerialised(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMintToken: CreateMintTokenRequest,
  ): Promise<CreateTokenSerialisedResponse> {
    if (!file)
      throw new BadRequestException({
        message: 'image does not exist, please attach image',
      });

    return await this.serialisedCreateMintTokenService.createToken(
      createMintToken,
      file,
    );
  }

  @Post('mint/serialised')
  @HttpCode(HttpStatus.OK)
  async mintSplTokenSerialised(
    @Body() mintTokenSerialised: MintTokenSerialised,
  ) {
    return await this.serialisedCreateMintTokenService.mintToken(
      mintTokenSerialised,
    );
  }

  @Post('nonce/create')
  @HttpCode(HttpStatus.OK)
  async createNonceAccount() {
    return await this.createNonceService.createNonceAccount();
  }

  @Post('serialised/transaction/send')
  @HttpCode(HttpStatus.OK)
  async sendSerialisedTransaction(@Body() send: SendSerialisedTransaction) {
    return await this.serialisedCreateMintTokenService.sendSerialisedTransaction(
      send.serialisedTransaction,
    );
  }

  @Post('create-mint')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  async createAndMintTokenSerialised(
    @UploadedFile() image: Express.Multer.File,
    @Body() createMintToken: CreateAndMintTokenRequest,
  ): Promise<CreateTokenSerialisedResponse> {
    return await this.serialisedCreateMintTokenService.createAndMintSupplyToken(
      image,
      createMintToken,
    );
  }
}
