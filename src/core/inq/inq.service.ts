import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { inQDtoSchema } from './inq.dto';

@Injectable()
export class InqService {
  constructor(private readonly prismaService: PrismaService) {}

  async createInq(userId: number, inQDto: any) {
    //validate the inQ dto
    const validatedInQData = inQDtoSchema.parse(inQDto);

    const response: any = {};

    const getStageData = await this.prismaService.stageHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!getStageData) {
      throw new NotFoundException('Stage history not found for the user');
    }

    const getQuestionAnswerData = await this.prismaService.question.findFirst({
      where: {
        id: validatedInQData.questionId,
      },
      include: {
        mCQQA: true,
      },
    });

    if (!getQuestionAnswerData) {
      throw new NotFoundException('Question not found');
    }

    const userQAHistory = await this.prismaService.userQAHistory.findFirst({
      where: { questionId: validatedInQData.questionId, userId: userId },
    });

    if (userQAHistory) {
      throw new NotFoundException('User QA history already exists');
    }

    //Derived the trumps usage for user

    let timeSpent = validatedInQData.timeSpent;
    let score =
      getQuestionAnswerData.mCQQA.answer === validatedInQData.answer ? 100 : 0;

    const getTrumpsConsumptionData =
      await this.prismaService.trumpsConsumption.findFirst({
        where: {
          userId,
          nextIn: 9,
        },
        orderBy: { createdAt: 'desc' },
      });

    if (getTrumpsConsumptionData) {
      const trumpSettingData = await this.prismaService.trumpSetting.findFirst({
        where: {
          id: getTrumpsConsumptionData.powerUpId,
        },
      });

      switch (trumpSettingData.codeName) {
        case 'PLUS_5_SECONDS':
          timeSpent = timeSpent + 5;
          break;
        case 'PLUS_10_SECONDS':
          timeSpent = timeSpent + 10;
          break;
        case 'TWICE_UP':
          score = score * 2;
          break;
        case 'THRICE_UP':
          score = score * 3;
          break;
        case 'DICE_UP':
          score = score * Math.floor(Math.random() * 6) + 1;
          break;
        default:
          break;

        //wildcard are pending
      }
    }

    //create user QA history

    const createUserQAHistory = await this.prismaService.userQAHistory.create({
      data: {
        userId,
        day: getStageData.day,
        stageId: getStageData.stageId,
        gradeId: getStageData.gradeId,
        tier1Id: getQuestionAnswerData.tier1Id,
        tier2Id: getQuestionAnswerData.tier2Id,
        tier3Id: getQuestionAnswerData.tier3Id,
        testType: 'MIXED_MODE',
        questionId: validatedInQData.questionId,
        currentQuestionNo: validatedInQData.currentQuestionNo,
        timeSpent,
        isQuestionSkipped: validatedInQData.isQuestionSkipped,
        isCorrect:
          getQuestionAnswerData.mCQQA.answer === validatedInQData.answer,
        score,
      },
    });

    //calculate grade based on score

    const scorePercentage =
      ((getStageData.totalScore + createUserQAHistory.score) /
        getStageData.day <
      6
        ? 20
        : 16) * 100;

    //change to total no of question limit 20/16

    const gradeSetting = await this.prismaService.gradeSetting.findMany({
      where: {
        minPercentage: {
          lte: scorePercentage,
        },
        maxPercentage: {
          gte: scorePercentage,
        },
      },
    });

    let derivedScorePercentageId = 1;

    if (gradeSetting.length > 0) {
      derivedScorePercentageId = gradeSetting[0].id;
    }
    //update stage history

    if (createUserQAHistory) {
      await this.prismaService.stageHistory.update({
        where: { id: getStageData.id },
        data: {
          totalScore: getStageData.totalScore + createUserQAHistory.score,
          gradeId: derivedScorePercentageId,
          totalCorrectAnswers: createUserQAHistory.isCorrect
            ? getStageData.totalCorrectAnswers + 1
            : getStageData.totalCorrectAnswers,
          totalTimeSpent:
            getStageData.totalTimeSpent + createUserQAHistory.timeSpent,
          totalQuestions: getStageData.totalQuestions + 1,
          tier1: [...getStageData.tier1, createUserQAHistory.tier1Id],
          tier2: [...getStageData.tier2, createUserQAHistory.tier2Id],
          tier3: [...getStageData.tier3, createUserQAHistory.tier3Id],
          testStatus:
            getStageData.day < 6 && getStageData.totalQuestions + 1 === 20
              ? 'COMPLETED'
              : getStageData.day >= 6 && getStageData.totalQuestions + 1 === 16
                ? 'COMPLETED'
                : 'IN_PROGRESS',
        },
      });

      const stageDetails = await this.prismaService.stageSetting.findFirst({
        where: {
          id: getStageData.stageId,
        },
      });
      //updating the User Stats on every end of the secession
      if (
        (getStageData.day < 6 && getStageData.totalQuestions + 1 === 20) ||
        (getStageData.day >= 6 && getStageData.totalQuestions + 1 === 16)
      ) {
        await this.prismaService.userStats.update({
          where: {
            userId: userId,
          },
          data: {
            netScore: {
              increment: getStageData.totalScore + createUserQAHistory.score,
            },
            currentGrade: gradeSetting[0]?.level,
            currentStage: stageDetails.level,
          },
        });
      }

      // Update question details

      const userQAHistory = await this.prismaService.userQAHistory.findMany({
        where: {
          questionId: validatedInQData.questionId,
        },
      });

      const deriveAvgTime =
        userQAHistory.reduce((acc, curr) => acc + curr.timeSpent, 0) /
        userQAHistory.length;

      const deriveAccuracy =
        (userQAHistory.filter((qa) => qa.isCorrect).length /
          userQAHistory.length) *
        100;

      await this.prismaService.question.update({
        where: { id: validatedInQData.questionId },
        data: {
          avgTime: deriveAvgTime / userQAHistory.length,
          accuracy: deriveAccuracy / userQAHistory.length,
          timeLimit: createUserQAHistory.timeSpent,
        },
      });

      //update the powerups-consumption
      const trumpConsumptionData =
        await this.prismaService.trumpsConsumption.findMany({
          where: {
            userId,
          },
          orderBy: { createdAt: 'desc' },
        });

      if (trumpConsumptionData.length > 0) {
        for (const trumpConsumption of trumpConsumptionData) {
          if (trumpConsumption.nextIn > 0) {
            await this.prismaService.trumpsConsumption.update({
              where: {
                id: trumpConsumption.id,
              },
              data: {
                nextIn: trumpConsumption.nextIn - 1,
              },
            });
          }
        }
      }
    }

    response['inQ'] = {
      questionId: createUserQAHistory.questionId,
      isCorrect: createUserQAHistory.isCorrect,
      score: createUserQAHistory.score,
    };

    response['postQ'] = {
      triviaContent: getQuestionAnswerData.mCQQA.triviaContent,
    };

    return response;
  }
}
