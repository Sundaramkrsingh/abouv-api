import { Prisma, PrismaClient } from '@prisma/client';
import { parseCSVToJson } from '../../seed-csv-utils';

export default async function seedStageSetting(
  prisma: PrismaClient,
  csvFilePath: string,
) {
  console.group('[Stage Setting]');
  const stageData = await parseCSVToJson(csvFilePath);
  const data: Prisma.StageSettingCreateManyInput[] = [];

  for (const stage of stageData) {
    data.push({
      name: stage.name,
      level: stage.level,
      startDay: Number(stage.startDay),
      endDay: Number(stage.endDay),
      days: Number(stage.days),
      questionSelectionDL: Number(stage.questionSelectionDL),
      totalQuestions: Number(stage.totalQuestions),
      timeLimit: Number(stage.timeLimit),
    });
  }

  try {
    await prisma.stageSetting.createMany({
      data,
      skipDuplicates: true,
    });

    console.log('Stage added');
  } catch (error) {
    throw error;
  }
  console.groupEnd();
}
