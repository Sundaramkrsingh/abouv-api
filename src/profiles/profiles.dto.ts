/* eslint-disable prettier/prettier */
import { z } from 'zod';
import { GENDER } from '../shared/utils';

export const basicDtoSchema = z
  .object({
    avatar: z.string().trim().optional(),
    username: z.string().trim().optional(),
    fullName: z.string().trim().optional(),
    firstName: z
      .string()
      .trim()
      .min(1, { message: 'Must be 1 or more characters long' }),
    lastName: z
      .string()
      .trim()
      .min(1, { message: 'Must be 1 or more characters long' }),
    bio: z.string().trim().optional(),
    dob: z.coerce.date().optional(),
    gender: z.enum(GENDER).optional(),
    electiveSetAt: z.coerce.date().optional(),
    pincode: z.string().trim().optional(),
    line1: z.string().trim().optional(),
  })
  .strict();
export type BasicDtoSchema = z.infer<typeof basicDtoSchema>;

export const addEmailDtoSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email({ message: 'Must be a valid email' })
      .optional(),
  })
  .strict();
export type AddEmailDtoSchema = z.infer<typeof addEmailDtoSchema>;

export const getEmailDtoSchema = z
  .object({
    email: z.string(),
    fullName: z.string(),
    emailType: z.string(),
  })
  .strict();
export type GetEmailDtoSchema = z.infer<typeof getEmailDtoSchema>;

export const createInitbasicDtoSchema = z
  .object({
    avatar: z.string().trim().optional(),
    username: z.string().trim().optional(),
    fullName: z.string().trim().optional(),
    firstName: z
      .string()
      .trim()
      .min(1, { message: 'Must be 1 or more characters long' }),
    lastName: z
      .string()
      .trim()
      .min(1, { message: 'Must be 1 or more characters long' }),
    pincode: z.string().trim(),
    email: z.string().email(),
  })
  .strict();
export type CreateInitbasicDtoSchema = z.infer<typeof createInitbasicDtoSchema>;

export const passwordDtoSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter',
      })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[^A-Za-z0-9]/, {
        message: 'Password must contain at least one special character',
      }),
  })
  .strict();
export type passwordDtoSchema = z.infer<typeof passwordDtoSchema>;

export const addressDtoSchema = z
  .object({
    line1: z.string().trim().optional(),
    country: z.string().trim(),
    state: z.string().trim(),
    cityDistrict: z.string().trim(),
    pincode: z.string().trim(),
  })
  .strict();
export type AddressDtoSchema = z.infer<typeof addressDtoSchema>;

export const workExperienceDtoSchema = z.object({
  title: z.string().trim(),
  company: z.string().trim(),
  from: z.coerce.date(),
  to: z.coerce.date().optional(),
});
export type WorkExperienceDtoSchema = z.infer<typeof workExperienceDtoSchema>;

export const projectDtoSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim(),
  url: z.string().trim().url().optional(),
});
export type ProjectDtoSchema = z.infer<typeof projectDtoSchema>;

export const licenseCertificationDtoSchema = z.object({
  name: z.string().trim(),
  provider: z.string().trim(),
  from: z.coerce.date(),
  to: z.coerce.date(),
  url: z.string().trim().url(),
});
export type LicenseCertificationDtoSchema = z.infer<
  typeof licenseCertificationDtoSchema
>;

export const educationDtoSchema = z.object({
  schoolCollage: z.string().trim(),
  university: z.string().trim().optional(),
  degree: z.string().trim(),
  from: z.coerce.date(),
  to: z.coerce.date().optional(),
});
export type EducationDtoSchema = z.infer<typeof educationDtoSchema>;

export const awardAchievementDtoSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim(),
  url: z.string().trim().url(),
});
export type AwardAchievementDtoSchema = z.infer<
  typeof awardAchievementDtoSchema
>;

export const electiveDtoSchema = z.object({
  tier3Id: z.array(z.number()),
});
export type ElectiveDtoSchema = z.infer<typeof electiveDtoSchema>;

export const goalDtoSchema = z
  .object({
    goals: z.array(z.number()),
  })
  .strict();
export type GoalDtoSchema = z.infer<typeof goalDtoSchema>;

export const roleDtoSchema = z
  .object({
    role: z.string().trim(),
  })
  .strict();
export type RoleDtoSchema = z.infer<typeof roleDtoSchema>;

export const hearAbtUsDtoSchema = z
  .object({
    hearAboutUs: z.string().trim(),
  })
  .strict();
export type HearAbtUsSchema = z.infer<typeof hearAbtUsDtoSchema>;

export const UpdateUserInfoRequestDto = z
  .object({
    firstName: z.string().trim(),
    lastName: z.string().trim(),
    pincode: z.number(),
    email: z.string().trim(),
  })
  .strict();
export type UpdateUserInfoRequestDto = z.infer<typeof UpdateUserInfoRequestDto>;

export const onboardingStatusDtoSchema = z
  .object({
    onboardingSlug: z.string(),
  })
  .strict();
export type OnboardingStatusDtoSchema = z.infer<
  typeof onboardingStatusDtoSchema
>;

export const verifyEmailDtoSchema = z
  .object({
    otpCode: z.string().trim(),
  })
  .strict();
export type verifyEmailDtoSchema = z.infer<typeof verifyEmailDtoSchema>;

export const pushNotificationsDtoSchema = z
  .object({
    flag: z.boolean(),
  })
  .strict();
export type pushNotificationsDtoSchema = z.infer<
  typeof pushNotificationsDtoSchema
>;

export const notificationPreferenceDtoSchema = z.object({
  notificationType: z
    .string()
    .refine((type) => ['email', 'push'].includes(type)),
  status: z.boolean(),
});

export type NotificationPreferenceDto = z.infer<
  typeof notificationPreferenceDtoSchema
>;

export const careerIssuesDtoSchema = z
  .object({
    careerIssues: z.array(z.number()),
  })
  .strict();
export type careerIssuesDtoSchema = z.infer<typeof careerIssuesDtoSchema>;

export const pushNotificationSubscriptionDtoSchema = z.object({
  subscription: z
    .object({
      endpoint: z.string(),
      expirationTime: z.union([z.number(), z.null()]),
      keys: z
        .object({
          p256dh: z.string(),
          auth: z.string(),
        })
        .strict(),
    })
    .strict(),
});

export type PushNotificationSubscriptionDto = z.infer<
  typeof pushNotificationSubscriptionDtoSchema
>;
