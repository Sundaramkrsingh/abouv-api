/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FacetsReportsService } from './facets-reports.service';
@ApiTags('reports')
@Controller('reports')
export class FacetsReportsController {
  constructor(private readonly facetsReportsService: FacetsReportsService) {}

  @Get(':userId/progression-summary')
  async getProgressionSummaryReport(@Param('userId') userId: string) {
    return await this.facetsReportsService.getProgressionSummary(+userId);
  }

  @Get(':userId/performance-summary')
  async getPerformanceSummaryReport(@Param('userId') userId: string) {
    return await this.facetsReportsService.getPerformanceSummary(+userId);
  }
  @Get(':userId/score-summary')
  async getScoreSummaryReport(@Param('userId') userId: string) {
    return await this.facetsReportsService.getScoreSummary(+userId);
  }
  @Get(':userId/competencies-grades-summary')
  async getCompetenciesGradesSummaryReport(@Param('userId') userId: string) {
    return await this.facetsReportsService.getCompetenciesGradesSummary(
      +userId,
    );
  }

  @Get('/:userId/userStats')
  async getUserStats(@Param('userId') userId: string) {
    return await this.facetsReportsService.getUserStats(+userId);
  }
}
