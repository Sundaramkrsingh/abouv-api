import { Test, TestingModule } from '@nestjs/testing';
import { CoreV2Controller } from './core_v2.controller';

describe('CoreV2Controller', () => {
  let controller: CoreV2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoreV2Controller],
    }).compile();

    controller = module.get<CoreV2Controller>(CoreV2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
