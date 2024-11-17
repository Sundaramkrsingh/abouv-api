/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FacetsReportsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getProgressionSummary(userId: number) {
    const latestStageHistory = await this.prismaService.stageHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestStageHistory) {
      return null;
    }

    const allStageHistory = await this.prismaService.stageHistory.findMany({
      where: { userId },
    });

    const questionAttempted = allStageHistory.reduce(
      (acc, cur) => acc + cur.totalQuestions,
      0,
    );

    const stageSetting = await this.prismaService.stageSetting.findFirst({
      where: {
        startDay: { lte: latestStageHistory.day },
        endDay: { gte: latestStageHistory.day },
      },
    });

    const totalSession = stageSetting?.days || 0;
    let currentSession = 1;
    let totalProgress = 0;

    if (stageSetting) {
      currentSession = latestStageHistory.day - stageSetting.startDay + 1;

      totalProgress = Math.min(
        Math.floor((currentSession / stageSetting.days) * 100),
        100,
      );
    }

    const response = {
      currentStage: stageSetting?.level || null,
      questionAttempted,
      currentSession,
      totalSession,
      totalProgress,
    };

    return response;
  }

  async getPerformanceSummary(userId: number) {
    const latestStageHistory = await this.prismaService.stageHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestStageHistory) {
      return null;
    }

    const gradeSettingData = await this.prismaService.gradeSetting.findFirst({
      where: {
        id: latestStageHistory.gradeId,
      },
    });

    const allUsersStageHistories =
      await this.prismaService.stageHistory.findMany();

    const allUsers = await this.prismaService.user.findMany();
    const sortedUsers = allUsers
      .map((user) => ({
        id: user.id,
        score: allUsersStageHistories
          .filter((history) => history.userId === user.id)
          .reduce((acc, cur) => acc + cur.totalScore, 0),
      }))
      .sort((a, b) => a.score - b.score);

    const currentUserIndex = sortedUsers.findIndex(
      (user) => user.id === userId,
    );
    const totalUsers = sortedUsers.length;
    const usersLowerOrEqualToCurrentUser = sortedUsers.slice(
      0,
      currentUserIndex + 1,
    ).length;

    const percentile =
      totalUsers > 0
        ? Math.min(
            Math.floor((usersLowerOrEqualToCurrentUser / totalUsers) * 100),
            100,
          )
        : 0;

    const currentUserNetScore = allUsersStageHistories
      .filter((history) => history.userId === userId)
      .reduce((acc, cur) => acc + cur.totalScore, 0);

    // Calculate currentAccuracy
    let currentAccuracy = 0;
    const userHistories = allUsersStageHistories.filter(
      (history) => history.userId === userId,
    );
    if (userHistories.length > 0) {
      const totalQuestions = userHistories.reduce(
        (acc, cur) => acc + cur.totalQuestions,
        0,
      );
      const totalCorrectAnswers = userHistories.reduce(
        (acc, cur) => acc + cur.totalCorrectAnswers,
        0,
      );
      if (totalQuestions > 0) {
        currentAccuracy = Math.floor(
          (totalCorrectAnswers / totalQuestions) * 100,
        );
        currentAccuracy = Math.min(currentAccuracy, 100);
      }
    }

    const nextGradeData = await this.prismaService.gradeSetting.findFirst({
      where: {
        id: {
          gt: gradeSettingData.id,
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    // Calculate nextGradeAccuracy
    let nextGradeAccuracy = 0;
    if (nextGradeData) {
      nextGradeAccuracy = Math.max(
        nextGradeData.minPercentage - currentAccuracy,
        0,
      );
    }

    const response = {
      currentGrade: gradeSettingData?.level || null,
      percentile,
      netScore: currentUserNetScore,
      currentAccuracy,
      nextGrade: nextGradeData?.level || null,
      nextGradeAccuracy,
    };

    return response;
  }

  async getScoreSummary(userId: number) {
    const response = {
      tier1: [],
    };

    const latestStageHistory = await this.prismaService.stageHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestStageHistory) {
      return response;
    }
    const userQAHistoryData = await this.prismaService.userQAHistory.findMany({
      where: { userId },
    });
    const tier1Data = await this.prismaService.tier1.findMany({});

    for (const tier1 of tier1Data) {
      const correctAnswerCount = userQAHistoryData.filter(
        (userQA) => userQA.tier1Id === tier1.id && userQA.isCorrect,
      ).length;

      const totalQuestionsCount = userQAHistoryData.filter(
        (userQA) => userQA.tier1Id === tier1.id,
      ).length;

      // console.log(`Tier 1: ${tier1.name}, Correct Answers: ${correctAnswerCount}, Total Questions: ${totalQuestionsCount}`);

      const calculateScorePercentage =
        totalQuestionsCount > 0
          ? Math.floor((correctAnswerCount / totalQuestionsCount) * 100)
          : 0;

      const gradeSetting = await this.prismaService.gradeSetting.findFirst({
        where: {
          minPercentage: { lte: calculateScorePercentage },
          maxPercentage: { gte: calculateScorePercentage },
        },
      });

      // Trait series is not graded, so it is NA by default
      if (tier1.name.includes('Trait')) {
        response.tier1.push({
          name: tier1.name,
          grade: 'NA',
        });
        continue;
      }

      response.tier1.push({
        name: tier1.name,
        score: calculateScorePercentage,
        grade: gradeSetting?.level || null,
      });
    }

    return response;
  }

  async getCompetenciesGradesSummary(userId: number) {
    const response = [];

    const allUserQAHistory = await this.prismaService.userQAHistory.findMany({
      where: { userId },
      include: {
        tier3: true,
      },
    });

    const tier1Setting = await this.prismaService.tier1.findMany({});
    const tier2Setting = await this.prismaService.tier2.findMany({});
    const tier3Setting = await this.prismaService.tier3.findMany({});
    const traitSetting = await this.prismaService.traitType.findMany({});

    const tier2Map = tier2Setting.reduce((map, tier2) => {
      if (!map[tier2.tier1Id]) {
        map[tier2.tier1Id] = [];
      }
      map[tier2.tier1Id].push(tier2);
      return map;
    }, {});

    const tier3Map = tier3Setting.reduce((map, tier3) => {
      if (!map[tier3.tier2Id]) {
        map[tier3.tier2Id] = [];
      }
      map[tier3.tier2Id].push(tier3);
      return map;
    }, {});

    const traitMap = traitSetting.reduce((map, trait) => {
      map[trait.id] = trait.name;
      return map;
    }, {});

    tier1Setting.forEach((tier1) => {
      const tier2s = (tier2Map[tier1.id] || []).map((tier2) => {
        const tier3s = (tier3Map[tier2.id] || []).map((tier3) => {
          if (tier1.name === 'Trait Series') {
            const getLatestUserQAHistory = (filter) =>
              allUserQAHistory
                .filter(filter)
                .reduce(
                  (latest, current) =>
                    !latest || current.createdAt > latest.createdAt
                      ? current
                      : latest,
                  null,
                );

            const calculateTraitArray = (traitStatData) => {
              const { scores, qNo } = traitStatData;
              return scores.map((score) => ({
                trait: traitMap[score.traitTypeId],
                percentage: ((score.accScore / (100 * qNo)) * 100).toFixed(1),
              }));
            };

            if (tier3.name === 'Leadership Strength') {
              const latestHistory = getLatestUserQAHistory(
                (userQA) => userQA.tier3Id === tier3.id,
              );
              return latestHistory?.traitStat
                ? {
                    name: tier3.name,
                    traits: calculateTraitArray(latestHistory.traitStat),
                  }
                : {
                    name: tier3.name,
                    traits: traitSetting
                      .filter((trait) => trait.tier3Id === tier3.id)
                      .map((trait) => {
                        return { trait: trait.name, percentage: 0 };
                      }),
                  };
            } else {
              const traitsForTier3 = traitSetting.filter(
                (trait) => trait.tier3Id === tier3.id,
              );
              const traitArray = traitsForTier3.map((trait) => {
                const latestHistory = getLatestUserQAHistory(
                  (userQA) => userQA.traitIdSelection === trait.id,
                );
                const traitStat = latestHistory?.traitStat;
                const traitPercentage = traitStat
                  ? (
                      (traitStat['accScore'] / (100 * traitStat['qNo'])) *
                      100
                    ).toFixed(1)
                  : 0;
                return { trait: trait.name, percentage: traitPercentage };
              });
              return { name: tier3.name, traits: traitArray };
            }
          }

          const userQAsForTier3 = allUserQAHistory.filter(
            (userQA) => userQA.tier3Id === tier3.id,
          );

          const correctAnswerCount = userQAsForTier3.filter(
            (userQA) => userQA.isCorrect,
          ).length;

          const totalQuestionsCount = userQAsForTier3.length;

          if (!correctAnswerCount || !totalQuestionsCount) {
            return {
              name: tier3.name,
              percentage: 0,
            };
          }

          return {
            name: tier3.name,
            percentage: totalQuestionsCount
              ? ((correctAnswerCount / totalQuestionsCount) * 100).toFixed(1)
              : 0,
          };
        });

        const totalPercentage = tier3s.reduce((sum, tier3) => {
          return sum + tier3.percentage;
        }, 0);

        if (!totalPercentage) {
          return {
            name: tier2.name,
            percentage: 0,
            tier3s: tier3s,
          };
        }

        return {
          name: tier2.name,
          percentage: (totalPercentage / tier3s.length).toFixed(1),
          tier3s: tier3s,
        };
      });

      response.push({
        name: tier1.name,
        tier2s: tier2s,
      });
    });

    return response;
  }

  async getUserStats(userId: number) {
    try {
      const stageHistories = await this.prismaService.stageHistory.findMany({
        where: { userId },
      });

      if (!stageHistories.length) {
        return {
          success: false,
          message: 'No stage history found for the user',
        };
      }

      const userStats = await Promise.all(
        stageHistories.map(async (history) => {
          const stageSetting = await this.prismaService.stageSetting.findFirst({
            where: { id: history.stageId },
          });

          let totalDays = 0;
          let currentStage: number | null = null;
          let nextStage: number | null = null;
          let testStatus = 0;

          if (stageSetting) {
            totalDays = stageSetting.days;
            currentStage = parseInt(stageSetting.level.split('S')[1]) || null;

            const nextStageSetting =
              await this.prismaService.stageSetting.findFirst({
                where: { startDay: stageSetting.startDay + stageSetting.days },
              });

            if (nextStageSetting) {
              nextStage =
                parseInt(nextStageSetting.level.split('S')[1]) || null;
            }

            testStatus = history.testStatus === 'COMPLETED' ? 1 : 0;
          }

          const start = stageSetting.startDay;
          const userDays = history.day;
          const progress = 1 + (userDays - start);

          return {
            currStage: currentStage,
            totalProgress: progress,
            totalDays,
            nextStage,
            testStatus,
          };
        }),
      );

      return { success: true, data: userStats };
    } catch (error) {
      throw error;
    }
  }

  getVariant() {
    const colors = ['green', 'blue', 'red', 'yellow', 'purple'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
}
