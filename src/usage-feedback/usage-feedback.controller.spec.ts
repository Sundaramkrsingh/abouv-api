import { Test, TestingModule } from '@nestjs/testing';
import { UsageFeedbackController } from './usage-feedback.controller';

describe('UsageFeedbackController', () => {
  let controller: UsageFeedbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsageFeedbackController],
    }).compile();

    controller = module.get<UsageFeedbackController>(UsageFeedbackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
