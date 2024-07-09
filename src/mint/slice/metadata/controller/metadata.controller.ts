import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  AssetType,
  MetadataService,
} from '@app/solana/metadata/metadata.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PinataMetadata } from '@pinata/sdk';

@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Post('pin-image')
  @UseInterceptors(FileInterceptor('file'))
  public async createUploadMetadata(@UploadedFile() file: Express.Multer.File) {
    const pinAuth = await this.metadataService.verifyPinAuth();

    console.log(pinAuth);
    console.log(file);

    const pinImageMetadata: PinataMetadata = {
      name: crypto.randomUUID(),
    };

    const imagePin = await this.metadataService.pinFile(
      AssetType.IMAGE,
      pinImageMetadata,
      file,
    );

    const imagePinLink = `${process.env.PINATA_BASE_URL}${imagePin.ipfsHash}`;

    const tokenMetadata: PinataMetadata = {
      name: 'token name',
      symbol: 'token symbol',
      description: 'description',
      image: imagePinLink,
    };

    return await this.metadataService.pinFile(
      AssetType.METADATA,
      tokenMetadata,
    );
  }
}
