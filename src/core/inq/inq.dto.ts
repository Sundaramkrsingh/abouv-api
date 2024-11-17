import { z } from 'zod';

export const inQDtoSchema = z.object({
  questionId: z.number().int(),
  currentQuestionNo: z.number().int(),
  timeSpent: z.number().int(), //in milliseconds
  isQuestionSkipped: z.boolean(),
  answer: z.string().optional(),
});
