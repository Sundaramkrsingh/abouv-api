export const trackDtoSwaggerSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      event: {
        type: 'string',
      },
      properties: {
        type: 'object',
        properties: {
          distinct_id: {
            oneOf: [{ type: 'number' }, { type: 'string' }],
          },
        },
        additionalProperties: true,
      },
    },
    required: ['event', 'properties'],
  },
};
