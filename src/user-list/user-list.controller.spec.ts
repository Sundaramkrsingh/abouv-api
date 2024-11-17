import { Test, TestingModule } from '@nestjs/testing';
import { UserListController } from './user-list.controller';

describe('UserListController', () => {
  let controller: UserListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserListController],
    }).compile();

    controller = module.get<UserListController>(UserListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
