export const inQDtoSwaggerSchema = {
  type: 'object',
  properties: {
    questionId: { type: 'integer' },
    currentQuestionNo: { type: 'integer' },
    timeSpent: { type: 'integer' },
    isQuestionSkipped: { type: 'boolean' },
    answer: { type: 'string' },
  },
  required: [
    'questionId',
    'currentQuestionNo',
    'timeSpent',
    'isQuestionSkipped',
    'answer',
  ],
};
