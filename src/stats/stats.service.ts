import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RankingFilterDto } from './dto/top-ranking.dto';
import { envConfig } from 'src/shared/config/app.config';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async getTopUserList(filter: RankingFilterDto) {
    try {
      const whereCondition: any = {};

      if (filter?.state) {
        whereCondition.user = {
          ...whereCondition?.user,
          profile: {
            ...whereCondition?.user?.profile,
            address: {
              ...whereCondition?.user?.profile?.address,
              state: filter.state,
            },
          },
        };
      }

      if (filter?.country) {
        whereCondition.user = {
          ...whereCondition?.user,
          profile: {
            ...whereCondition?.user?.profile,
            address: {
              ...whereCondition?.user?.profile?.address,
              country: filter.country,
            },
          },
        };
      }

      if (filter?.gender) {
        whereCondition.user = {
          ...whereCondition?.user,
          profile: { ...whereCondition?.user?.profile, gender: filter.gender },
        };
      }

      const topUsers = await this.prismaService.userStats.findMany({
        take: 100,
        where: whereCondition,
        select: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  username: true,
                  fullName: true,
                  firstName: true,
                  lastName: true,
                  gender: true,
                  avatar: true,
                  address: {
                    select: {
                      country: true,
                      cityDistrict: true,
                      state: true,
                    },
                  },
                },
              },
            },
          },
          currentGrade: true,
          currentStage: true,
          netScore: true,
        },
        orderBy: {
          netScore: 'desc',
        },
      });
      let rankCount = 1;
      const bucketName = envConfig.S3.uploadProfileImgBucket;
      const formattedResponse = [];
      for (const data of topUsers) {
        let profileImage = null;
        if (data?.user?.profile?.avatar) {
          profileImage = await this.s3Service.getSignedFileUrl(
            data?.user?.profile?.avatar,
            bucketName,
          );
        }

        formattedResponse.push({
          userId: data?.user?.id,
          rank: rankCount++,
          avatarLink: profileImage,
          fullName: data?.user?.profile?.fullName,
          firstName: data?.user?.profile?.firstName,
          lastName: data?.user?.profile?.lastName,
          userName: data?.user?.profile?.lastName,
          gender: data?.user?.profile?.gender,
          city: data?.user?.profile?.address?.cityDistrict,
          country: data?.user?.profile?.address?.country,
          state: data?.user?.profile?.address?.state,
          currentStage: data?.currentStage,
          currentGrade: data?.currentGrade,
          netScore: data?.netScore,
        });
      }
      return formattedResponse;
    } catch (error) {
      throw error;
    }
  }
}
