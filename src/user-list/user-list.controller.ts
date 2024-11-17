import { Controller, Get } from '@nestjs/common';
import { UserListService } from './user-list.service';

@Controller('user-list')
export class UserListController {
  constructor(private readonly userListService: UserListService) {}

  @Get()
  async getAllUsers() {
    const users = await this.userListService.getAllUsersSummary();
    return users;
  }
}
