import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { inQDtoSchema } from './inq.dto';
import {
  FIRST_STAGE_QUESTIONS,
  POWER_UP_USE_QUESTIONS_LIMIT,
  REMAINING_STAGE_QUESTIONS,
  SECOND_STAGE_START_DAY,
} from 'src/constants';
import { decrypt } from 'prisma/encryption/crypto.utils';

@Injectable()
export class InqService {
  constructor(private readonly prismaService: PrismaService) {}

  async createInq(userId: number, inQDto: any) {
    const validatedInQData = inQDtoSchema.parse(inQDto);

    await this.findUser(userId);

    const response: any = {};

    //single transaction this ensures that if any part of the process fails, all changes are rolled back.
    return this.prismaService.$transaction(async (prisma) => {
      const stageHistory = await this.getLatestStageHistory(prisma, userId);

      const questionData = await this.getQuestionData(
        prisma,
        validatedInQData.questionId,
      );

      await this.checkUserQAHistory(
        prisma,
        userId,
        validatedInQData.questionId,
      );

      //calculate the users score taking question type into account
      const { score } = await this.calculateScore(
        prisma,
        userId,
        stageHistory,
        validatedInQData,
        questionData,
      );

      //create the userQAHistory based on the question type
      const userQAHistory = await this.createUserQAHistory(
        prisma,
        userId,
        stageHistory,
        questionData,
        validatedInQData,
        score,
      );

      const { totalQuestions, gradeLevel } = await this.updateStageHistory(
        prisma,
        stageHistory,
        userQAHistory,
        validatedInQData.questionId,
      );

      if (this.isSessionComplete(stageHistory.day, totalQuestions)) {
        await this.updateUserStats(
          prisma,
          userId,
          stageHistory,
          userQAHistory,
          gradeLevel,
        );
      }

      await this.updateQuestionStats(
        prisma,
        validatedInQData.questionId,
        userQAHistory,
      );

      await this.updatePowerUpConsumptionCountdown(prisma, userId);

      response['inQ'] = {
        questionId: userQAHistory.questionId,
        ...(!this.isUnscoredQuestion(questionData) && {
          isCorrect: userQAHistory.isCorrect,
          score: userQAHistory.score,
        }),
      };

      response['postQ'] = {
        ...(!this.isNonTriviaQuestion(questionData)
          ? {
              triviaContent: decrypt(questionData.mCQQA.triviaContent),
              sessionCompleted: this.isSessionComplete(
                stageHistory.day,
                totalQuestions,
              ),
            }
          : {
              sessionCompleted: this.isSessionComplete(
                stageHistory.day,
                totalQuestions,
              ),
            }),
      };

      return response;
    });
  }

  async findUser(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with userId ${userId} doesn't exist!`);
    }

