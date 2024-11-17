// stage-history.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { StageService } from './stage.service';
import { ApiParam } from '@nestjs/swagger';

@Controller('stage')
export class StageController {
  constructor(private readonly stageHistoryService: StageService) {}

  @Get(':userId')
  async getOrCreateStageHistory(@Param('userId') userId: string) {
    // Check if StageHistory exists for the given user
    let stageHistory = await this.stageHistoryService.getStageHistory(+userId);

    // If StageHistory doesn't exist, create one - for now with default values
    if (!stageHistory) {
      stageHistory = await this.stageHistoryService.createStageHistory(+userId);
    }

    return stageHistory;
  }

  @ApiParam({ name: 'userId', type: 'string' })
  @Get(':userId/post-assessment')
  async getPostAssessmentDtls(@Param('userId') userId: number) {
    return await this.stageHistoryService.getPostAssessmentDtls(+userId);
  }
}
