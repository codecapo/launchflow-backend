import { Test, TestingModule } from '@nestjs/testing';
import { LaunchController } from './launch.controller';
import { LaunchService } from './launch.service';

describe('LaunchController', () => {
  let launchController: LaunchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LaunchController],
      providers: [LaunchService],
    }).compile();

    launchController = app.get<LaunchController>(LaunchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(launchController.getHello()).toBe('Hello World!');
    });
  });
});
