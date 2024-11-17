import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QaHistoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(getDto) {
    const { userId, limit } = getDto;
    return this.prismaService.userQAHistory.findMany({
      where: { userId },
      take: limit || 1,
    });
  }

  async create(createDto) {
    const { userId } = createDto;
    // const dummyData = {
    //     userId,
    //     day: 1,
    //     stageId: 1,
    //     gradeId: 1,
    //     tier1Id: 1,
    //     tier2Id: 1,
    //     tier3Id: 1,
    //     testType: 'Mock Test',
    //     questionId: 1,
    //     currentQuestionNo: 1,
    //     rewardsCollected: [1, 2, 3],
    //     rewardApplied: 1,
    //     noOfAttempts: 1,
    //     timeSpent: 60,
    //     isQuestionSkipped: false,
    //     isLiked: true,
    //     dislikeFeedback: 'None',
    //     isCorrect: true,
    //     score: 100,
    //     totalScore: 1000,
    //   };
    return this.prismaService.userQAHistory.create({
      data: {
        userId,
        day: 1,
        stageId: 1,
        gradeId: 1,
        tier1Id: 1,
        tier2Id: 1,
        tier3Id: 1,
        testType: 'MIXED_MODE',
        questionId: 1,
        currentQuestionNo: 1,
        // rewardsCollected: [1, 2, 3],
        // rewardApplied: 1,
        noOfAttempts: 1,
        timeSpent: 60,
        isQuestionSkipped: false,
        // isLiked: true,
        // dislikeFeedback: 'None',
        // isCorrect: true,
        score: 100,
        // totalScore: 1000,
      },
    });
  }
}
