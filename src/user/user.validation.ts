import { z } from 'zod';

const phoneRegex = new RegExp(/^[6-9]{1}[0-9]{9}$/);

export const userValidation = z
  .object({
    phoneNumber: z
      .string()
      .trim()
      .regex(phoneRegex, 'Invalid Number!')
      .transform((data) => data.trim())
      .refine((data) => data.trim().length === 10, {
        message: 'Phone number must be 10 Digits!',
      }),
    country: z.string().trim(),
    onboardingSlug: z.string().trim().optional(),
  })
  .strict();
