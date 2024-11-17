/* eslint-disable prettier/prettier */
import {
  NotFoundException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { isNumber } from 'src/shared/utils';

@Injectable()
export class SkillsService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Skills
   */
  async findAllAndCompute(value?: number | string) {
    const skills = await this.prismaService.tier3.findMany({
      where: isNumber(value) ? { id: value as number } : {},
      include: {
        tier2: {
          include: {
            tier1: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (!skills) {
      throw new NotFoundException(`Skills with id ${value} doesn't exists!`);
    }

    const skillsList = skills.reduce(
      (acc: any, item) => {
        const { tier2, ...skill } = item;
        const { tier1, ...rest } = tier2;
        const newItem = { ...skill, ...{ tier2: rest }, tier1 };
        const tier1Name = newItem.tier1.name;

        acc.result.push(newItem);
        acc.tier1TotalSkills[tier1Name] =
          (acc.tier1TotalSkills[tier1Name] || 0) + 1;

        return acc;
      },
      { result: [], tier1TotalSkills: {} },
    );

    if (value === 'ALL_SKILLS_WITH_COUNTS') {
      return {
        totalSkills: skills.length,
        skills: skillsList.result,
      };
    } else if (value === 'TIER1_TOTAL_SKILLS') {
      return skillsList.tier1TotalSkills;
    } else if (isNumber(value)) {
      return skillsList.result[0] || null;
    }
  }

  getDescription(id: number) {
    switch (id) {
      case 3:
        return 'Question to test your general domain knowledge';
      case 4:
        return 'Good to have skills';
      case 6:
        return 'Question to test your Technical Specializations';
    }
  }

  async getFormattedSeries(allSkills: string) {
    const allSkillsBool =
      typeof allSkills === 'string'
        ? allSkills.toLowerCase() === 'true'
        : allSkills;
    let seriesNumbers;
    if (allSkillsBool) {
      seriesNumbers = [1, 2, 3, 4, 5, 6];
    } else if (!allSkillsBool) {
      seriesNumbers = [3, 4, 6];
    }

    const allSeries = await Promise.all(
      seriesNumbers.map(async (t1Num) => {
        const t1 = await this.prismaService.tier1.findUnique({
          where: {
            id: t1Num,
          },
        });
        const t2 = await this.prismaService.tier2.findMany({
          where: {
            tier1Id: t1Num,
          },
        });
        const seriesObj = {
          id: t1Num,
          name: t1.name,
          foregroundColor: t1.chipForegroundColor,
          backgroundColor: t1.backgroundColor,
          description: this.getDescription(t1.id),
          tier2skills: await Promise.all(
            t2.map(async (tier2) => {
              const t3 = await this.prismaService.tier3.findMany({
                where: {
                  tier2Id: tier2.id,
                },
              });

              const t2ToReturn = {
                id: tier2.id,
                name: tier2.name,
                description: tier2.descriptions,
                createdAt: tier2.createdAt,
                updatedAt: tier2.updatedAt,
                tier1Id: tier2.tier1Id,
                tier3skills: t3.map((tier3) => ({
                  id: tier3.id,
                  createdAt: tier3.createdAt,
                  updatedAt: tier3.updatedAt,
                  tier2Id: tier2.id,
                  name: tier3.name,
                })),
              };
              return t2ToReturn;
            }),
          ),
        };
        return seriesObj;
      }),
    );
    return allSeries;
  }

  /**
   * Tier 1
   */
  async findAllTier1() {
    return this.prismaService.tier1.findMany();
  }

  async findTier1(id: number) {
    const record = await this.prismaService.tier1.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Tier1 with id ${id} doesn't exists!`);
    }

    return record;
  }

  async createTier1(createTier1Dto: any) {
    const existingRecord = await this.prismaService.tier1.findUnique({
      where: { name: createTier1Dto.name },
    });

    if (existingRecord) {
      throw new ConflictException(`${createTier1Dto.name} already exists!`);
    }

    return this.prismaService.tier1.create({
      data: createTier1Dto,
    });
  }

  async updateTier1(tier1Id: number, updateTier1Dto: any) {
    await this.findTier1(tier1Id);

    return this.prismaService.tier1.update({
      where: { id: tier1Id },
      data: {
        ...updateTier1Dto,
      },
    });
  }

  // TODO: fix
  async deleteTier1(tier1Id: number) {
    await this.findTier1(tier1Id);

    await this.prismaService.tier1.deleteMany({
      where: { id: tier1Id },
    });

    return {
      message: `Tier1 with tier1Id ${tier1Id} is deleted successfully!`,
    };
  }

  /**
   * Tier 2
   */
  async findAllTier2(tier1Id: number) {
    return this.prismaService.tier2.findMany({
      where: {
        tier1Id,
      },
    });
  }

  async findTier2(tier1Id: number, tier2Id: number) {
    const record = await this.prismaService.tier2.findUnique({
      where: {
        id: tier2Id,
        AND: {
          tier1Id,
        },
      },
    });

    if (!record) {
      throw new NotFoundException(
        `Tier2 with tier2Id ${tier2Id} doesn't exist!`,
      );
    }

    return record;
  }

  async createTier2(tier1Id: number, createTier2Dto: any) {
    await this.findTier1(tier1Id);

    const existingRecord = await this.prismaService.tier2.findUnique({
      where: { name: createTier2Dto.name },
    });

    if (existingRecord) {
      throw new ConflictException(`${createTier2Dto.name} already exists!`);
    }

    return this.prismaService.tier2.create({
      data: {
        ...createTier2Dto,
        tier1: {
          connect: {
            id: tier1Id,
          },
        },
      },
    });
  }

  async updateTier2(tier1Id: number, tier2Id: number, updateTier2Dto: any) {
    await this.findTier1(tier1Id);

    const existingRecord = await this.prismaService.tier2.findUnique({
      where: { id: tier2Id },
    });

    if (!existingRecord) {
      throw new NotFoundException(`Tier3 with id ${tier2Id} doesn't exists!`);
    }

    return this.prismaService.tier2.update({
      where: { id: tier2Id },
      data: {
        ...updateTier2Dto,
      },
    });
  }

  // TODO: fix
  async deleteTier2(tier1Id: number, tier2Id: number) {
    await this.findTier1(tier1Id);

    const existingRecord = await this.prismaService.tier2.findUnique({
      where: { id: tier2Id },
    });

    if (!existingRecord) {
      throw new NotFoundException(
        `Tier2 with tier2Id ${tier2Id} doesn't exists!`,
      );
    }

    const deleteTier3 = this.prismaService.tier3.deleteMany({
      where: { tier2Id },
    });

    const deleteTier2 = this.prismaService.tier2.delete({
      where: { id: tier2Id },
    });

    await this.prismaService.$transaction([deleteTier3, deleteTier2]);

    return {
      message: `Tier2 with tier2Id ${tier2Id} is deleted successfully!`,
    };
  }

  /**
   * Tier 3
   */
  async findAllTier3(tier1Id: number, tier2Id: number) {
    return this.prismaService.tier3.findMany({
      where: {
        tier2Id,
      },
    });
  }

  async findTier3(tier1Id: number, tier2Id: number, tier3Id: number) {
    const record = await this.prismaService.tier3.findUnique({
      where: {
        id: tier3Id,
        AND: {
          tier2Id,
        },
      },
    });

    if (!record) {
      throw new NotFoundException(
        `Tier3 with tier3Id ${tier2Id} doesn't exist!`,
      );
    }

    return record;
  }

  async createTier3(tier1Id: number, tier2Id: number, createTier3Dto: any) {
    await this.findTier1(tier1Id);
    await this.findTier2(tier1Id, tier2Id);

    const existingRecord = await this.prismaService.tier3.findUnique({
      where: {
        name_tier2Id: {
          name: createTier3Dto.name,
          tier2Id: tier2Id,
        },
      },
    });

    if (existingRecord) {
      throw new ConflictException(`${createTier3Dto.name} already exists!`);
    }

    return this.prismaService.tier3.create({
      data: {
        ...createTier3Dto,
        tier2: {
          connect: {
            id: tier2Id,
          },
        },
      },
    });
  }

  async updateTier3(
    tier1Id: number,
    tier2Id: number,
    tier3Id: number,
    updateTier3Dto,
  ) {
    await this.findTier1(tier1Id);
    await this.findTier2(tier1Id, tier2Id);

    const existingRecord = await this.prismaService.tier3.findUnique({
      where: { id: tier3Id },
    });

    if (!existingRecord) {
      throw new NotFoundException(`Tier3 with id ${tier3Id} doesn't exists!`);
    }

    return this.prismaService.tier3.update({
      where: { id: tier3Id },
      data: {
        ...updateTier3Dto,
      },
    });
  }

  async updateIsActiveTier3(
    tier1Id: number,
    tier2Id: number,
    tier3Id: number,
    updateIsActiveTier3,
  ) {
    await this.findTier1(tier1Id);
    await this.findTier2(tier1Id, tier2Id);

    const existingRecord = await this.prismaService.tier3.findUnique({
      where: { id: tier3Id },
    });

    if (!existingRecord) {
      throw new NotFoundException(`Tier3 with id ${tier3Id} doesn't exists!`);
    }

    return this.prismaService.tier3.update({
      where: { id: tier3Id },
      data: {
        ...updateIsActiveTier3,
      },
    });
  }

  async deleteTier3(tier1Id: number, tier2Id: number, tier3Id: number) {
    await this.findTier1(tier1Id);
    await this.findTier2(tier1Id, tier2Id);

    const existingRecord = await this.prismaService.tier3.findUnique({
      where: { id: tier3Id },
    });

    if (!existingRecord) {
      throw new NotFoundException(`Tier3 with id ${tier3Id} doesn't exists!`);
    }

    await this.prismaService.tier3.delete({
      where: { id: tier3Id },
    });

    return {
      message: `Tier3 with id ${tier3Id} is deleted successfully!`,
    };
  }
}
