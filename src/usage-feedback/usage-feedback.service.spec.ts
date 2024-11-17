import { Test, TestingModule } from '@nestjs/testing';
import { UsageFeedbackService } from './usage-feedback.service';

describe('UsageFeedbackService', () => {
  let service: UsageFeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsageFeedbackService],
    }).compile();

    service = module.get<UsageFeedbackService>(UsageFeedbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
