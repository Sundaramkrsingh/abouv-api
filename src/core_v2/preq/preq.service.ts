import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import {
  FIRST_STAGE_QUESTIONS,
  POWER_UP_USE_QUESTIONS_LIMIT,
  PREQ_TIME_LIMIT,
  REMAINING_STAGE_QUESTIONS,
  SECOND_STAGE_START_DAY,
} from 'src/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import * as coreDto from '../core-dto/core.dto';
import { LoggerService } from 'src/shared/logger/logger.service';
import { decrypt, decryptOptionsText } from 'prisma/encryption/crypto.utils';
import { shuffleWithStick } from 'prisma/seed.utils';
import { S3Service } from 'src/s3/s3.service';
import { envConfig } from 'src/shared/config/app.config';

@Injectable()
export class PreqService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
    private readonly s3: S3Service,
  ) {}

  private shuffledTier1s: any[] = [];
  private shuffledTier2s: any[] = [];
  private shuffledTier3s: any[] = [];

  private async createNewStageHistory(
    prisma,
    userId: number,
    questionsList: any[],
    randomIndex: number,
    day: number,
    stageId: number,
  ) {
    return await prisma.stageHistory.create({
      data: {
        userId,
        day,
        stageId,
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
        questionSet: questionsList.map((question, id) => ({
          questionId: question.id,
          isShown: id === randomIndex,
        })),
      },
      include: {
        stageSetting: {
          select: {
            timeLimit: true,
            totalQuestions: true,
            level: true,
          },
        },
      },
    });
  }

  async updateStageHistory(
    prisma,
    userId: number,
    questionsList: any[],
    randomIndex: number,
    day: number,
    id: number,
  ) {
    return await prisma.stageHistory.update({
      where: { id, userId },
      data: {
        userId,
        day,
        questionSet: questionsList.map((question, id) => ({
          questionId: question.id,
          isShown: id === randomIndex,
        })),
      },
      include: {
        stageSetting: {
          select: {
            timeLimit: true,
            totalQuestions: true,
            level: true,
          },
        },
      },
    });
  }

  // get the question list
  private async getQuestionsList(
    questionTakeLimit: number,
    attemptedQuestionIds: Set<number>,
    prisma,
    userId: number,
  ) {
    const questionsList = [];

    for (let i = 0; i < questionTakeLimit; i++) {
      const randomQuestionData = await getRandomQuestionData(
        attemptedQuestionIds,
        this.shuffledTier1s,
        this.shuffledTier2s,
        this.shuffledTier3s,
        userId,
        prisma,
      );
      questionsList.push(randomQuestionData);
    }
    return questionsList;
  }
  //handle the new stage creation
  private async handleNewStage(prisma, userId: number, stageHistory: any) {
    const qaHistories = await prisma.userQAHistory.findMany({
      where: { userId },
      select: { questionId: true },
    });

    const attemptedQuestionIds: any = new Set(
      qaHistories.map((qa) => qa.questionId),
    );

    const day = stageHistory ? stageHistory.day : 1;

    const questionTakeLimit =
      day < SECOND_STAGE_START_DAY
        ? FIRST_STAGE_QUESTIONS
        : REMAINING_STAGE_QUESTIONS;

    const questionsList = await this.getQuestionsList(
      questionTakeLimit,
      attemptedQuestionIds,
      prisma,
      userId,
    );

    if (questionsList.length === 0) {
      throw new BadRequestException('Not enough questions found');
    } else {
      const randomIndex = Math.floor(Math.random() * questionsList.length);

      if (
        stageHistory?.questionSet?.length === 0 &&
        stageHistory?.testStatus === 'IN_PROGRESS'
      ) {
        //update existing stage history
        stageHistory = await this.updateStageHistory(
          prisma,
          userId,
          questionsList,
          randomIndex,
          stageHistory?.day,
          stageHistory?.id,
        );
      } else {
        //create new stage history
        stageHistory = await this.createNewStageHistory(
          prisma,
          userId,
          questionsList,
          randomIndex,
          stageHistory ? stageHistory.day + 1 : 1,
          stageHistory ? stageHistory.stageId : 1,
        );

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
      }
    }
    return stageHistory;
  }
  // get the powerups consumption details
  private async getPowerUps(prisma, userId: number) {
    const powerUps = await prisma.trumpSetting.findMany();
    const powerUpsConsumed =
      await this.prismaService.trumpsConsumption.findMany({
        where: {
          userId,
          powerUpId: { in: powerUps.map((powerUp) => powerUp.id) },
          isConsumed: true,
          isLocked: true,
        },
      });

    const powerUpList = [];

    for (const powerup of powerUps) {
      if (powerup.type === 'POWER_UPS') {
        const consumedData = powerUpsConsumed.find(
          (consumption) => consumption.powerUpId === powerup.id,
        );

        if (consumedData && consumedData.nextIn > 0) {
          powerUpList.push({
            id: powerup.id,
            name: powerup.text,
            codeName: powerup.codeName,
            status: {
              isConsumed: consumedData.isConsumed,
              isLocked: consumedData.isLocked,
              nextIn: consumedData.nextIn,
            },
          });
        } else {
          if (consumedData && consumedData.nextIn === 0) {
            await prisma.trumpsConsumption.update({
              where: { id: consumedData.id },
              data: { isConsumed: false, isLocked: false },
            });
          }
          powerUpList.push({
            id: powerup.id,
            name: powerup.text,
            codeName: powerup.codeName,
            status: {
              isConsumed: false,
              isLocked: false,
              nextIn: 0,
            },
          });
        }
      }
    }

    return powerUpList;
  }
  private randomAbaPrediction(
    elements: string[],
    weights: number[],
    k: number,
  ) {
    try {
      const sample = [];
      const cumulativeWeights = [...weights];

      for (let i = 1; i < cumulativeWeights.length; i++) {
        cumulativeWeights[i] += cumulativeWeights[i - 1];
      }

      for (let _ = 0; _ < k; _++) {
        const r =
          Math.random() * cumulativeWeights[cumulativeWeights.length - 1];
        for (let i = 0; i < cumulativeWeights.length; i++) {
          if (r < cumulativeWeights[i]) {
            sample.push(elements[i]);
            elements.splice(i, 1);
            cumulativeWeights.splice(i, 1);
            const removedWeight = weights.splice(i, 1)[0];
            for (let j = i; j < cumulativeWeights.length; j++) {
              cumulativeWeights[j] -= removedWeight;
            }
            break;
          }
        }
      }
      return sample;
    } catch (error) {
      this.logger.logError('[PWA-API][PreqService -> postPreQInfo] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }
  async findUser(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with userId ${userId} doesn't exist!`);
    }

    return user;
  }

  private generateForesight(question: any, stageHistory: any): any {
    const isUnscoredQuestion =
      question.mCQPsychometricQA || question.mCQPsychometricOptionsQA;
    return {
      avgTime: isUnscoredQuestion ? undefined : question.avgTime || 0,
      accuracy: isUnscoredQuestion ? undefined : question.accuracy || 0,
      timeLimit: stageHistory.stageSetting.timeLimit,
      tier1: question.tier1?.name || '',
      tier3: question.tier3?.name || '',
      tier3Description:
        question.tier1?.name.toLowerCase() === 'trait series'
          ? question.tier3.descriptionShort
          : undefined,
    };
  }

  private generateQuestionResponse(question: any): any {
    let questionResponse = {};

    console.log(question);

    switch (true) {
      case question.type === 'MCQPSY':
        questionResponse = {
          id: question.id,
          text: decrypt(question.mCQPsychometricQA.text),
          type: question.type,
        };
        break;

      case question.type === 'MCQPSYOPTION':
        questionResponse = {
          id: question.id,
          text: decrypt(question.mCQPsychometricOptionsQA.text),
          options: decryptOptionsText(
            shuffle(question.mCQPsychometricOptionsQA.options),
          ),
          type: question.type,
        };
        break;

      case question.type === 'MCQ':
        questionResponse = {
          id: question.id,
          text: decrypt(question.mCQQA.text),
          options: decryptOptionsText(
            shuffleWithStick(question.mCQQA.options, question.mCQQA.stick),
          ),
          type: question.type,
        };

        if (envConfig.env === 'DEV') {
          questionResponse['imageUrl'] = question.mCQQA.imageUrl;
        } else {
          if (question.mCQQA.imageUrl != null) {
            this.s3
              .getSignedFileUrl(
                question.mCQQA.imageUrl,
                envConfig.S3.creativePotentialBucket,
              )
              .then((url) => {
                questionResponse['imageUrl'] = url;
              });
          } else {
            questionResponse['imageUrl'] = null;
          }
        }
        break;

      default:
        throw new NotFoundException(
          `Question type ${question.type} is not supported`,
        );
    }

    return questionResponse;
  }

  private lockPowerUps(powerups: any[], question: any): any[] {
    // check if we should lock the powerups
    const shouldLock =
      !!question.mCQPsychometricQA || !!question.mCQPsychometricOptionsQA;

    if (shouldLock) {
      powerups.forEach((powerup) => {
        powerup.status.isLocked = true;
      });
    }
    return powerups;
  }

  private isSessionComplete(day: number, totalQuestions: number): boolean {
    return (
      (day < SECOND_STAGE_START_DAY &&
        totalQuestions === FIRST_STAGE_QUESTIONS) ||
      (day >= SECOND_STAGE_START_DAY &&
        totalQuestions === REMAINING_STAGE_QUESTIONS)
    );
  }

  async getPreqInfo(userId: number) {
    type QuestionSetItem = {
      questionId: number;
      isShown: boolean;
    };

    const response: any = {};

    //check the user
    this.findUser(userId);

    return this.prismaService.$transaction(async (prisma) => {
      let stageHistory = await prisma.stageHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          stageSetting: {
            select: {
              timeLimit: true,
              totalQuestions: true,
              level: true,
            },
          },
        },
      });

      // time constraint
      const today = new Date();
      const prevStageDay = stageHistory?.createdAt.getDate();

      if (
        !stageHistory ||
        (stageHistory.questionSet.length == 0 &&
          stageHistory.testStatus === 'IN_PROGRESS') ||
        (prevStageDay != today.getDate() &&
          stageHistory.testStatus === 'COMPLETED')
      ) {
        stageHistory = await this.handleNewStage(prisma, userId, stageHistory);
      }

      const userAllStagesData = await prisma.stageHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      const questionSet: QuestionSetItem[] =
        stageHistory.questionSet as QuestionSetItem[];

      const randomIndex = Math.floor(Math.random() * questionSet.length);

      await prisma.stageHistory.update({
        where: { id: stageHistory.id },
        data: {
          questionSet: questionSet.map((item, id) => ({
            questionId: item.questionId,
            isShown: id === randomIndex,
          })),
        },
      });

      const shownQuestionData = questionSet.find((data) => data.isShown);

      response['header'] = {
        testType: 'Mix Mode',
        stage: parseInt(stageHistory.stageSetting.level.slice(1), 10),
        session: stageHistory.day,
        timeLimitPreQ: PREQ_TIME_LIMIT,
        timeLimitInQ: stageHistory.stageSetting.timeLimit,
      };
      response['powerups'] = await this.getPowerUps(prisma, userId);
      response['assessment'] = {
        sessionCompleted: this.isSessionComplete(
          stageHistory.day,
          stageHistory?.totalQuestions,
        ),
        totalQuestions: stageHistory?.stageSetting.totalQuestions,
        currentQuestionSet:
          questionSet.length > 0
            ? stageHistory?.stageSetting.totalQuestions -
              (questionSet.length - 1)
            : stageHistory?.totalQuestions,
      };
      response['firstTimeUser'] =
        userAllStagesData[0] && userAllStagesData[0].totalQuestions <= 2;

      if (shownQuestionData) {
        let question = null;

        question = await prisma.question.findFirst({
          where: { id: shownQuestionData.questionId },
          include: {
            mCQQA: true,
            mCQPsychometricQA: true,
            mCQPsychometricOptionsQA: true,
            tier1: true,
            tier2: true,
            tier3: true,
          },
        });

        //first time user trait series restriction util 3 questions
        if (
          userAllStagesData[0] &&
          userAllStagesData[0].totalQuestions <= 2 &&
          question.tier1?.name?.toLowerCase() === 'trait series'
        ) {
          let randomIndex = Math.floor(Math.random() * questionSet.length);
          let randomQuestion = await prisma.question.findFirst({
            where: { id: questionSet[randomIndex].questionId },
            include: {
              mCQQA: true,
              mCQPsychometricQA: true,
              mCQPsychometricOptionsQA: true,
              tier1: true,
              tier2: true,
              tier3: true,
            },
          });

          // Keep finding a random question until it's not 'Trait Series'
          while (randomQuestion.tier1?.name?.toLowerCase() === 'trait series') {
            randomIndex = Math.floor(Math.random() * questionSet.length);
            randomQuestion = await prisma.question.findFirst({
              where: { id: questionSet[randomIndex].questionId },
              include: {
                mCQQA: true,
                mCQPsychometricQA: true,
                mCQPsychometricOptionsQA: true,
                tier1: true,
                tier2: true,
                tier3: true,
              },
            });
          }

          // Update the questionSet to reflect the non-'Trait Series' question
          await prisma.stageHistory.update({
            where: { id: stageHistory.id },
            data: {
              questionSet: questionSet.map((item, id) => ({
                questionId: item.questionId,
                isShown: id === randomIndex,
              })),
            },
          });

          // Use the newly selected question
          question = randomQuestion;
        }

        response['foresight'] = this.generateForesight(question, stageHistory);

        //generate the question  response based on the question type.
        response['question'] = this.generateQuestionResponse(question);
        //locks powerups if needed
        response['powerups'] = this.lockPowerUps(
          response['powerups'],
          question,
        );
      }

      return response;
    });
  }

  async postPreQInfo(userId: number, payload: coreDto.PostPreQDto) {
    try {
      const { powerUpId, questionId } = payload;

      const response = {};

      const [checkUser, trumpSettingData, existingConsumption] =
        await Promise.all([
          this.prismaService.user.findFirst({
            where: {
              id: +userId,
            },
          }),
          this.prismaService.trumpSetting.findFirst({
            where: { id: +powerUpId },
          }),
          this.prismaService.trumpsConsumption.findFirst({
            where: {
              userId: +userId,
              powerUpId: +powerUpId,
              isConsumed: true,
              nextIn: { not: 0 },
            },
            orderBy: { createdAt: 'desc' },
          }),
        ]);

      const ask_aba_value = ['T', 'F'];
      const weights = [0.98, 0.2];

      //Validation Checks
      if (!checkUser) {
        throw new BadRequestException('Invalid User');
      }

      if (!trumpSettingData) {
        throw new NotFoundException('Power-up setting not found');
      }

      if (existingConsumption) {
        throw new NotAcceptableException(
          `Power-up is already consumed and not ready for next use at ${existingConsumption.nextIn}`,
        );
      }

      const getQuestionAnswerData = await this.prismaService.question.findFirst(
        {
          where: { id: questionId },
          include: { mCQQA: true },
        },
      );
      if (!getQuestionAnswerData) {
        throw new NotFoundException('Question not found');
      }

      const newTrumpConsumptionData =
        await this.prismaService.trumpsConsumption.create({
          data: {
            userId: +userId,
            powerUpId,
            isLocked: true,
            isConsumed: true,
            nextIn: POWER_UP_USE_QUESTIONS_LIMIT,
          },
        });

      if (trumpSettingData.codeName === 'ASK_ABA') {
        const derivedAbaPediction = this.randomAbaPrediction(
          ask_aba_value,
          weights,
          3,
        );

        if (derivedAbaPediction[0] === 'T') {
          response['ask_aba_answer'] = getQuestionAnswerData.mCQQA.answer;
        } else {
          const correctAnswerId = getQuestionAnswerData.mCQQA.answer;
          const incorrectOptions = getQuestionAnswerData.mCQQA.options.filter(
            (option: { id: string; text: string; position: number }) =>
              option.id !== correctAnswerId,
          );
          const { id }: any =
            incorrectOptions[
              Math.floor(Math.random() * incorrectOptions.length)
            ];

          response['ask_aba_answer'] = id;
        }
      }

      if (trumpSettingData.codeName === 'BETTER_HALF') {
        response['better_half_answer'] = {
          id: getQuestionAnswerData?.mCQQA?.answer,
        };
      }

      response['powerUpId'] = newTrumpConsumptionData.powerUpId;
      response['isConsumed'] = newTrumpConsumptionData.isConsumed;
      response['codeName'] = trumpSettingData.codeName;

      return response;
    } catch (error) {
      this.logger.logError('[PWA-API][PreqService -> postPreQInfo] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }
}

// Function to get random question data
async function getRandomQuestionData(
  attemptedQuestionIds: Set<number>,
  shuffledTier1s: any[],
  shuffledTier2s: any[],
  shuffledTier3s: any[],
  userId: number,
  prisma,
) {
  try {
    // Select random tier 1
    if (shuffledTier1s.length === 0) {
      const activeTier1s = await prisma.tier1.findMany({
        where: { isActive: true },
      });
      shuffledTier1s.push(...shuffle(activeTier1s));
    }
    const randomTier1 = shuffledTier1s.pop();

    console.log('>>>>> randomTier1', randomTier1);

    // Check if electives are available for this user and randomTier1
    const electives = await prisma.elective.findFirst({
      where: {
        tier1Id: randomTier1.id,
        profile: {
          userId,
        },
      },
    });

    // Check if all tier 2 options for the selected tier 1 are exhausted
    if (shuffledTier2s[randomTier1.id]?.length === 0) {
      shuffledTier2s[randomTier1.id] = null; // Reset tier 2 options for tier 1
    }

    // Select random tier 2 associated with selected tier 1
    if (!shuffledTier2s[randomTier1.id]) {
      let activeTier2s;

      // Check if electives contain tier2 for this tier1
      if (electives) {
        activeTier2s = await prisma.tier2.findMany({
          where: {
            isActive: true,
            id: electives.tier2Id,
          },
        });
      } else {
        activeTier2s = await prisma.tier2.findMany({
          where: { isActive: true, tier1Id: randomTier1.id },
        });
      }

      shuffledTier2s[randomTier1.id] = shuffle(activeTier2s);
    }
    const randomTier2 = shuffledTier2s[randomTier1.id].pop();

    console.log('>>>>> randomTier2', randomTier2);

    // Check if all tier 3 options for the selected tier 2 are exhausted
    if (shuffledTier3s[randomTier2.id]?.length === 0) {
      shuffledTier3s[randomTier2.id] = null; // Reset tier 3 options for tier 2
    }

    // Select random tier 3 associated with selected tier 2
    if (!shuffledTier3s[randomTier2.id]) {
      let activeTier3s;

      // If electives exist, prioritize elective tier3s
      if (electives && electives.tier3Id) {
        activeTier3s = await prisma.tier3.findMany({
          where: {
            isActive: true,
            id: { in: electives.tier3Id }, // Use elective's selected tier3 array
            tier2Id: randomTier2.id,
          },
        });
      } else {
        activeTier3s = await prisma.tier3.findMany({
          where: { isActive: true, tier2Id: randomTier2.id },
        });
      }

      shuffledTier3s[randomTier2.id] = shuffle(activeTier3s);
    }
    const randomTier3 = shuffledTier3s[randomTier2.id].pop();

    console.log('>>>>> randomTier3', randomTier3);

    // Fetch questions based on selected tier 3
    let questions = await prisma.question.findMany({
      where: {
        isActive: true,
        tier3Id: randomTier3.id,
        id: { notIn: Array.from(attemptedQuestionIds) },
      },
      include: {
        mCQQA: true,
        mCQPsychometricQA: true,
        mCQPsychometricOptionsQA: true,
        tier1: true,
        tier2: true,
        tier3: true,
      },
    });

    // If no questions found, throw error
    if (questions.length === 0) {
      throw new NotFoundException(
        `No available questions found for Tier2 Id: ${randomTier2.name} and Tier3 Id: ${randomTier3.name}`,
      );
    }

    // Shuffle the questions
    questions = shuffle(questions);

    // Pop questions from shuffled pool until a non-repeated question is found
    let question = questions.pop();
    console.log('>>>>> question', question);

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
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Function to shuffle an array using Fisher-Yates algorithm
function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
