/* eslint-disable prettier/prettier */
import { z } from 'zod';

export const postPreQDto = z
  .object({
    powerUpId: z.number().optional(),
    questionId: z.number(),
  })
  .strict();
export type PostPreQDto = z.infer<typeof postPreQDto>;

export const postFeedBack = z
  .object({
    questionId: z.number(),
    isPositive: z.boolean(),
    comment: z.string().optional(),
  })
  .strict();
export type PostFeedBack = z.infer<typeof postFeedBack>;
