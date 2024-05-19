import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';
import {
  buildClient,
  CommitmentPolicy,
  KmsKeyringNode,
} from '@aws-crypto/client-node';
import { ConfigModule, ConfigService } from "@nestjs/config";

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [EncryptionService, ConfigService],
    }).compile();

    encryptionService = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(encryptionService).toBeDefined();
  });

  it('manualEncrypt and manualDecrypt nounce', async () => {
    const text = '5b2b590a-e6d5-4405-871c-fb6cdaaf813b';

    const encrypt = await encryptionService.manualEncrypt(text);

    const decrypt = await encryptionService.manualDecrypt(encrypt);

    expect(text).toBe(decrypt);
  });

  it('hash and compare password', async () => {
    const text = '5b2b590a-e6d5-4405-871c-fb6cdaaf813b';

    const hash = await encryptionService.hash(text);

    const compare = await encryptionService.compare(text, hash);

    expect(compare).toBe(true);
  });

  it('kmsEncrypt and kmsDecrypt', async () => {
    const text = '5b2b590a-e6d5-4405-871c-fb6cdaaf813b';

    const encrypt = await encryptionService.kmsEncrypt(text);

    const decrypt = await encryptionService.kmsDecryptAndVerify(encrypt);

    const plainText = Buffer.from(decrypt.Plaintext).toString('utf8');

    expect(text).toBe(plainText);
  });
});
