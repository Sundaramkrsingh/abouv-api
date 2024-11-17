import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import { RankingFilterSchema } from './dto/top-ranking.dto';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('top-ranking')
  @UsePipes(new ZodValidationPipe(RankingFilterSchema))
  async getTopUserList(@Query() filter: any) {
    return await this.statsService.getTopUserList(filter);
  }
}
