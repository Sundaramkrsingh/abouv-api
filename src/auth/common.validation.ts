import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const authValidation = z
  .object({
    phoneNumber: z.string().refine(
      (data) => {
        const phoneNumber = parsePhoneNumberFromString(data, 'IN');
        return phoneNumber?.isValid();
      },
      {
        message: 'Invalid Phone Number!',
      },
    ),
    countryCode: z.string().refine(
      (data) => {
        // a valid ISO 3166-1 alpha-2 code
        return /^[A-Za-z]{2}$/.test(data);
      },
      {
        message: 'Invalid Country Code!',
      },
    ),
    otp: z
      .number()
      .refine((data) => Number.isInteger(data) && data.toString().length, {
        message: 'Invalid OTP! OTP must be a 6-digit number.',
      }),
  })
  .strict();

export const phoneValidation = z
  .object({
    phoneNumber: z.string().refine(
      (data) => {
        const phoneNumber = parsePhoneNumberFromString(data, 'IN');
        return phoneNumber?.isValid();
      },
      {
        message: 'Invalid Phone Number!',
      },
    ),
  })
  .strict();

export const countryValidation = z
  .object({
    countryCode: z.string().refine(
      (data) => {
        // a valid ISO 3166-1 alpha-2 code
        return /^[A-Za-z]{2}$/.test(data);
      },
      {
        message: 'Invalid Country Code!',
      },
    ),
  })
  .strict();
