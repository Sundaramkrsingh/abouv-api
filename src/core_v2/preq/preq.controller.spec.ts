import { Test, TestingModule } from '@nestjs/testing';
import { PreqController } from './preq.controller';

describe('PreqController', () => {
  let controller: PreqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreqController],
    }).compile();

    controller = module.get<PreqController>(PreqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
