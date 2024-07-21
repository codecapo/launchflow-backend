import { Injectable, Logger } from '@nestjs/common';
import { PinataMetadata } from '@pinata/sdk';
import {
  AssetType,
  MetadataService,
} from '@app/solana/metadata/metadata.service';
import * as crypto from 'node:crypto';

@Injectable()
export class CreateMetadataService {
  private readonly logger: Logger = new Logger();

  constructor(private readonly metadataService: MetadataService) {}

  public async createAndPinMetadataForSplToken(
    image: Express.Multer.File,
    tokenName: string,
    tokenSymbol: string,
    tokenDescription: string,
  ) {
    const pinAuth = await this.metadataService.verifyPinAuth();

    if (!pinAuth)
      throw Error(
        'Pinata credentials not authorised or invalid, please generate new one',
      );

    const pinImageMetadata: PinataMetadata = {
      name: crypto.randomUUID().toString(),
    };

    const imagePin = await this.metadataService.pinFile(
      AssetType.IMAGE,
      pinImageMetadata,
      image,
    );

    const imagePinLink = `${process.env.PINATA_BASE_URL}${imagePin.ipfsHash}`;

    return await this.metadataService.pinJson(
      tokenName,
      tokenSymbol,
      tokenDescription,
      imagePinLink,
    );
  }
}
