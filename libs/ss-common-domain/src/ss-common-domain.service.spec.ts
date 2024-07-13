import { Test, TestingModule } from '@nestjs/testing';
import { SsCommonDomainService } from './ss-common-domain.service';

describe('StCommonDomainService', () => {
  let service: SsCommonDomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SsCommonDomainService],
    }).compile();

    service = module.get<SsCommonDomainService>(SsCommonDomainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
