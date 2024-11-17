import { Controller, Get, Param } from '@nestjs/common';
import { CoreService } from './core.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('core')
@Controller('core')
export class CoreController {
  constructor(private readonly coreService: CoreService) {}

  @Get(':userId')
  async getCoreData(@Param('userId') userId: string) {
    return await this.coreService.getCoreData(+userId);
  }
}
