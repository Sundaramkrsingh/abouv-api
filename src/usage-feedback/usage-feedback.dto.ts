import { z } from 'zod';

export const usageFeedBackSchema = z.object({
  userId: z.number(),
  comment: z.string().optional(),
});
export type usageFeedBackSchema = z.infer<typeof usageFeedBackSchema>;
