import { fakerEN_IN as faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

const generateUUID = () => uuidv4();

export const inQDtoSwaggerExample = {
  example1: {
    value: {
      questionId: faker.number.int({ min: 1, max: 10 }),
      currentQuestionNo: faker.number.int({ min: 1, max: 10 }),
      timeSpent: faker.number.int({ min: 10, max: 20 }),
      isQuestionSkipped: faker.datatype.boolean(),
      answer: generateUUID(),
    },
  },
};
