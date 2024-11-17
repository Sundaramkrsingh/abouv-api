export const loginDataSwaggerSchema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    password: { type: 'string' },
  },
};
export const signUpDtoSwaggerSchema = {
  type: 'object',
  properties: {
    phoneNumber: { type: 'string' },
  },
};

export const signInDtoSwaggerSchema = {
  type: 'object',
  properties: {
    phoneNumber: { type: 'string' },
    smsOtp: { type: 'number' },
  },
};

export const loginEmailDtoSwaggerSchema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
  },
};

export const passwordResetSwaggerSchema = {
  type: 'object',
  properties: {
    newPassword: { type: 'string', minLength: 3, maxLength: 20 },
  },
};

export const googleSigninDtoSwaggerSchema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
  },
};

export const sendOTPDtoSwaggerSchema = signUpDtoSwaggerSchema;