    return user;
  }

  private async getLatestStageHistory(prisma, userId: number) {
    const stageHistory = await prisma.stageHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        stageSetting: {
          select: { level: true, timeLimit: true, totalQuestions: true },
        },
      },
    });

    if (!stageHistory) {
      throw new NotFoundException('Stage history not found for the user');
    }

    return stageHistory;
  }

  private async getQuestionData(prisma, questionId: number) {
    const questionData = await prisma.question.findFirst({
      where: { id: questionId },
      include: {
        mCQQA: true,
        mCQPsychometricQA: true,
        mCQPsychometricOptionsQA: true,
      },
    });

    if (!questionData) {
      throw new NotFoundException('Question not found');
    }

    return questionData;
  }

  private async checkUserQAHistory(prisma, userId: number, questionId: number) {
    const existingUserQAHistory = await prisma.userQAHistory.findFirst({
      where: {
        questionId,
        userId,
      },
    });

    if (existingUserQAHistory) {
      throw new NotAcceptableException('User QA history already exists');
    }
  }

  private async createUserQAHistory(
    prisma,
    userId,
    stageHistory: any,
    questionData: any,
    validatedInQData: any,
    score: number,
  ) {
    let isCorrect = null;
    let traitIdSelection = null;
    let optionId = null;
    let traitStat = null;

    switch (true) {
      case !!questionData.mCQQA:
        isCorrect = questionData.mCQQA.answer === validatedInQData.answer;
        optionId = validatedInQData.answer;
        break;
      case !!questionData.mCQPsychometricQA:
        traitStat = await this.generatePsychometricNoOptionResponse(
          prisma,
          userId,
          validatedInQData.answer,
          questionData.mCQPsychometricQA.traitTypeId,
        );
        traitIdSelection = questionData.mCQPsychometricQA.traitTypeId;
        break;
      case !!questionData.mCQPsychometricOptionsQA:
        traitStat = await this.generatePsychometricOptionResponse(
          prisma,
          userId,
          validatedInQData.answer,
          questionData.mCQPsychometricOptionsQA.options,
        );
        traitIdSelection = validatedInQData.answer;
        break;
      default:
        throw new NotAcceptableException('Unknown question type');
    }

    return prisma.userQAHistory.create({
      data: {
        userId,
        day: stageHistory.day,
        stageId: stageHistory.stageId,
        gradeId: stageHistory.gradeId,
        tier1Id: questionData.tier1Id,
        tier2Id: questionData.tier2Id,
        tier3Id: questionData.tier3Id,
        testType: 'MIXED_MODE',
        questionId: validatedInQData.questionId,
        currentQuestionNo: validatedInQData.currentQuestionNo,
        timeSpent: validatedInQData.timeSpent,
        isQuestionSkipped: validatedInQData.isQuestionSkipped,
        isCorrect,
        score,
        ...(traitIdSelection !== null && { traitIdSelection }),
        ...(optionId !== null && { optionId }),
        ...(traitStat !== null && { traitStat }),
      },
    });
  }

  private async updateStageHistory(
    prisma,
    stageHistory: any,
    userQAHistory: any,
    answeredQuestionId: number,
  ) {
    const questionSet = stageHistory.questionSet as {
      questionId: number;
      isShown: boolean;
    }[];

    const updatedQuestionSet = questionSet.filter(
      (question) => question.questionId !== answeredQuestionId,
    );

    const randomIndex = Math.floor(Math.random() * updatedQuestionSet.length);

    updatedQuestionSet.forEach((question, id) => {
      question.isShown = id === randomIndex;
    });

    const questionLimit =
      stageHistory.day < SECOND_STAGE_START_DAY
        ? FIRST_STAGE_QUESTIONS
        : REMAINING_STAGE_QUESTIONS;

    const totalQuestions = stageHistory.totalQuestions + 1;

    const totalScore = stageHistory.totalScore + userQAHistory.score;

    const scorePercentage =
      totalScore > 0 ? ((totalScore / questionLimit) * 100) / 100 : 0;

    const gradeSetting = await prisma.gradeSetting.findFirst({
      where: {
        minPercentage: { lte: scorePercentage },
        maxPercentage: { gte: scorePercentage },
      },
    });

    const derivedGradeId = gradeSetting
      ? gradeSetting.id
      : stageHistory.gradeId;

    const gradeLevel = gradeSetting[0]?.level;

    await prisma.stageHistory.update({
      where: { id: stageHistory.id },
      data: {
        totalScore: stageHistory.totalScore + userQAHistory.score,
        gradeId: derivedGradeId,
        totalCorrectAnswers: userQAHistory.isCorrect
          ? stageHistory.totalCorrectAnswers + 1
          : stageHistory.totalCorrectAnswers,
        totalTimeSpent: stageHistory.totalTimeSpent + userQAHistory.timeSpent,
        totalQuestions,
        tier1: [...stageHistory.tier1, userQAHistory.tier1Id],
        tier2: [...stageHistory.tier2, userQAHistory.tier2Id],
        tier3: [...stageHistory.tier3, userQAHistory.tier3Id],
        testStatus: this.isSessionComplete(stageHistory.day, totalQuestions)
          ? 'COMPLETED'
          : 'IN_PROGRESS',
        questionSet: this.isSessionComplete(stageHistory.day, totalQuestions)
          ? []
          : updatedQuestionSet,
      },
    });

    return { totalQuestions, gradeLevel };
  }

  private isSessionComplete(day: number, totalQuestions: number): boolean {
    return (
      (day < SECOND_STAGE_START_DAY &&
        totalQuestions === FIRST_STAGE_QUESTIONS) ||
      (day >= SECOND_STAGE_START_DAY &&
        totalQuestions === REMAINING_STAGE_QUESTIONS)
    );
  }

  private async updateUserStats(
    prisma,
    userId: number,
    stageHistory: any,
    userQAHistory: any,
    gradeLevel: string,
  ) {
    const stageDetails = await prisma.stageSetting.findFirst({
      where: { id: stageHistory.stageId },
    });

    await prisma.userStats.update({
      where: { userId },
      data: {
        netScore: {
          increment: stageHistory.totalScore + userQAHistory.score,
        },
        currentGrade: gradeLevel,
        currentStage: stageDetails.level,
      },
    });
  }

  private async updateQuestionStats(
    prisma,
    questionId: number,
    userQAHistory: any,
  ) {
    const allQAHistory = await prisma.userQAHistory.findMany({
      where: { questionId },
    });

    const avgTime =
      allQAHistory.reduce((acc, curr) => acc + curr.timeSpent, 0) /
      allQAHistory.length;
    const accuracy =
      (allQAHistory.filter((qa) => qa.isCorrect).length / allQAHistory.length) *
      100;

    await prisma.question.update({
      where: { id: questionId },
      data: {
        avgTime,
        accuracy,
        timeLimit: userQAHistory.timeSpent,
      },
    });
  }

  private async updatePowerUpConsumptionCountdown(prisma, userId: number) {
    const trumpConsumptions = await prisma.trumpsConsumption.findMany({
      where: {
        userId,
        nextIn: { gt: 0 },
        isConsumed: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Update the countdown for each eligible consumption
    for (const consumption of trumpConsumptions) {
      await prisma.trumpsConsumption.update({
        where: { id: consumption.id },
        data: {
          nextIn: {
            decrement: 1,
          },
        },
      });
    }
  }

  private async calculateScore(
    prisma: any,
    userId: number,
    stageHistory: any,
    validatedInQData: any,
    questionData: any,
  ) {
    if (this.isUnscoredQuestion(questionData)) {
      return { score: 0 };
    }
    // Fetch maxPointsData
    const maxPointsData = await prisma.scoresView.findFirst({
      where: {
        stageLevel: stageHistory.level,
        tier1Id: questionData.tier1Id,
      },
    });

    if (!maxPointsData) {
      throw new NotFoundException(
        'No matching record found in scores view for',
        {
          cause: {
            stageLevel: stageHistory.level,
            tier1Id: questionData.tier1Id,
          },
        },
      );
    }

    let timeLimit = stageHistory.stageSetting.timeLimit;

    const timeSpent = validatedInQData.timeSpent;

    const recentTrumpConsumption = await prisma.trumpsConsumption.findFirst({
      where: {
        userId,
        isConsumed: true,
        nextIn: POWER_UP_USE_QUESTIONS_LIMIT,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        trumpSetting: {
          select: {
            codeName: true,
          },
        },
      },
    });

    // Adjust timeLimit and initialize score multiplier
    let scoreMultiplier = 1;

    if (recentTrumpConsumption) {
      switch (recentTrumpConsumption.trumpSetting.codeName) {
        case 'PLUS_5_SECONDS':
          timeLimit += 5;
          break;
        case 'TWICE_UP':
          scoreMultiplier = 2;
          break;
      }
    }

    // Calculate score only if the answer is correct
    const score =
      questionData.mCQQA.answer === validatedInQData.answer
        ? ((maxPointsData.score * (timeLimit - timeSpent)) / timeLimit) *
          scoreMultiplier
        : 0;
    return { score };
  }

  //check for unscored questions.
  private isUnscoredQuestion(question: any): boolean {
    return !!question.mCQPsychometricQA || !!question.mCQPsychometricOptionsQA;
  }

  //check for unscored questions.
  private isNonTriviaQuestion(question: any): boolean {
    return !!question.mCQPsychometricQA || !!question.mCQPsychometricOptionsQA;
  }

  private async generatePsychometricNoOptionResponse(
    prisma: any,
    userId,
    answer: string,
    traitTypeId: number,
  ): Promise<any> {
    const PSYCHOMETRIC_SCORES = {
      SA: 100, // Strongly Agree
      A: 60, // Agree
      D: 40, // Disagree
      SD: 0, // Strongly Disagree
    } as const;

    const qScore = PSYCHOMETRIC_SCORES[answer.toUpperCase()] || 0;

    //get lastest userQAHistory for the traitTypeId
    const userQAHistory = await prisma.userQAHistory.findFirst({
      where: {
        userId,
        traitIdSelection: traitTypeId,
      },
      orderBy: { createdAt: 'desc' },
    });

    let accScore = qScore;
    let qNo = 1;
    if (userQAHistory) {
      accScore += userQAHistory.traitStat.accScore;
      qNo = userQAHistory.traitStat.qNo + 1;
    }

    return { traitTypeId, qScore, accScore, qNo };
  }

  private async generatePsychometricOptionResponse(
    prisma: any,
    userId,
    answer: number,
    options,
  ): Promise<any> {
    const questionScore = 100;

    const traitTypeIds: number[] = options.map((option) => option.id);

    //if answer not in traitTypes throw error
    if (!traitTypeIds.includes(answer)) {
      throw new NotAcceptableException('Invalid answer for  question');
    }

    //get latest userQAHistory with traitIdSelection in traitTypes
    const userQAHistory = await prisma.userQAHistory.findFirst({
      where: {
        userId,
        traitIdSelection: { in: traitTypeIds },
      },
      orderBy: { createdAt: 'desc' },
    });

    const prevScores = userQAHistory?.traitStat?.scores || [];

    const traitStat = {
      qNo: (userQAHistory?.traitStat?.qNo || 0) + 1,
      scores: traitTypeIds.map((traitTypeId) => {
        const prevScore =
          prevScores.find((score) => score.traitTypeId === traitTypeId)
            ?.accScore || 0;
        const accScore =
          prevScore + (traitTypeId === answer ? questionScore : 0);
        return { traitTypeId, accScore };
      }),
    };

    return traitStat;
  }
}
