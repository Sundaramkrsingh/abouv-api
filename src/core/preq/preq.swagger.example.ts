import { fakerEN_IN as faker } from '@faker-js/faker';

export const preQDtoSwaggerExample = {
  example1: {
    value: {
      questionId: faker.number.int({ min: 1, max: 10 }),
      powerUpId: faker.number.int({ min: 1, max: 5 }),
    },
  },
};
