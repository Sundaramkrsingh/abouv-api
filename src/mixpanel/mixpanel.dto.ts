import { z } from 'zod';

export const trackDtoSchema = z.array(
  z
    .object({
      event: z.string(),
      properties: z
        .object({
          distinct_id: z.union([z.number(), z.string()]),
        })
        .passthrough(),
    })
    .strict(),
);

export type TrackDtoSchema = z.infer<typeof trackDtoSchema>;
