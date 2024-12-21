import { Test, TestingModule } from '@nestjs/testing';
import { RunController } from './run.controller';
import { RunService } from './run.service';

describe('RunController', () => {
  let runController: RunController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RunController],
      providers: [RunService],
    }).compile();

    runController = app.get<RunController>(RunController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(runController.getHello()).toBe('Hello World!');
    });
  });
});
