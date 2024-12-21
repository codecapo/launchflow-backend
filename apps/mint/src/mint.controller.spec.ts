import { Test, TestingModule } from '@nestjs/testing';
import { MintController } from './mint.controller';
import { MintService } from './mint.service';

describe('MintController', () => {
  let mintController: MintController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MintController],
      providers: [MintService],
    }).compile();

    mintController = app.get<MintController>(MintController);
  });

  describe('root', () => {});
});
