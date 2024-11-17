import { Test, TestingModule } from '@nestjs/testing';
import { PreqService } from './preq.service';

describe('PreqService', () => {
  let service: PreqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreqService],
    }).compile();

    service = module.get<PreqService>(PreqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
