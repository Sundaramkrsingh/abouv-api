import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { FeedBackService } from './feed-back.service';
import { FeedbackDtoSchema } from './feed-back.dto';

@Controller('feed-back')
export class FeedBackController {
  constructor(private readonly feedbackService: FeedBackService) {}

  @Post(':userId/:questionId')
  async createFeedback(
    @Param('userId') userId: string,
    @Param('questionId') questionId: string,
    @Body() feedbackData: FeedbackDtoSchema,
  ) {
    const createdFeedback = await this.feedbackService.create(
      Number(userId),
      Number(questionId),
      feedbackData,
    );
    return {
      message: 'Feedbacks have been created successfully.',
      data: createdFeedback,
    };
  }

  @Get()
  async getAllFeedback() {
    const feedbacks = await this.feedbackService.findMany();
    return {
      message: 'Fetched feedback data successfully.',
      data: feedbacks,
    };
  }

  @Get(':id')
  async getFeedbackById(@Param('id') id: string) {
    const feedback = await this.feedbackService.findUnique(Number(id));
    return {
      message: 'Fetched feedback data successfully.',
      data: feedback,
    };
  }

  @Put(':id')
  async updateFeedback(
    @Param('id') id: string,
    @Body() updatedFeedbackData: any,
  ) {
    await this.feedbackService.update(Number(id), updatedFeedbackData);
    return {
      message: 'Feedbacks have been updated successfully.',
    };
  }

  @Delete(':id')
  async deleteFeedback(@Param('id') id: string) {
    await this.feedbackService.delete(Number(id));
    return {
      message: 'Feedback has been deleted successfully.',
    };
  }
}
