import { BadRequestException, Injectable } from '@nestjs/common';
import * as coreDto from '../core-dto/core.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/shared/logger/logger.service';

@Injectable()
export class PostqService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}
  async postFeedBack(userId: number, createPostqDto: coreDto.PostFeedBack) {
    try {
      const [userCheck, questionCheck] = await Promise.all([
        this.prismaService.user.findUnique({
          where: {
            id: userId,
          },
        }),
        this.prismaService.userQAHistory.findFirst({
          where: {
            AND: [
              { userId: userId },
              { questionId: createPostqDto.questionId },
            ],
          },
        }),
      ]);

      if (!userCheck || !questionCheck) {
        throw new BadRequestException('Invalid Request');
      }

      const feedBackData = await this.prismaService.feedback.create({
        data: {
          user: { connect: { id: userId } },
          question: { connect: { id: createPostqDto.questionId } },
          isPositive: createPostqDto.isPositive,
          comment: createPostqDto.comment,
        },
      });

      return {
        message: 'Feedbacks have been created successfully.',
        info: feedBackData,
      };
    } catch (error) {
      this.logger.logError('[PWA-API][PostqService -> postFeedBack] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }
}
