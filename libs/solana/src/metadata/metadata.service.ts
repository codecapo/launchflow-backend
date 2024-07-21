import { PinataMetadata } from '@pinata/sdk';

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export enum AssetType {
  IMAGE = 0,
  METADATA = 1,
}

export class MetadataPinResponse {
  status: string;
  statusCode: number;
  message: string;
  ipfsHash?: string;
  pinSize?: number;
  timeStamp?: string;
  uri?: string;
}

interface UploadMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
}

@Injectable()
export class MetadataService {
  private logger: Logger = new Logger(MetadataService.name);
  constructor() {}

  public async verifyPinAuth() {
    const res = await axios.get(`${process.env.PINATA_ENDPOINT_TEST_AUTH}`, {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_API_JWT}`,
      },
    });

    this.logger.log('Solana Stack is authenticated with Pinata');
    return 200 === res.status.valueOf() || 201 === res.status.valueOf();
  }

  // doesn't need the file on the second upload to crete the metadata
  public async pinFile(
    assetType: AssetType,
    pinataMetadata: PinataMetadata,
    asset?: Express.Multer.File,
  ) {
    const formData = new FormData();
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    if (assetType === AssetType.IMAGE && asset) {
      formData.append('file', new Blob([asset.buffer]));
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
    } else if (assetType === AssetType.METADATA) {
      //formData.append('file', new Blob([asset.buffer]));
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
    } else {
      throw new Error('Non supported asset type provided');
    }

    const res = await axios.post(
      `${process.env.PINATA_ENDPOINT_PIN_FILE_TO_IPFS}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_API_JWT}`,
        },
      },
    );

    if (!('OK' === res.statusText)) {
      const pinFileNok: MetadataPinResponse = {
        statusCode: 400,
        status: 'Bad request',
        message: 'There was a issue with pinning please check and try again',
      };
      return pinFileNok;
    } else {
      const pinFileOk: MetadataPinResponse = {
        ipfsHash: res.data.IpfsHash,
        pinSize: res.data.PinSize,
        status: res.statusText,
        statusCode: res.status,
        timeStamp: res.data.Timestamp,
        message: 'Successfully pinned file to ipfs',
      };

      return pinFileOk;
    }
  }

  public async pinJson(
    tokenName,
    tokenSymbol,
    tokenDescription,
    tokenImageLink,
  ) {
    if (!(tokenName && tokenSymbol && tokenDescription && tokenImageLink))
      throw Error('Please provide all fields for spl metadata');

    const jsonToUpload: UploadMetadata = {
      name: tokenName,
      symbol: tokenSymbol,
      description: tokenDescription,
      image: tokenImageLink,
    };

    const res = await axios.post(
      `${process.env.PINATA_ENDPOINT_PIN_JSON_TO_IPFS}`,
      jsonToUpload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_API_JWT}`,
        },
      },
    );

    if (!('OK' === res.statusText)) {
      const pinFileNok: MetadataPinResponse = {
        statusCode: 400,
        status: 'Bad request',
        message: 'There was a issue with pinning please check and try again',
      };
      return pinFileNok;
    } else {
      const pinFileOk: MetadataPinResponse = {
        ipfsHash: res.data.IpfsHash,
        pinSize: res.data.PinSize,
        status: res.statusText,
        statusCode: res.status,
        timeStamp: res.data.Timestamp,
        message: 'Successfully pinned file to ipfs',
        uri: process.env.PINATA_BASE_URL + res.data.IpfsHash,
      };

      this.logger.log('Uploaded metadata to ipfs');
      this.logger.log(
        `Metadata Uri ${process.env.PINATA_BASE_URL + res.data.IpfsHash}`,
      );
      return pinFileOk;
    }
  }
}
