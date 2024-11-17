import { Test, TestingModule } from '@nestjs/testing';
import { QahistoryController } from './qahistory.controller';

describe('QahistoryController', () => {
  let controller: QahistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QahistoryController],
    }).compile();

    controller = module.get<QahistoryController>(QahistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
