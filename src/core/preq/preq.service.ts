import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { preQDtoSchema } from './preq.dto';

@Injectable()
export class PreqService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async getPreqTrumps(userId: number) {
    const response = {};
    const powerUp = [];
    const wildcard = [];

    // Fetch all power-up settings
    const powerUps = await this.prismaService.trumpSetting.findMany();

    // Fetch power-ups consumed by the user
    const powerUpsConsumed =
      await this.prismaService.trumpsConsumption.findMany({
        where: {
          userId,
          powerUpId: { in: powerUps.map((powerUp) => powerUp.id) },
          isConsumed: true,
          isLocked: true,
        },
      });

    for (const powerup of powerUps) {
      if (powerup.type === 'POWER_UPS') {
        const consumedData = powerUpsConsumed.find(
          (consumption) => consumption.powerUpId === powerup.id,
        );

        if (consumedData && consumedData.nextIn > 0) {
          powerUp.push({
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
            await this.prismaService.trumpsConsumption.update({
              where: {
                id: consumedData.id,
              },
              data: {
                isConsumed: false,
                isLocked: false,
              },
            });
          }
          powerUp.push({
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
      } else {
        const consumedData = powerUpsConsumed.find(
          (consumption) => consumption.powerUpId === powerup.id,
        );

        if (consumedData && consumedData.nextIn > 0) {
          wildcard.push({
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
            await this.prismaService.trumpsConsumption.update({
              where: {
                id: consumedData.id,
              },
              data: {
                isConsumed: false,
                isLocked: false,
              },
            });
          }
          wildcard.push({
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

    response['powerUps'] = powerUp;
    response['wildcards'] = wildcard;

    return response;
  }

  async createPreqTrumps(userId: number, data: any) {
    await this.findUser(userId);

    const preqData = preQDtoSchema.parse(data);

    const ask_aba_value = ['T', 'F'];
    const weights = [0.98, 0.2];
    const response = {};

    const trumpSettingData = await this.prismaService.trumpSetting.findFirst({
      where: { id: preqData.powerUpId },
    });

    if (!trumpSettingData) {
      throw new NotFoundException('Power-up setting not found');
    }

    const existingConsumption =
      await this.prismaService.trumpsConsumption.findFirst({
        where: {
          userId,
          powerUpId: preqData.powerUpId,
          isConsumed: true,
          nextIn: { not: 0 },
        },
        orderBy: { createdAt: 'desc' },
      });

    if (existingConsumption) {
      throw new NotAcceptableException(
        `Power-up is already consumed and not ready for next use at ${existingConsumption.nextIn}`,
      );
    }

    const newTrumpConsumptionData =
      await this.prismaService.trumpsConsumption.create({
        data: {
          userId,
          powerUpId: trumpSettingData.id,
          isLocked: true,
          isConsumed: true,
          nextIn: 10,
        },
      });

    const getQuestionAnswerData = await this.prismaService.question.findFirst({
      where: { id: preqData.questionId },
      include: { mCQQA: true },
    });

    if (!getQuestionAnswerData) {
      throw new NotFoundException('Question not found');
    }

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
          incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];

        response['ask_aba_answer'] = id;
      }
    }

    if (trumpSettingData.codeName === 'BETTER_HALF') {
      response['betterHalfDetails'] = {
        id: getQuestionAnswerData?.mCQQA?.answer,
      };
    }

    response['powerUpId'] = newTrumpConsumptionData.powerUpId;
    response['isConsumed'] = newTrumpConsumptionData.isConsumed;
    response['codeName'] = trumpSettingData.codeName;

    return response;
  }

  private randomAbaPrediction(
    elements: string[],
    weights: number[],
    k: number,
  ) {
    const sample = [];
    const cumulativeWeights = [...weights];

    for (let i = 1; i < cumulativeWeights.length; i++) {
      cumulativeWeights[i] += cumulativeWeights[i - 1];
    }

    for (let _ = 0; _ < k; _++) {
      const r = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];
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
  }

  async resetAllTrumps(userId: number) {
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
              nextIn: 0,
              isConsumed: false,
              isLocked: false,
            },
          });
        }
      }
      return { msg: 'All trumps reset successfully' };
    } else {
      throw new NotFoundException(`No Trumps consumption found for ${userId}`);
    }
  }
}
