import { z } from 'zod';

export const RankingFilterSchema = z.object({
  state: z.string().optional(),
  country: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

export type RankingFilterDto = z.infer<typeof RankingFilterSchema>;
