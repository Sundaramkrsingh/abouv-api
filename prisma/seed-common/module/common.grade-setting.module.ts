import { PrismaClient, Prisma } from '@prisma/client';

export default async function seedGradeSetting(
  prisma: PrismaClient,
  gradeSettingData,
) {
  console.group('[Grade Setting]');
  const data: Prisma.GradeSettingCreateInput[] = [];

  for (const [index, value] of gradeSettingData.entries()) {
    data.push({
      level: 'G' + (index + 1),
      name: value[0] as string,
      minPercentage: value[1][0] as number,
      maxPercentage: value[1][1] as number,
    });
  }

  try {
    await prisma.gradeSetting.createMany({
      data,
      skipDuplicates: true,
    });

    console.log('Grade added');
  } catch (error) {
    throw error;
  }
  console.groupEnd();
}
