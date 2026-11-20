import { z } from 'zod';
import { AdequacyLevelSchema, AgeRatingSchema } from '../constants/doctrine.js';
import { ObjectIdSchema, ReservationItemSchema } from './book.schema.js';
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
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  reservations: z.array(ReservationItemSchema).max(20).optional(),
  alternatives: z.array(ObjectIdSchema).max(10, 'No máximo 10 obras alternativas').default([]),
});
export type UpdateBookEditorialBody = z.infer<typeof UpdateBookEditorialBodySchema>;

export const EditorialAiCitationSchema = z.object({
  documentTitle: z.string().nullable().optional(),
  documentAuthor: z.string().nullable().optional(),
  documentYear: z.string().nullable().optional(),
  documentReference: z.string().nullable().optional(),
  citedText: z.string(),
  sourceUrl: z.string().nullable().optional(),
});
export type EditorialAiCitation = z.infer<typeof EditorialAiCitationSchema>;

export const EditorialAiDraftResponseSchema = z.object({
  draftText: z.string(),
  suggestedAdequacy: AdequacyLevelSchema.nullable().optional(),
  suggestedAge: AgeRatingSchema.nullable().optional(),
  recommendationRationale: z.string().nullable().optional(),
  citations: z.array(EditorialAiCitationSchema),
  cached: z.boolean(),
  generatedAt: z.string(),
});
export type EditorialAiDraftResponse = z.infer<typeof EditorialAiDraftResponseSchema>;
