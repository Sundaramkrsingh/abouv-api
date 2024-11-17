export const questionTagDtoSwaggerSchema = {
  type: 'object',

  properties: {
    name: { type: 'string' },
  },
};

export const isActiveQuestionDtoSwaggerSchema = {
  type: 'object',
  properties: {
    isActive: { type: 'boolean' },
  },
};

export const saveCSVToDBDtoSwaggerSchema = {
  type: 'object',
  properties: {
    file: {
      type: 'string',
      format: 'binary',
    },
  },
};

export const CreateQuestionDtoSwaggerSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['MCQ'] },
    tier1Id: { type: 'integer' },
    tier2Id: { type: 'integer' },
    tier3Id: { type: 'integer' },
    staticDL: { type: 'integer', minimum: 1, maximum: 5 },
    dynamicDL: { type: 'integer', minimum: 1, maximum: 5 },
    tags: {
      type: 'array',
      items: { type: 'integer' },
    },
    isPublished: { type: 'boolean' },
    avgTime: { type: 'number' },
    accuracy: { type: 'integer' },
    timeLimit: { type: 'integer' },
    isActive: { type: 'boolean' },
    mCQQA: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              text: { type: 'string' },
              position: { type: 'integer' },
            },
          },
        },
        answer: { type: 'integer' },
        triviaContent: { type: 'string' },
      },
    },
  },
};
