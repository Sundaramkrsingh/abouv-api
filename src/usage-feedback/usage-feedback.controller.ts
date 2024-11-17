import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsageFeedbackService } from './usage-feedback.service';
import { usageFeedBackSchema } from './usage-feedback.dto';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('usage-feedback')
export class UsageFeedbackController {
  constructor(private readonly usageFeedbackService: UsageFeedbackService) {}

  @Post('upload-img')
  @ApiOperation({ summary: 'upload svg to bucket' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFeedbackImage(@UploadedFile() file: Express.Multer.File) {
    return await this.usageFeedbackService.uploadFeedbackImage(file);
  }

  @Post(':userId')
  async createFeedback(
    @Param('userId') userId: string,
    @Body() feedbackData: usageFeedBackSchema,
  ) {
    const createdFeedback = await this.usageFeedbackService.create(
      Number(userId),
      feedbackData,
    );
    return {
      message: 'Feedbacks have been created successfully.',
      data: createdFeedback,
    };
  }
}
