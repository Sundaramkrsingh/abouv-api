import { Test, TestingModule } from '@nestjs/testing';
import { PostqService } from './postq.service';

describe('PostqService', () => {
  let service: PostqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostqService],
    }).compile();

    service = module.get<PostqService>(PostqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
