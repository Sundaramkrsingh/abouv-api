import { Test, TestingModule } from '@nestjs/testing';
import { InqController } from './inq.controller';

describe('InqController', () => {
  let controller: InqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InqController],
    }).compile();

    controller = module.get<InqController>(InqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
