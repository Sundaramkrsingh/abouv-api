/* eslint-disable prettier/prettier */
import { S3Service } from '../../../src/s3/s3.service';
import { saveCSVSToDB } from '../../seed-csv-utils';

export default async function seedQuestions(prisma, s3Service) {
  try {
    const csvs = [
      {
        name: 'MCQ Questions',
        filePath: 'prisma/seed-dev/data/common.questions.data.csv',
      },
      {
        name: 'MCQ Psycometric Questions',
        filePath: 'prisma/seed-dev/data/common.questions-trait.data.csv',
      },
      {
        name: 'MCQ Psycometric Option Questions',
        filePath:
          'prisma/seed-dev/data/common.questions-trait-options.data.csv',
      },
    ];

    for (const csv of csvs) {
      await addCSVToDB(prisma, s3Service, csv.filePath, csv.name);
    }
  } catch (error) {
    throw new Error(`Error while saving questions: ${error}`);
  }
}

async function addCSVToDB(prisma, s3Service: S3Service, csvPath, GroupName) {
  console.group(`[${GroupName}]`);
  const { questionToBeAdded, invalidQuestion } = await saveCSVSToDB(
    prisma,
    s3Service,
    csvPath,
  );
  console.log('Questions added:', questionToBeAdded.length);
  console.log('Unknown or duplicate questions:', invalidQuestion.length);

  if (invalidQuestion.length) {
    console.log([...new Set(invalidQuestion)]);
  }
  console.groupEnd();
}
