import { z } from 'zod';

export const CreateQuestionSchema = z.object({
  type: z.string(),
  tier1Id: z.number().int(),
  tier2Id: z.number().int(),
  tier3Id: z.number().int(),
  staticDL: z.number().int().min(0).max(6),
  dynamicDL: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.number().int()),
  isPublished: z.boolean().optional(),
  avgTime: z.number().optional(),
  accuracy: z.number().int().optional(),
  timeLimit: z.number().int().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  mCQQA: z
    .object({
      text: z.string(),
      options: z.array(z.object({})),
      answer: z.number(),
      triviaContent: z.string(),
    })
    .optional(),
  mCQPsychometricQA: z
    .object({
      text: z.string(),
      traitTypeId: z.number(),
    })
    .optional(),
  mCQPsychometricOptionsQA: z
    .object({
      text: z.string(),
      options: z.array(z.object({})),
    })
    .optional(),
});

export type CreateQuestionDto = z.infer<typeof CreateQuestionSchema>;

export const QuestionTagSchema = z.object({
  name: z.string(),
});

export type QuestionTagDto = z.infer<typeof QuestionTagSchema>;

export const isActiveQuestionDtoSchema = z.object({
  isActive: z.boolean(),
});
export type IsActiveQuestionDtoSchema = z.infer<
  typeof isActiveQuestionDtoSchema
>;
