import { z } from 'zod';

export const SUGGESTION_TYPES = ['BOOK', 'IMPROVEMENT'] as const;
export const SuggestionTypeSchema = z.enum(SUGGESTION_TYPES);
export type SuggestionType = z.infer<typeof SuggestionTypeSchema>;

export const SUGGESTION_STATUSES = ['PENDING', 'REVIEWED', 'ACCEPTED', 'DISMISSED'] as const;
export const SuggestionStatusSchema = z.enum(SUGGESTION_STATUSES);
export type SuggestionStatus = z.infer<typeof SuggestionStatusSchema>;

export const CreateSuggestionBodySchema = z.object({
  type: SuggestionTypeSchema,
  title: z.string().trim().min(2, 'Informe o título ou assunto').max(160),
  author: z.string().trim().max(120).optional(),
  isbn13: z.string().trim().max(20).optional(),
  senderName: z.string().trim().max(100).optional(),
  senderEmail: z.string().trim().email('E-mail inválido').max(120).optional(),
  message: z
    .string()
    .trim()
    .min(10, 'Descreva sua sugestão com pelo menos 10 caracteres')
    .max(2000),
});
export type CreateSuggestionBody = z.infer<typeof CreateSuggestionBodySchema>;

export const SuggestionDtoSchema = z.object({
  id: z.string(),
  type: SuggestionTypeSchema,
  title: z.string(),
  author: z.string().nullable().optional(),
  isbn13: z.string().nullable().optional(),
  senderName: z.string().nullable().optional(),
  senderEmail: z.string().nullable().optional(),
  message: z.string(),
  status: SuggestionStatusSchema,
  reviewedByName: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
  resolutionNote: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type SuggestionDto = z.infer<typeof SuggestionDtoSchema>;

export const SuggestionStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  reviewed: z.number().int().nonnegative(),
  accepted: z.number().int().nonnegative(),
  dismissed: z.number().int().nonnegative(),
});
export type SuggestionStats = z.infer<typeof SuggestionStatsSchema>;

export const SuggestionListQuerySchema = z.object({
  status: SuggestionStatusSchema.optional(),
  type: SuggestionTypeSchema.optional(),
  q: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export type SuggestionListQuery = z.infer<typeof SuggestionListQuerySchema>;

export const UpdateSuggestionStatusBodySchema = z.object({
  status: SuggestionStatusSchema,
  resolutionNote: z.string().trim().max(500).optional(),
});
export type UpdateSuggestionStatusBody = z.infer<typeof UpdateSuggestionStatusBodySchema>;

export const SuggestionListResponseSchema = z.object({
  items: z.array(SuggestionDtoSchema),
  stats: SuggestionStatsSchema,
});
export type SuggestionListResponse = z.infer<typeof SuggestionListResponseSchema>;
