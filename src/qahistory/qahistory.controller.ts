import { Controller, Post, Body } from '@nestjs/common';
import { QaHistoryService } from './qahistory.service';

@Controller('qahistory')
export class QaHistoryController {
  constructor(private readonly userQaHistoryService: QaHistoryService) {}

  @Post()
  async findOrCreate(@Body() getDto) {
    const { userId, limit } = getDto;
    let userQaHistory = await this.userQaHistoryService.findAll(getDto);

    if (userQaHistory.length === 0) {
      await this.userQaHistoryService.create({ userId });
      userQaHistory = await this.userQaHistoryService.findAll({
        userId,
        limit,
      });
    }

    return userQaHistory;
  }
}
