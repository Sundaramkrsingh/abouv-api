import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PreqService } from './preq.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import * as preQSwaggerExample from './preq.swagger.example';
import * as preQDtoSwaggerSchema from './preq.swagger.schemas';
import * as coreDto from '../core-dto/core.dto';

@ApiTags('core-v2')
@Controller('v2/core')
export class PreqController {
  constructor(private readonly preqService: PreqService) {}

  @Get(':userId/preq')
  async getPreqInfo(@Param('userId') userId: string) {
    try {
      return await this.preqService.getPreqInfo(+userId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Post(':userId/preq')
  @ApiBody({
    schema: preQDtoSwaggerSchema.preQPostDtoSwaggerSchema,
    examples: preQSwaggerExample.preQPostDtoSwaggerExample,
  })
  async postPreQInfo(
    @Param('userId') userId: number,
    @Body() payload: coreDto.PostPreQDto,
  ) {
    const parsedPayload = coreDto.postPreQDto.parse(payload);

    return await this.preqService.postPreQInfo(userId, parsedPayload);
  }
}
