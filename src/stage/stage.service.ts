import { BadRequestException, Injectable } from '@nestjs/common';
import { StageHistory } from '@prisma/client';
import { CUSTOM_ERRORS } from 'src/constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StageService {
  constructor(private readonly prismaService: PrismaService) {}

  async createStageHistory(userId: number) {
    // Create a new StageHistory entry

    return this.prismaService.stageHistory.create({
      data: {
        userId,
        day: 0,
        stageId: 1,
        gradeId: 1,
        testStatus: null,
        questionTypes: [],
        totalQuestions: 10,
        totalCorrectAnswers: 0,
        totalTimeSpent: 0,
        // rewardsCollected: [],
        // rewardConsumed: [],
        // repeatedQuestion: 0,
        totalScore: 0,
      },
    });
  }

  async getStageHistory(userId: number) {
    // Retrieve latest StageHistory for a user
    return this.prismaService.stageHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPostAssessmentDtls(userId: number) {
    try {
      const assessmentDtls = await this.prismaService.stageHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (!assessmentDtls) {
        throw new BadRequestException(
          CUSTOM_ERRORS.USER_STAGE_HISTORY_NOT_FOUND,
        );
      }
      return await this.transformPostAssessmentDtls(assessmentDtls);
    } catch (error) {
      throw error;
    }
  }

  async transformPostAssessmentDtls(data: StageHistory) {
    try {
      const totalScoreLastSession =
        data.day > 1
          ? await this.prismaService.userQAHistory.aggregate({
              where: { day: data.day - 1, userId: data.userId },
              _sum: { score: true },
            })
          : null;

      const totalScorePerSessionScored =
        await this.prismaService.userQAHistory.aggregate({
          where: {
            day: data.day,
            userId: data.userId,
          },
          _sum: {
            score: true,
          },
        });

      let lastSessionStageDtls;
      let lastSessionGradeDtls;
      if (totalScoreLastSession) {
        const [assessmentDtls] = await this.prismaService.stageHistory.findMany(
          {
            where: { userId: data.userId },
            orderBy: { createdAt: 'desc' },
            take: 2,
            skip: 1,
          },
        );
        const [stageSetting, gradeSetting] = await this.findStageDetails(
          data.userId,
          totalScoreLastSession?._sum?.score,
          assessmentDtls.totalQuestions,
          data.day - 1,
        );
        lastSessionGradeDtls = gradeSetting;
        lastSessionStageDtls = stageSetting;
      }

      const [stageSetting, gradeSetting, aggregateTotalScore] =
        await this.findStageDetails(
          data.userId,
          totalScorePerSessionScored._sum.score,
          data.totalQuestions,
          data.day,
        );
      //find the total & accuracy for the session
      const totalScored = totalScorePerSessionScored?._sum?.score || 0;

      const accuracy =
        totalScored > 0 && data.totalQuestions > 0
          ? (totalScored / (data?.totalQuestions * 100)) * 100
          : 0;

      const remainingAccuracyForNextStage =
        gradeSetting?.maxPercentage - accuracy;

      const daysForNextStage = (stageSetting?.endDay || 0) - (data?.day || 0);

      const transformData = {
        userId: data?.userId,
        pointsAchieved: data?.totalScore,
        sessionAccuracy: Number(accuracy?.toFixed(2) || 0),
        totalPoints: aggregateTotalScore?._sum?.totalScore || 0,
        dayNo: data.day,
        daysForNextStage,
        remainingAccuracyForNextStage,
        nextStageAccuracy: gradeSetting?.maxPercentage,
        createdDateTime: data?.createdAt,
        gradeDetails: {
          grade: gradeSetting.level,
          gradeName: gradeSetting.name,
          isGradeChange:
            lastSessionStageDtls &&
            lastSessionStageDtls?.id != gradeSetting?.id &&
            lastSessionGradeDtls?.level != gradeSetting.level
              ? true
              : false,
          lastGrade: lastSessionGradeDtls?.level || '',
        },
        stageDetails: {
          stage: stageSetting.level,
          stageName: stageSetting.name,
          isStageChange:
            lastSessionStageDtls &&
            lastSessionGradeDtls?.id === stageSetting?.id &&
            lastSessionStageDtls?.level == stageSetting?.level
              ? true
              : false,
          lastStag: lastSessionStageDtls?.level || '',
        },
      };
      return transformData;
    } catch (error) {
      throw error;
    }
  }

  async findStageDetails(
    userId: number,
    totalSessionScore: number,
    totalQuestions: number,
    dayNo: number,
  ) {
    try {
      const accuracy =
        totalSessionScore > 0 && totalQuestions > 0
          ? (totalSessionScore / (totalQuestions * 100)) * 100
          : 0;

      return await Promise.all([
        this.prismaService.stageSetting.findFirst({
          where: {
            endDay: {
              gte: dayNo,
            },
            startDay: {
              lte: dayNo,
            },
          },
        }),
        this.prismaService.gradeSetting.findFirst({
          where: {
            minPercentage: {
              lte: accuracy,
            },
            maxPercentage: {
              gte: accuracy,
            },
          },
        }),
        this.prismaService.stageHistory.aggregate({
          where: {
            userId: userId,
          },
          _sum: {
            totalScore: true,
          },
        }),
      ]);
    } catch (error) {
      throw error;
    }
  }
}
