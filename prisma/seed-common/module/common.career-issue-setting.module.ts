import { PrismaClient, Prisma } from '@prisma/client';

export default async function seedCareerIssueSetting(
  prisma: PrismaClient,
  carrerIssueSettingData,
) {
  console.group('[Career Issues Setting]');
  const data: Prisma.CareerIssueSettingCreateInput[] = [];

  for (let i = 0; i < carrerIssueSettingData.length; i++) {
    data.push({
      name: carrerIssueSettingData[i],
    });
  }

  try {
    await prisma.careerIssueSetting.createMany({
      data,
      skipDuplicates: true,
    });

    console.log('Career Issues added');
  } catch (error) {
    throw error;
  }
  console.groupEnd();
}
