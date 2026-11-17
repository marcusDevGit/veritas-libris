import { z } from 'zod';
import {
  AdequacyLevelSchema,
  AgeRatingSchema,
  ReservationTopicSchema,
  SeverityLevelSchema,
} from '../constants/doctrine.js';
import { isValidIsbn13 } from '../utils/isbn.js';

/**
 * Validação desacoplada para ObjectId do MongoDB (24 caracteres hexadecimais).
 * Evita importar 'mongoose' no pacote shared (que também roda no navegador).
 */
export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ID inválido (esperado ObjectId hexadecimal de 24 caracteres)');

export type ObjectIdString = z.infer<typeof ObjectIdSchema>;

/**
 * ISBN-13 já normalizado (13 dígitos, sem hifens) e com dígito verificador correto.
 */
export const Isbn13Schema = z
  .string()
  .trim()
  .regex(/^\d{13}$/, 'O ISBN-13 deve conter exatamente 13 dígitos numéricos')
  .refine(isValidIsbn13, 'ISBN-13 inválido (dígito verificador não confere)');

/**
 * Item individual de ressalva moral ou doutrinária.
 */
export const ReservationItemSchema = z.object({
  topic: ReservationTopicSchema,
  severity: SeverityLevelSchema,
  description: z
    .string()
    .trim()
    .min(10, 'A descrição da ressalva deve ter no mínimo 10 caracteres'),
  reference: z.string().trim().min(1).optional(),
});

export type ReservationItem = z.infer<typeof ReservationItemSchema>;

/**
 * Estatísticas consolidadas das avaliações da comunidade.
 */
export const CommunityStatsSchema = z.object({
  totalReviews: z.number().int().nonnegative().default(0),
  recommendedCount: z.number().int().nonnegative().default(0),
  reservationsCount: z.number().int().nonnegative().default(0),
  notRecommendedCount: z.number().int().nonnegative().default(0),
});

export type CommunityStats = z.infer<typeof CommunityStatsSchema>;

/**
 * Schema principal da entidade Livro (Book).
 */
export const BookSchema = z.object({
  _id: ObjectIdSchema.optional(),
  isbn13: Isbn13Schema,
  googleBooksId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1, 'O título é obrigatório'),
  subtitle: z.string().trim().min(1).optional(),
  authors: z
    .array(z.string().trim().min(1))
    .min(1, 'O livro deve possuir pelo menos um autor'),
  coverUrl: z.string().url('URL da capa inválida').optional(),
  synopsis: z.string().trim().optional(),
  publishedYear: z
    .number()
    .int()
    .min(1, 'Ano de publicação inválido')
    .max(new Date().getFullYear() + 1, 'Ano de publicação no futuro inválido')
    .optional(),
  publisher: z.string().trim().min(1).optional(),
  pageCount: z.number().int().positive().optional(),
  language: z.string().trim().min(1).optional(),
  hasImprimatur: z.boolean().default(false),
  editorialLock: z.boolean().default(false),
  editorialLockedAt: z.coerce.date().optional(),
  editorialLockedBy: z.string().trim().optional(),
  adequacyStatus: AdequacyLevelSchema.default('UNRATED'),
  recommendedAge: AgeRatingSchema.default('ALL'),
  tags: z.array(z.string().trim().min(1)).default([]),
  editorialSummary: z.string().trim().optional(),
  reservations: z.array(ReservationItemSchema).default([]),
  alternatives: z.array(ObjectIdSchema).default([]),
  communityStats: CommunityStatsSchema.default({
    totalReviews: 0,
    recommendedCount: 0,
    reservationsCount: 0,
    notRecommendedCount: 0,
  }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Book = z.infer<typeof BookSchema>;
export type BookInput = z.input<typeof BookSchema>;
