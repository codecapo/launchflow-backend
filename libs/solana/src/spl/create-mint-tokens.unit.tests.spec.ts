import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CreateTokenAccountMintTokenService } from '@app/solana';

describe('SolanaBlockchainService', () => {
  let service: CreateTokenAccountMintTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [CreateTokenAccountMintTokenService],
    }).compile();

    service = module.get<CreateTokenAccountMintTokenService>(
      CreateTokenAccountMintTokenService,
    );
  });

  it('should be defined', async () => {
    //console.log(await service.getEndpointInfo());
    //console.log(await service.initialiseBackendKeyPair());
    expect(service).toBeDefined();
  });
});
