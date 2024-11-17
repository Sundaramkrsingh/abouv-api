import { Controller, Get, Param } from '@nestjs/common';
import { TestsService } from './tests.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('tests')
@ApiTags('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get('list/:userId')
  async getTestsList(@Param('userId') userId: string) {
    return await this.testsService.getTestsList(+userId);
  }

  @Get('tier3/:tier3Id')
  async getTier3TestsDetails(@Param('tier3Id') tier3Id: string) {
    return await this.testsService.getTier3TestsDetails(+tier3Id);
  }
}
