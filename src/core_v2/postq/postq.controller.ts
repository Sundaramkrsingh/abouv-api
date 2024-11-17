import { Controller, Post, Body, Param } from '@nestjs/common';
import { PostqService } from './postq.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import * as postQSwaggerExample from './postq.swagger.example';
import * as postQDtoSwaggerSchema from './postq.swagger.schemas';
import * as coreDto from '../core-dto/core.dto';

@ApiTags('core-v2')
@Controller('v2/core')
export class PostqController {
  constructor(private readonly postqService: PostqService) {}

  @Post(':userId/postq')
  @ApiBody({
    schema: postQDtoSwaggerSchema.feedBackDtoSwaggerSchema,
    examples: postQSwaggerExample.feedBackDtoSwaggerExample,
  })
  create(
    @Body() payload: coreDto.PostFeedBack,
    @Param('userId') userId: number,
  ) {
    const parsedPayload = coreDto.postFeedBack.parse(payload);
    return this.postqService.postFeedBack(+userId, parsedPayload);
  }
}
