import { Test, TestingModule } from '@nestjs/testing';
import { PostqController } from './postq.controller';
import { PostqService } from './postq.service';

describe('PostqController', () => {
  let controller: PostqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostqController],
      providers: [PostqService],
    }).compile();

    controller = module.get<PostqController>(PostqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
