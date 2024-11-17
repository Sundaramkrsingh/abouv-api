import { HttpStatus } from '@nestjs/common';

export const CUSTOM_ERRORS = {
  USER_NOT_FOUND: {
    isCustomError: true,
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'FAILED',
    message: 'User Not Found Error',
    validation: null,
  },
  PROFILE_NOT_FOUND: {
    isCustomError: true,
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'FAILED',
    message: 'User Profile Not Found Error',
    validation: null,
  },
  PROFILE_IMAGE_NOT_FOUND: {
    isCustomError: true,
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'FAILED',
    message: 'User Profile Image Not Found Error',
    validation: null,
  },
  USER_RESUME_NOT_FOUND: {
    isCustomError: true,
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'FAILED',
    message: 'User Resume Not Found Error',
    validation: null,
  },
  INVALID_USER_ROLE: {
    isCustomError: true,
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'FAILED',
    message: 'Invalid User Role',
    validation: null,
  },
  INVALID_HEAR_ABOUT: {
    isCustomError: true,
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'FAILED',
    message: 'Invalid Hear About Us',
  },
  USER_STAGE_HISTORY_NOT_FOUND: {
    isCustomError: true,
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'FAILED',
    message: 'User Stage History Not Found Error',
    validation: null,
  },
  INVALID_COUNTRY_CODE: {
    isCustomError: true,
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'FAILED',
    message: 'Invalid Country Code',
    validation: null,
  },
  INVALID_PHONE_NUMBER: {
    isCustomError: true,
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'FAILED',
    message: 'Invalid Phone number',
    validation: null,
  },
  INCORRECT_OTP: {
    isCustomError: true,
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'FAILED',
    message: 'Invalid OTP',
    validation: null,
  },
  EMAIL_ALREADY_VERIFIED: {
    isCustomError: true,
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'FAILED',
    message: 'Email Already Verified',
    validation: null,
  },
  OTP_EXPIRED: {
    isCustomError: true,
    statusCode: HttpStatus.GONE,
    status: 'FAILED',
    message: 'OTP Expired',
    validation: null,
  },
  ADDRESS_EXISTS: {
    isCustomError: true,
    statusCode: HttpStatus.CONFLICT,
    status: 'FAILED',
    message: 'Address record already exists',
    validation: null,
    messageCode: 'ADDRESS_EXISTS',
  },
};

export const OTP_EXPIRATION_TIME = 1 * 30 * 1000;
export const TOKEN_EXPIRATION_TIME = '30d';
export const JWT_SECRET_EXPIRATION_TIME = '30d';
export const JWT_REFRESH_TOKEN_EXPIRATION_TIME = '30d';

//core-v2
export const FIRST_STAGE_QUESTIONS = 20;
export const REMAINING_STAGE_QUESTIONS = 16;
export const SECOND_STAGE_START_DAY = 6;
export const PREQ_TIME_LIMIT = 10;
export const POWER_UP_USE_QUESTIONS_LIMIT = 10;
