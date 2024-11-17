import { PrismaClient } from '@prisma/client';

export default async function seedUserStats(prisma: PrismaClient) {
  console.group('[user stats mock]');
  const arrData = [
    {
      netScore: 10,
      currentGrade: 'G1',
      currentStage: 'S01',
      userId: 1,
    },
    {
      netScore: 20,
      currentGrade: 'G1',
      currentStage: 'S01',
      userId: 2,
    },
    {
      netScore: 30,
      currentGrade: 'G1',
      currentStage: 'S01',
      userId: 3,
    },
    {
      netScore: 40,
      currentGrade: 'G1',
      currentStage: 'S01',
      userId: 4,
    },
  ];
  try {
    await prisma.userStats.createMany({
      data: arrData,
      skipDuplicates: true,
    });

    console.log('user stats mock added');
  } catch (error) {
    throw error;
  }
  console.groupEnd();
}
