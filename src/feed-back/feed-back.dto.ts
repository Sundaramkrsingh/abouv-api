import { z } from 'zod';

export const feedbackDtoSchema = z.object({
  userId: z.number(),
  questionId: z.number(),
  isPositive: z.boolean(),
  comment: z.string().optional(),
});
export type FeedbackDtoSchema = z.infer<typeof feedbackDtoSchema>;
