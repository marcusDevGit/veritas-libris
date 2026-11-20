import { z } from 'zod';
import { AdequacyLevelSchema, AgeRatingSchema } from '../constants/doctrine.js';
import { ObjectIdSchema, ReservationItemSchema } from './book.schema.js';

/**
 * Schema completo de uma avaliação (Review) persistida.
 */
export const ReviewSchema = z.object({
  _id: ObjectIdSchema.optional(),
  bookId: ObjectIdSchema,
  userId: z.string().trim().min(1, 'O ID do usuário é obrigatório'),
  userName: z.string().trim().min(1, 'O nome do usuário é obrigatório'),
  isCurator: z.boolean().default(false),
  adequacyVote: AdequacyLevelSchema.refine((val) => val !== 'UNRATED', {
    message: 'O voto de adequação de uma avaliação não pode ser UNRATED',
  }),
  ageVote: AgeRatingSchema,
  suggestedTags: z.array(z.string().trim().min(1)).default([]),
  reservations: z.array(ReservationItemSchema).default([]),
  comment: z
    .string()
    .trim()
    .min(10, 'O comentário da avaliação deve ter no mínimo 10 caracteres'),
  helpfulVotes: z.number().int().nonnegative().default(0),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Review = z.infer<typeof ReviewSchema>;
export type ReviewInput = z.input<typeof ReviewSchema>;

/**
 * Payload enviado pelo cliente ao submeter uma avaliação (POST /api/v1/books/:id/reviews).
 * userId, userName, isCurator e helpfulVotes são definidos no servidor, nunca pelo cliente.
 */
export const CreateReviewBodySchema = ReviewSchema.pick({
  adequacyVote: true,
  ageVote: true,
  suggestedTags: true,
  reservations: true,
  comment: true,
});

export type CreateReviewBody = z.infer<typeof CreateReviewBodySchema>;

/**
 * Consulta de reviews de um livro
 */
export const ReviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type ReviewListQuery = z.infer<typeof ReviewListQuerySchema>;

export const PaginatedReviewsSchema = z.object({
  items: z.array(ReviewSchema.extend({ _id: ObjectIdSchema })),
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
export type PaginatedReviews = z.infer<typeof PaginatedReviewsSchema>;

export const HelpfulVoteResponseSchema = z.object({
  reviewId: ObjectIdSchema,
  helpfulVotes: z.number().int().nonnegative(),
  voted: z.boolean(),
});
export type HelpfulVoteResponse = z.infer<typeof HelpfulVoteResponseSchema>;

export const DeleteReviewResponseSchema = z.object({
  deletedId: ObjectIdSchema,
  bookId: ObjectIdSchema,
});
export type DeleteReviewResponse = z.infer<typeof DeleteReviewResponseSchema>;
