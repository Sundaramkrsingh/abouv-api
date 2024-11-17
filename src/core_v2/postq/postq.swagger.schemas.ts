export const feedBackDtoSwaggerSchema = {
  type: 'object',
  properties: {
    questionId: { type: 'integer' },
    isPositive: { type: 'boolean' },
    comment: { type: 'string' },
  },
};
