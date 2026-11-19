import { z } from 'zod';

export const SUGGESTION_TYPES = ['BOOK', 'IMPROVEMENT'] as const;
export const SuggestionTypeSchema = z.enum(SUGGESTION_TYPES);
export type SuggestionType = z.infer<typeof SuggestionTypeSchema>;

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
  createdAt: z.string(),
});
export type SuggestionDto = z.infer<typeof SuggestionDtoSchema>;

export const SuggestionListResponseSchema = z.object({
  items: z.array(SuggestionDtoSchema),
});
export type SuggestionListResponse = z.infer<typeof SuggestionListResponseSchema>;
