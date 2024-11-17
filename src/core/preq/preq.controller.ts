import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { PreqService } from './preq.service';
import { preQDtoSwaggerSchema } from './preq.swagger.schemas';
import { preQDtoSwaggerExample } from './preq.swagger.example';

@ApiTags('core')
@Controller('core')
export class PreqController {
  constructor(private readonly preqService: PreqService) {}

  @Post(':userId/trumps')
  @ApiBody({
    schema: preQDtoSwaggerSchema,
    examples: preQDtoSwaggerExample,
  })
  async createPreqTrumps(@Param('userId') userId: string, @Body() data: any) {
    return await this.preqService.createPreqTrumps(+userId, data);
  }

  @Get(':userId/trumps')
  async getPreqTrumps(@Param('userId') userId: string) {
    return await this.preqService.getPreqTrumps(+userId);
  }

  @Patch(':userId/reset-all-trumps')
  async resetAllTrumps(@Param('userId') userId: string) {
    return await this.preqService.resetAllTrumps(+userId);
  }
}
