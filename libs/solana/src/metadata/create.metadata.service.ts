import { Injectable, Logger } from '@nestjs/common';
import { PinataMetadata } from '@pinata/sdk';
import {
  AssetType,
  MetadataService,
} from '@app/solana/metadata/metadata.service';
import * as crypto from 'node:crypto';
import { MultipartFile } from '@fastify/multipart';

@Injectable()
export class CreateMetadataService {
  private readonly logger: Logger = new Logger(CreateMetadataService.name);

  constructor(private readonly metadataService: MetadataService) {}

  public async createAndPinMetadataForSplToken(
    image: MultipartFile,
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

    const imageBuffer = await image.toBuffer()
    const imagePin = await this.metadataService.pinFile(
      AssetType.IMAGE,
      pinImageMetadata,
      imageBuffer,
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
