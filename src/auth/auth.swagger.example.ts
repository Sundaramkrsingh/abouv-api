/* eslint-disable prettier/prettier */
import { fakerEN_IN as faker } from '@faker-js/faker';
import { getOTP } from 'src/shared/utils';

export const loginSwaggerExample = {
  example: {
    value: {
      email: 'example@example.com',
      password: 'password123',
    },
  },
};

const phoneNumber = faker.phone.number().split('-').join('');

export const signUpDtoSwaggerExample = {
  example1: {
    value: {
      phoneNumber,
    },
  },
};

export const signInDtoSwaggerExample = {
  example1: {
    value: {
      phoneNumber,
      smsOtp: getOTP(),
    },
  },
};

export const loginEmailDtoSwaggerExample = {
  example1: {
    value: {
      email: 'example@example.com',
    },
  },
};

export const passwordResetDtoSwaggerExample = {
  example1: {
    value: {
      password: faker.internet.password(),
    },
  },
};

export const googleSigninDtoSwaggerExample = {
  example1: {
    value: {
      email: 'example@example.com',
    },
  },
};

export const sendOTPDtoSwaggerExample = signUpDtoSwaggerExample;
