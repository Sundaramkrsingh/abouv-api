import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TestsService {
  constructor(private readonly prismaService: PrismaService) {}
  async getTestsList(userId: number) {
    const response = {};

    // Fetch all tiers data with tier3 and Elective details
    const tiersData = await this.prismaService.tier1.findMany({
      include: {
        tier2: {
          include: {
            tier3: true,
            Elective: {
              select: {
                tier3Id: true,
              },
              where: {
                profile: {
                  userId,
                },
              },
            },
          },
        },
      },
    });

    tiersData.forEach((tier1) => {
      tier1.tier2.forEach((tier2) => {
        tier2.tier3.forEach((tier3) => {
          const isElectivePresent = tier2.Elective.some((elective) =>
            elective.tier3Id.includes(tier3.id),
          );

          if (isElectivePresent) {
            (tier3 as any).isElectivePresent = isElectivePresent;
          }
        });
      });
    });

    response['tiersData'] = tiersData;
    return response;
  }

  async getTier3TestsDetails(tier3Id: number) {
    const response = {};

    const testsData = await this.prismaService.tests.findFirst({
      where: {
        tier3Id: tier3Id,
      },
      include: {
        tier3: {
          select: {
            name: true,
          },
        },
      },
    });

    response['testsData'] = testsData;

    return response;
  }
}
