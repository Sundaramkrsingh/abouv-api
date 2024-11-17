import { envConfig } from '../config/app.config';

export const GENDER = ['MALE', 'FEMALE', 'RATHER_NOT_TO_SAY'] as const;

export function isNumber(value) {
  return Number.isFinite(value) && !isNaN(value);
}

export function shuffle(arr: any[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function getOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

export function checkTestUser(email: string) {
  const testUsers = [
    'dev.jobseeker1@test.com',
    'dev.jobseeker2@test.com',
    'qa.jobseeker1@test.com',
    'qa.jobseeker2@test.com',
  ];

  return envConfig.env !== 'PROD' && testUsers.includes(email.toLowerCase());
}
