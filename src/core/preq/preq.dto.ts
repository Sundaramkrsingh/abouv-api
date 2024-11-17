import { z } from 'zod';

export const preQDtoSchema = z.object({
  questionId: z.number().int(),
  powerUpId: z.number().int(),
});
