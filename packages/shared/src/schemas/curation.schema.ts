import { z } from 'zod';
import { AdequacyLevelSchema, AgeRatingSchema } from '../constants/doctrine.js';
import { ObjectIdSchema } from './book.schema.js';
import { BookDtoSchema } from './catalog.schema.js';

export const CurationFilterSchema = z.enum(['all', 'unlocked', 'locked', 'imprimatur']);
export type CurationFilter = z.infer<typeof CurationFilterSchema>;

export const CurationQueueQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  filter: CurationFilterSchema.default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type CurationQueueQuery = z.infer<typeof CurationQueueQuerySchema>;

export const CurationStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  pendingReview: z.number().int().nonnegative(),
  locked: z.number().int().nonnegative(),
  imprimatur: z.number().int().nonnegative(),
});
export type CurationStats = z.infer<typeof CurationStatsSchema>;

export const CurationQueueResponseSchema = z.object({
  items: z.array(BookDtoSchema),
  stats: CurationStatsSchema,
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
export type CurationQueueResponse = z.infer<typeof CurationQueueResponseSchema>;

export const UpdateBookEditorialBodySchema = z.object({
  editorialLock: z.boolean(),
  adequacyStatus: AdequacyLevelSchema,
  recommendedAge: AgeRatingSchema,
  hasImprimatur: z.boolean(),
  editorialSummary: z
    .string()
    .trim()
    .max(2500, 'A síntese editorial deve ter no máximo 2500 caracteres')
    .optional(),
  alternatives: z.array(ObjectIdSchema).max(10, 'No máximo 10 obras alternativas').default([]),
});
export type UpdateBookEditorialBody = z.infer<typeof UpdateBookEditorialBodySchema>;
