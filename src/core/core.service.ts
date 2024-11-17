import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CoreService {
  constructor(private readonly prismaService: PrismaService) {}

  private shuffledTier1s: any[] = [];
  private shuffledTier2s: any[] = [];
  private shuffledTier3s: any[] = [];

  async getCoreData(userId: number) {
    const response: any = {};

    let stageHistory = await this.prismaService.stageHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!stageHistory) {
      throw new BadRequestException(
        `No stage history found from User: ${userId}`,
      );
    }

    const allStageHistoryRecords =
      await this.prismaService.stageHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

    if (!stageHistory) {
      // Create a new stage history entry if not present
      stageHistory = await this.prismaService.stageHistory.create({
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
      });
      await this.prismaService.userStats.create({
        data: {
          netScore: 0,
          currentGrade: 'G1',
          currentStage: 'S01',
          userId,
        },
      });
    } else {
      const today = new Date();
      const latestStageDay = stageHistory.createdAt.getDate();

      if (
        latestStageDay !== today.getDate() &&
        stageHistory.testStatus === 'COMPLETED'
      ) {
        const stageSetting = await this.prismaService.stageSetting.findMany({
          where: {
            startDay: {
              lte: stageHistory.day + 1,
            },
            endDay: {
              gte: stageHistory.day + 1,
            },
          },
        });

        let derivedStageId = 0;

        if (stageSetting.length > 0) {
          derivedStageId = stageSetting[0].id;
        }

        // Create a new stage history entry with an incremented day
        stageHistory = await this.prismaService.stageHistory.create({
          data: {
            userId,
            day: stageHistory.day + 1,
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
      }
    }

    response['testType'] = 'Mix Mode';
    response['day'] = stageHistory?.day || 0;
    response['questionStars'] = 100;

    const qaHistories = await this.prismaService.userQAHistory.findMany({
      where: { userId },
      select: { questionId: true },
    });

    const attemptedQuestionIds = new Set(
      qaHistories.map((qa) => qa.questionId),
    );

    const takeLimit = stageHistory?.day < 6 ? 20 : 16; //TODO make it dynamic based on panel

    response['takeLimit'] = takeLimit;

    const QuestionsList = [];

    for (let i = 0; i < takeLimit - stageHistory.totalQuestions; i++) {
      const randomQuestionData = await getRandomQuestionData(
        attemptedQuestionIds,
        this.prismaService,
        this.shuffledTier1s,
        this.shuffledTier2s,
        this.shuffledTier3s,
      );
      QuestionsList.push(randomQuestionData);
    }

    // Convert selected questions into preQ format
    response['core'] = QuestionsList.map((randomQuestion, index) => {
      const questionData = {
        preq: {
          foresight: {
            avgTime: randomQuestion.avgTime || 0,
            accuracy: randomQuestion.accuracy || 0,
            timeLimit: takeLimit || 0,
            tier1: randomQuestion.tier1?.name || '',
            tier2: randomQuestion.tier2?.name || '',
            tier3: randomQuestion.tier3?.name || '',
          },
        },
        inq: {
          question: randomQuestion.mCQQA.text,
          questionId: randomQuestion.id,
          options: randomQuestion.mCQQA.options,
        },
      };

      if (
        allStageHistoryRecords[0] &&
        index < 4 &&
        allStageHistoryRecords[0].totalQuestions < 4
      ) {
        const questionNumber =
          allStageHistoryRecords[0].totalQuestions + index + 1;
        if (
          questionNumber === 1 ||
          questionNumber === 2 ||
          questionNumber === 3 ||
          questionNumber === 4
        ) {
          questionData['firstAssessment'] = {
            isFirstQ: questionNumber === 1,
            isSecondQ: questionNumber === 2,
            isThirdQ: questionNumber === 3,
            isFourthQ: questionNumber === 4,
          };
        }
      }

      return questionData;
    });

    return response;
  }
}

// Function to get random question data
async function getRandomQuestionData(
  attemptedQuestionIds: Set<number>,
  prismaService: PrismaService,
  shuffledTier1s: any[],
  shuffledTier2s: any[],
  shuffledTier3s: any[],
) {
  // Select random tier 1
  if (shuffledTier1s.length === 0) {
    const activeTier1s = await prismaService.tier1.findMany({
      where: { isActive: true },
    });
    shuffledTier1s.push(...shuffle(activeTier1s));
  }
  const randomTier1 = shuffledTier1s.pop();

  // Check if all tier 2 options for the selected tier 1 are exhausted
  if (shuffledTier2s[randomTier1.id]?.length === 0) {
    shuffledTier2s[randomTier1.id] = null; // Reset tier 2 options for tier 1
  }

  // Select random tier 2 associated with selected tier 1
  if (!shuffledTier2s[randomTier1.id]) {
    const activeTier2s = await prismaService.tier2.findMany({
      where: { isActive: true, tier1Id: randomTier1.id },
    });
    shuffledTier2s[randomTier1.id] = shuffle(activeTier2s);
  }
  const randomTier2 = shuffledTier2s[randomTier1.id].pop();

  // Check if all tier 3 options for the selected tier 2 are exhausted
  if (shuffledTier3s[randomTier2.id]?.length === 0) {
    shuffledTier3s[randomTier2.id] = null; // Reset tier 3 options for tier 2
  }

  // Select random tier 3 associated with selected tier 2
  if (!shuffledTier3s[randomTier2.id]) {
    const activeTier3s = await prismaService.tier3.findMany({
      where: { isActive: true, tier2Id: randomTier2.id },
    });
    shuffledTier3s[randomTier2.id] = shuffle(activeTier3s);
  }
  const randomTier3 = shuffledTier3s[randomTier2.id].pop();

  // Fetch questions based on selected tier 3
  let questions = await prismaService.question.findMany({
    where: {
      isActive: true,
      tier3Id: randomTier3.id,
      id: { notIn: Array.from(attemptedQuestionIds) },
    },
    include: { mCQQA: true, tier1: true, tier2: true, tier3: true },
  });

  //If no questions found, throw error
  if (questions.length === 0) {
    throw new NotFoundException(
      'No available questions found for the selected tiers',
    );
  }

  // Shuffle the questions
  questions = shuffle(questions);

  // Pop questions from shuffled pool until a non-repeated question is found
  let question = questions.pop();
  while (attemptedQuestionIds.has(question.id) && questions.length > 0) {
    question = questions.pop();
  }

  // If all questions are repeated, throw error
  if (!question || attemptedQuestionIds.has(question.id)) {
    throw new NotFoundException(
      'All questions from the selected tier are repeated',
    );
  }

  // Add the selected question to the attempted questions set
  attemptedQuestionIds.add(question.id);

  return question;
}

// Function to shuffle an array using Fisher-Yates algorithm
function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
