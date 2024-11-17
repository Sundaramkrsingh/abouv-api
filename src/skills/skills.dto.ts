import { z } from 'zod';

export const tier1DtoSchema = z.object({
  name: z.string(),
  foregroundColor: z.string().optional(),
  backgroundColor: z.string().optional(),
});
export type Tier1DtoSchema = z.infer<typeof tier1DtoSchema>;

export const tier2DtoSchema = z.object({
  name: z.string(),
});
export type Tier2DtoSchema = z.infer<typeof tier2DtoSchema>;

export const tier3DtoSchema = z.object({
  name: z.string(),
});
export type Tier3DtoSchema = z.infer<typeof tier3DtoSchema>;

export const isActiveDtoSchema = z.object({
  isActive: z.boolean(),
});
export type IsActiveDtoSchema = z.infer<typeof isActiveDtoSchema>;
