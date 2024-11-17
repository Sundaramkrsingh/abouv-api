/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { schedule } from 'node-cron';
import { checkTestUser } from 'src/shared/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as webpush from 'web-push';
import { envConfig } from 'src/shared/config/app.config';
import { S3Service } from 'src/s3/s3.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
  };
}

@Injectable()
export class HomeService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly s3Service: S3Service,
  ) {}

  onModuleInit() {
    webpush.setVapidDetails(
      `mailto:${envConfig.vapidKeys.email}`,
      envConfig.vapidKeys.publicKey,
      envConfig.vapidKeys.privateKey,
    );
    this.scheduleDailyTasks();
    this.eventEmitter.on('session.changed', async ({ userId }) => {
      await this.sendSessionChangedNotification(userId);
    });
  }

  async sendSessionChangedNotification(userId: number) {
    try {
      const subscription = await this.prismaService.pushNotification.findFirst({
        where: { userId },
      });

      if (!subscription) {
        console.log(`No subscription found for user ${userId}`);
        return;
      }

      await webpush.sendNotification(
        subscription.subscription,
        JSON.stringify({
          title: 'Assessment Unlocked!',
          message:
            'New assessment is now available! Dive in and show off your skills!',
        }),
      );
    } catch (error) {
      console.error(`Failed to send notification to user ${userId}:`, error);
    }
  }

  async getHomeData(req: AuthenticatedRequest) {
    const response: any = {};

    const userId = req.user?.id;

    let latestStageHistory = await this.prismaService.stageHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        day: true,
        gradeId: true,
        totalQuestions: true,
        totalScore: true,
        user: {
          select: {
            profile: {
              select: {
                fullName: true,
                email: true,
                userId: true,
                avatar: true,
              },
            },
          },
        },
        createdAt: true,
        testStatus: true,
      },
    });

    if (!latestStageHistory) {
      latestStageHistory = await this.prismaService.stageHistory.create({
        data: {
          userId,
          day: 1,
          stageId: 1,
          gradeId: 1,
          tier1: [],
          tier2: [],
          tier3: [],
          testStatus: 'IN_PROGRESS',
          questionTypes: ['MCQ'],
          totalQuestions: 0,
          totalCorrectAnswers: 0,
          totalTimeSpent: 0,
          totalScore: 0,
        },
        select: {
          day: true,
          gradeId: true,
          totalQuestions: true,
          totalScore: true,
          user: {
            select: {
              profile: {
                select: {
                  fullName: true,
                  userId: true,
                  avatar: true,
                  email: true,
                },
              },
            },
          },
          createdAt: true,
          testStatus: true,
        },
      });

      await this.prismaService.userStats.upsert({
        where: { userId },
        update: {
          netScore: 0,
          currentGrade: 'G1',
          currentStage: 'S01',
        },
        create: {
          netScore: 0,
          currentGrade: 'G1',
          currentStage: 'S01',
          userId,
        },
      });
    } else {
      const today = new Date();
      const latestStageDay = latestStageHistory.createdAt.getDate();

      if (
        (latestStageDay !== today.getDate() &&
          latestStageHistory.testStatus === 'COMPLETED') ||
        (latestStageHistory.testStatus === 'COMPLETED' &&
          checkTestUser(latestStageHistory.user.profile.email))
      ) {
        const stageSetting = await this.prismaService.stageSetting.findMany({
          where: {
            startDay: {
              lte: latestStageHistory.day + 1,
            },
            endDay: {
              gte: latestStageHistory.day + 1,
            },
          },
        });

        let derivedStageId = 0;

        if (stageSetting.length > 0) {
          derivedStageId = stageSetting[0].id;
        }

        // Create a new stage history entry with an incremented day
        latestStageHistory = await this.prismaService.stageHistory.create({
          data: {
            userId,
            day: latestStageHistory.day + 1,
            stageId: derivedStageId,
            gradeId: 1,
            tier1: [],
            tier2: [],
            tier3: [],
            testStatus: 'IN_PROGRESS',
            questionTypes: ['MCQ'],
            totalQuestions: 0,
            totalCorrectAnswers: 0,
            totalTimeSpent: 0,
            totalScore: 0,
          },
          select: {
            day: true,
            gradeId: true,
            totalQuestions: true,
            totalScore: true,
            user: {
              select: {
                profile: {
                  select: {
                    fullName: true,
                    userId: true,
                    avatar: true,
                    email: true,
                  },
                },
              },
            },
            createdAt: true,
            testStatus: true,
          },
        });

        // listening to assessment unlock
        this.eventEmitter.emit('session.changed', {
          userId,
        });
      }
    }

    const stageSetting = await this.prismaService.stageSetting.findFirst({
      where: {
        startDay: {
          lte: latestStageHistory?.day,
        },
        endDay: {
          gte: latestStageHistory?.day,
        },
      },
    });

    const gradeSettingData = await this.prismaService.gradeSetting.findFirst({
      where: {
        id: latestStageHistory.gradeId,
      },
    });

    const getTestStatus = () => {
      const takeLimit = latestStageHistory?.day < 6 ? 20 : 16;

      if (latestStageHistory.totalQuestions == 0) {
        return 'Start now';
      } else if (latestStageHistory.totalQuestions < takeLimit) {
        return 'Resume';
      } else {
        return 'Assessment done';
      }
    };

    const userAllStagesData = await this.prismaService.stageHistory.findMany({
      where: {
        userId,
      },
    });

    const bucketName = envConfig.S3.uploadProfileImgBucket;
    const avatar = latestStageHistory.user.profile.avatar
      ? await this.s3Service.getSignedFileUrl(
          latestStageHistory.user.profile.avatar,
          bucketName,
        )
      : null;

    response['assessment'] = {
      testType: 'MIXED MODE',
      testStatus: getTestStatus(),
      firstTimeUser:
        userAllStagesData[0] && userAllStagesData[0].totalQuestions <= 2,
      day: latestStageHistory?.day || null,
      stage: stageSetting?.level || null,
      grade: gradeSettingData?.level || null,
      userInfo: {
        name: latestStageHistory.user.profile.fullName,
        id: latestStageHistory.user.profile.userId,
        avatar,
      },
      totalPoints: latestStageHistory.totalScore || 0,
    };

    return response;
  }

  async incrementDayForUsers(): Promise<number[]> {
    const unlockedUsers: number[] = [];

    try {
      const users = await this.prismaService.stageHistory.findMany({
        where: {
          testStatus: 'COMPLETED',
        },
        include: {
          user: {
            select: {
              profile: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      for (const user of users) {
        const today = new Date();
        const latestStageDay = user.createdAt.getDate();

        if (
          latestStageDay !== today.getDate() ||
          checkTestUser(user.user.profile.email)
        ) {
          const stageSetting = await this.prismaService.stageSetting.findFirst({
            where: {
              startDay: {
                lte: user.day + 1,
              },
              endDay: {
                gte: user.day + 1,
              },
            },
          });

          const derivedStageId = stageSetting?.id || 1;

          await this.prismaService.stageHistory.create({
            data: {
              userId: user.userId,
              day: user.day + 1,
              stageId: derivedStageId,
              gradeId: 1,
              tier1: [],
              tier2: [],
              tier3: [],
              testStatus: 'IN_PROGRESS',
              questionTypes: ['MCQ'],
              totalQuestions: 0,
              totalCorrectAnswers: 0,
              totalTimeSpent: 0,
              totalScore: 0,
            },
          });

          unlockedUsers.push(user.userId);
        }
      }
    } catch (error) {
      console.error('Error incrementing day for users:', error);
      throw error;
    }

    return unlockedUsers;
  }

  async getCurrentQuote(): Promise<string> {
    try {
      const currentQuote = await this.prismaService.quote.findFirst({
        orderBy: { displayCount: 'asc' },
        take: 1,
      });

      if (!currentQuote) {
        throw new BadRequestException('Could not fetch quote');
      }

      return currentQuote.quote;
    } catch (error) {
      throw new BadRequestException('Failed to fetch the current quote');
    }
  }

  async updateQuoteIndex(): Promise<void> {
    try {
      const currentQuote = await this.prismaService.quote.findFirst({
        orderBy: { displayCount: 'asc' },
        take: 1,
      });

      if (currentQuote) {
        await this.prismaService.quote.update({
          where: { id: currentQuote.id },
          data: { displayCount: { increment: 1 } },
        });
      }
    } catch (error) {
      throw new BadRequestException('Failed to update the quote index');
    }
  }

  async createQuotes(quoteList: { quote: string }[]): Promise<void> {
    try {
      for (const item of quoteList) {
        await this.prismaService.quote.create({
          data: {
            quote: item.quote,
            displayCount: 0,
          },
        });
      }
    } catch (error) {
      throw new BadRequestException('Failed to save quotes in the database');
    }
  }

  scheduleDailyTasks(): void {
    schedule('30 18 * * *', async () => {
      // Updating day/session
      console.log('Running cron job for user day increment at 12 AM IST');
      const unlockedUsers = await this.incrementDayForUsers();

      // Updating quote
      console.log('Running cron job for quote update at 12 AM IST');
      await this.updateQuoteIndex();

      if (unlockedUsers.length > 0) {
        for (const userId of unlockedUsers) {
          await this.sendSessionChangedNotification(userId);
        }
      }
    });
  }
}
