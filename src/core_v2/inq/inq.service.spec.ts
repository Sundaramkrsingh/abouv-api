import { Test, TestingModule } from '@nestjs/testing';
import { InqService } from './inq.service';

describe('InqService', () => {
  let service: InqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InqService],
    }).compile();

    service = module.get<InqService>(InqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
