import { fakerEN_IN as faker } from '@faker-js/faker';

let position = 1; // Move outside the function to ensure it's not reset

const generateMCQQAOptionsExample = () => {
  const currentPosition = position++;
  return {
    text: faker.lorem.words(),
    position: currentPosition,
  };
};

const generateMCQQAExample = () => {
  const options = Array.from({ length: 4 }, generateMCQQAOptionsExample);
  const answerIndex = faker.number.int({ min: 0, max: 3 });
  return {
    text: faker.lorem.sentence(),
    options: options,
    answer: answerIndex,
    triviaContent: faker.lorem.paragraph(),
  };
};

const generateMCQPSYQAExample = () => {
  return {
    text: faker.lorem.sentence(),
    traitTypeId: faker.number.int(12),
  };
};

const generateMCQPSYOptionQAExample = () => {
  const options = Array.from({ length: 5 }, generateMCQQAOptionsExample);
  return {
    text: faker.lorem.sentence(),
    options: options,
  };
};

export const CreateQuestionDtoExample = {
  mcqNonTrait: {
    value: {
      type: 'MCQ',
      tier1Id: faker.number.int({ min: 1, max: 5 }),
      tier2Id: faker.number.int({ min: 1, max: 5 }),
      tier3Id: faker.number.int({ min: 1, max: 5 }),
      staticDL: faker.number.int({ min: 1, max: 5 }),
      dynamicDL: faker.number.int({ min: 1, max: 5 }),
      tags: [faker.number.int({ min: 1, max: 5 })],
      isPublished: true,
      avgTime: faker.number.int(0),
      accuracy: faker.number.int(0),
      timeLimit: faker.number.int(0),
      isActive: faker.datatype.boolean(),
      mCQQA: generateMCQQAExample(),
    },
  },

  mcqTrait: {
    value: {
      type: 'MCQ',
      tier1Id: faker.number.int({ min: 1, max: 5 }),
      tier2Id: faker.number.int({ min: 1, max: 5 }),
      tier3Id: faker.number.int({ min: 1, max: 5 }),
      staticDL: faker.number.int({ min: 1, max: 5 }),
      dynamicDL: faker.number.int({ min: 1, max: 5 }),
      tags: [faker.number.int({ min: 1, max: 5 })],
      isPublished: true,
      avgTime: faker.number.int(0),
      accuracy: faker.number.int(0),
      timeLimit: faker.number.int(0),
      isActive: faker.datatype.boolean(),
      mCQPsychometricQA: generateMCQPSYQAExample(),
    },
  },

  mcqTraitOption: {
    value: {
      type: 'MCQ',
      tier1Id: faker.number.int({ min: 1, max: 5 }),
      tier2Id: faker.number.int({ min: 1, max: 5 }),
      tier3Id: faker.number.int({ min: 1, max: 5 }),
      staticDL: faker.number.int({ min: 1, max: 5 }),
      dynamicDL: faker.number.int({ min: 1, max: 5 }),
      tags: [faker.number.int({ min: 1, max: 5 })],
      isPublished: true,
      avgTime: faker.number.int(0),
      accuracy: faker.number.int(0),
      timeLimit: faker.number.int(0),
      isActive: faker.datatype.boolean(),
      mCQPsychometricOptionsQA: generateMCQPSYOptionQAExample(),
    },
  },
};

export const EditQuestionDtoExample = {
  mcqNonTrait: {
    value: {
      type: 'MCQ',
      tier1Id: faker.number.int({ min: 1, max: 5 }),
      tier2Id: faker.number.int({ min: 1, max: 5 }),
      tier3Id: faker.number.int({ min: 1, max: 5 }),
      staticDL: faker.number.int({ min: 1, max: 5 }),
      dynamicDL: faker.number.int({ min: 1, max: 5 }),
      tags: [faker.number.int({ min: 1, max: 5 })],
      isPublished: true,
      avgTime: faker.number.int(0),
      accuracy: faker.number.int(0),
      timeLimit: faker.number.int(0),
      isActive: faker.datatype.boolean(),
      mCQQA: generateMCQQAExample(),
    },
  },

  mcqTrait: {
    value: {
      type: 'MCQ',
      tier1Id: faker.number.int({ min: 1, max: 5 }),
      tier2Id: faker.number.int({ min: 1, max: 5 }),
      tier3Id: faker.number.int({ min: 1, max: 5 }),
      staticDL: faker.number.int({ min: 1, max: 5 }),
      dynamicDL: faker.number.int({ min: 1, max: 5 }),
      tags: [faker.number.int({ min: 1, max: 5 })],
      isPublished: true,
      avgTime: faker.number.int(0),
      accuracy: faker.number.int(0),
      timeLimit: faker.number.int(0),
      isActive: faker.datatype.boolean(),
      mCQPsychometricQA: generateMCQPSYQAExample(),
    },
  },

  mcqTraitOption: {
    value: {
      type: 'MCQ',
      tier1Id: faker.number.int({ min: 1, max: 5 }),
      tier2Id: faker.number.int({ min: 1, max: 5 }),
      tier3Id: faker.number.int({ min: 1, max: 5 }),
      staticDL: faker.number.int({ min: 1, max: 5 }),
      dynamicDL: faker.number.int({ min: 1, max: 5 }),
      tags: [faker.number.int({ min: 1, max: 5 })],
      isPublished: true,
      avgTime: faker.number.int(0),
      accuracy: faker.number.int(0),
      timeLimit: faker.number.int(0),
      isActive: faker.datatype.boolean(),
      mCQPsychometricOptionsQA: generateMCQPSYOptionQAExample(),
    },
  },
};

export const CreateQuestionTagDtoExample = {
  example1: {
    value: {
      name: faker.lorem.words(),
    },
  },
};

export const EditQuestionTagDtoExample = {
  example1: {
    value: {
      name: faker.lorem.words(),
    },
  },
};
