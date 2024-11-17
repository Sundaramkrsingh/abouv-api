import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { InqService } from './inq.service';
import { inQDtoSwaggerSchema } from './inq.swagger.schemas';
import { inQDtoSwaggerExample } from './inq.swagger.example';

@ApiTags('core')
@Controller('core')
export class InqController {
  constructor(private readonly inqService: InqService) {}

  @Post(':userId/answer')
  @ApiBody({
    schema: inQDtoSwaggerSchema,
    examples: inQDtoSwaggerExample,
  })
  async createInQData(@Param('userId') userId: string, @Body() data: any) {
    return await this.inqService.createInq(+userId, data);
  }
}
