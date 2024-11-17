import { Test, TestingModule } from '@nestjs/testing';
import { FeedBackController } from './feed-back.controller';

describe('FeedBackController', () => {
  let controller: FeedBackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedBackController],
    }).compile();

    controller = module.get<FeedBackController>(FeedBackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
