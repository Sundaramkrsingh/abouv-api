import { z } from 'zod';

export const SingUpDto = z.object({
  phoneNumber: z.string(),
});

export const SingInDto = z.object({
  phoneNumber: z.string(),
  smsOtp: z.number(),
});

export const loginDto = z.object({
  email: z.string().email(),
  otp: z.string(),
});

export type LoginDto = z.infer<typeof loginDto>;

export const loginEmailDto = z.object({
  email: z.string().email(),
});

export type LoginEmailDtoSchema = z.infer<typeof loginEmailDto>;

export const RequestPasswordResetDto = z.object({
  email: z.string().email(),
});
export type RequestDTO = z.infer<typeof RequestPasswordResetDto>;

export const PasswordResetSchema = z.object({
  password: z.string().min(3).max(20),
});
export type passwordDto = z.infer<typeof PasswordResetSchema>;

export const googleSigninDtoSchema = z.object({
  email: z.string().email(),
});
export type GoogleSigninDtoSchema = z.infer<typeof googleSigninDtoSchema>;
