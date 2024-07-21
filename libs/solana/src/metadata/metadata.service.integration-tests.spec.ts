import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MetadataService } from '@app/solana/metadata/metadata.service';
import { AwsModule } from '@app/aws';
import * as fs from 'node:fs';

describe('Metadata Pinning Service Tests', () => {
  let metadataService: MetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AwsModule],
      providers: [MetadataService],
    }).compile();

    metadataService = module.get<MetadataService>(MetadataService);
  });

  it('should be defined', async () => {
    expect(metadataService).toBeDefined();
  });

  it('should pin image directly', async () => {
    const fsFile = Buffer.from(fs.readFileSync('./yellowfile.jpeg', 'binary'));
    const file: Express.Multer.File = {
      buffer: fsFile,
      destination: '',
      encoding: '',
      fieldname: 'files',
      filename: 'yellofile.jpeg',
      mimetype: '',
      originalname: '',
      path: '',
      size: fsFile.length,
      stream: undefined,
    };
    const pin = await metadataService.pinFile(file);

    console.log(pin);
  });

  it('should pin image from controller post', async () => {
    expect(metadataService).toBeDefined();
  });
});
