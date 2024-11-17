import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserListService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllUsersSummary() {
    try {
      const users = await this.prismaService.user.findMany({
        select: {
          id: true,
          createdAt: true,
          profile: {
            select: {
              fullName: true,
              email: true,
              profileCompletion: true,
            },
          },
          session: {
            select: {
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
          stageHistory: {
            select: {
              stageSetting: {
                select: {
                  name: true,
                },
              },
              gradeSetting: {
                select: {
                  name: true,
                },
              },
              totalScore: true,
            },
            orderBy: {
              day: 'desc',
            },
            take: 1,
          },
        },
      });

      const usersSummary = users
        .filter((user) => user.profile?.fullName != null)
        .map((user) => {
          const profile = user.profile;

          const latestSession = user.session?.[0];
          const createdAtDate = new Date(
            latestSession?.createdAt || user.createdAt,
          );
          const currentDate = new Date();
          const daysSinceCreation = Math.floor(
            (currentDate.getTime() - createdAtDate.getTime()) /
              (1000 * 3600 * 24),
          );

          const DAU =
            createdAtDate.toDateString() === currentDate.toDateString() ? 1 : 0;
          const WAU = daysSinceCreation < 7 && DAU === 0 ? 1 : 0;
          const MAU = daysSinceCreation < 30 && DAU === 0 ? 1 : 0;

          let status = '';

          if (DAU > 0) {
            status = 'DAU'; //daily active user
          } else if (WAU > 0) {
            status = 'WAU'; //weekly active user
          } else if (MAU > 0) {
            status = 'MAU'; //monthly active user
          } else {
            status = 'IAU'; //inactive user
          }

          return {
            id: user.id,
            fullName: profile?.fullName,
            email: profile?.email,
            stage: user.stageHistory?.[0]?.stageSetting?.name,
            grade: user.stageHistory?.[0]?.gradeSetting?.name,
            points: user.stageHistory?.[0]?.totalScore || 0,
            nationalRank: null,
            status,
            profileCompletion: profile?.profileCompletion,
            createdOn: new Date(user.createdAt).toLocaleDateString(),
          };
        });

      return usersSummary;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }
}
