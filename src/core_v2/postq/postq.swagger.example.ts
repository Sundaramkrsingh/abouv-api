import { fakerEN_IN as faker } from '@faker-js/faker';

export const feedBackDtoSwaggerExample = {
  example1: {
    value: {
      questionId: faker.number.int({ min: 1, max: 5 }),
      isPositive: faker.datatype.boolean(),
      comment: faker.lorem.words(10),
    },
  },
};
