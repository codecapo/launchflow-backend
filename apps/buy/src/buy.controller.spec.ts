import { Test, TestingModule } from '@nestjs/testing';
import { BuyController } from './buy.controller';
import { BuyService } from './buy.service';

describe('BuyController', () => {
  let buyController: BuyController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BuyController],
      providers: [BuyService],
    }).compile();

    buyController = app.get<BuyController>(BuyController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(buyController.getHello()).toBe('Hello World!');
    });
  });
});
