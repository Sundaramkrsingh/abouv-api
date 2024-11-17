import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeedBackService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: number, questionId: number, feedbackData: any) {
    return this.prismaService.feedback.create({
      data: {
        user: { connect: { id: userId } }, // Connects the feedback to the specified user
        question: { connect: { id: questionId } }, // Connects the feedback to the specified question
        ...feedbackData, // Includes other feedback data
      },
    });
  }

  async findMany() {
    return this.prismaService.feedback.findMany();
  }

  async findUnique(feedbackId: number) {
    return this.prismaService.feedback.findUnique({
      where: { id: feedbackId },
    });
  }

  async update(feedbackId: number, updatedFeedbackData: any) {
    return this.prismaService.feedback.update({
      where: { id: feedbackId },
      data: updatedFeedbackData,
    });
  }

  async delete(feedbackId: number) {
    return this.prismaService.feedback.delete({
      where: { id: feedbackId },
    });
  }
}
