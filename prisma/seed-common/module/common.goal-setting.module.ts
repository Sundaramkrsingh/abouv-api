import { PrismaClient, Prisma } from '@prisma/client';

export default async function seedGoalSetting(
  prisma: PrismaClient,
  goalSettingData,
) {
  console.group('[Goals Setting]');
  const data: Prisma.GoalSettingCreateInput[] = [];

  for (let i = 0; i < goalSettingData.length; i++) {
    data.push({
      name: goalSettingData[i],
    });
  }

  try {
    await prisma.goalSetting.createMany({
      data,
      skipDuplicates: true,
    });

    console.log('Goals added');
  } catch (error) {
    throw error;
  }
  console.groupEnd();
}
