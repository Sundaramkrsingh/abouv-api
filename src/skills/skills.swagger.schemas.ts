export const tier1SwaggerSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    foregroundColor: { type: 'string' },
    backgroundColor: { type: 'string' },
  },
};

export const tier2SwaggerSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
};

export const tier3SwaggerSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
};

export const tier3IsActiveSwaggerSchema = {
  type: 'object',
  properties: {
    isActive: { type: 'boolean' },
  },
};
