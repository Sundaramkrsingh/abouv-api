import { Test, TestingModule } from '@nestjs/testing';
import { CoreV2Service } from './core_v2.service';

describe('CoreV2Service', () => {
  let service: CoreV2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreV2Service],
    }).compile();

    service = module.get<CoreV2Service>(CoreV2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
