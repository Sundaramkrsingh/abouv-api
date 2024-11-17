import { PrismaClient } from '@prisma/client';
import { fakerEN_IN as faker } from '@faker-js/faker';

const getRandomTestStatus = () => {
  const statuses = ['IN_PROGRESS'];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
};

const generateStageHistoryExample = () => {
  const totalQuestions = faker.number.int({ min: 4, max: 10 });
  const totalCorrectAnswers = faker.number.int({ min: 0, max: totalQuestions });
  return {
    userId: 1,
    day: 1,
    stageId: 1,
    gradeId: 1,
    tier1: [
      faker.number.int({ min: 1, max: 6 }),
      faker.number.int({ min: 1, max: 6 }),
    ],
    tier2: [
      faker.number.int({ min: 1, max: 18 }),
      faker.number.int({ min: 1, max: 18 }),
    ],
    tier3: [
      faker.number.int({ min: 1, max: 36 }),
      faker.number.int({ min: 1, max: 36 }),
    ],
    questionSet: generateQuestionSet(totalQuestions),
    testStatus: getRandomTestStatus(),
    questionTypes: ['MCQ'],
    totalQuestions: totalQuestions,
    totalCorrectAnswers: totalCorrectAnswers,
    totalTimeSpent: faker.number.int({ min: 18, max: 20 }),
    totalScore: faker.number.int({ min: 0, max: 500 }),
  };
};
function generateQuestionSet(totalQuestions: number) {
  const questionSet = [];

  const randomIndex = Math.floor(
    Math.random() * faker.number.int({ min: 1, max: 20 - totalQuestions }),
  );

  for (let i = 0; i < 20 - totalQuestions; i++) {
    questionSet.push({
      questionId: faker.number.int({ min: 1, max: 200 }),
      isShown: i === randomIndex,
    });
  }

  return questionSet;
}

// const generateUserQAHistoryExample = () => {
//   return {
//     userId: faker.number.int({ min: 1, max: 10 }),
//     day: faker.number.int({ min: 1, max: 30 }),
//     stageId: faker.number.int({ min: 1, max: 10 }),
//     gradeId: faker.number.int({ min: 1, max: 8 }),
//     tier1Id: faker.number.int({ min: 1, max: 6 }),
//     tier2Id: faker.number.int({ min: 1, max: 18 }),
//     tier3Id: faker.number.int({ min: 1, max: 36 }),
//     testType: 'MIXED_MODE',
//     questionId: faker.number.int({ min: 1, max: 10 }),
//     currentQuestionNo: faker.number.int({ min: 1, max: 10 }),
//     noOfAttempts: faker.number.int({ min: 1, max: 5 }),
//     timeSpent: faker.number.int({ min: 18, max: 20 }),
//     isQuestionSkipped: faker.datatype.boolean(),
//     isCorrect: faker.datatype.boolean(),
//     score: faker.number.int({ min: 0, max: 100 }),
//   };
// };

export default async function seedReportsData(prisma: PrismaClient) {
  console.group('[Stats Report]');
  const stageHistoryExamples = [];
  try {
    for (let i = 0; i < 1; i++) {
      const stageHistory = generateStageHistoryExample();
      stageHistoryExamples.push(stageHistory);
    }

    // const userQAHistoryExamples = [];
    // for (let i = 0; i < 10; i++) {
    //   const userQAHistory = generateUserQAHistoryExample();
    //   userQAHistoryExamples.push(userQAHistory);
    // }

    await prisma.stageHistory.createMany({
      data: stageHistoryExamples,
    });

    // await prisma.userQAHistory.createMany({
    //   data: userQAHistoryExamples,
    // });

    console.log('Report data added');
  } catch (error) {
    throw error;
  }
  console.groupEnd();
}
