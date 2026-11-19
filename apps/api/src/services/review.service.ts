import { Types } from 'mongoose';
import type {
  CreateReviewBody,
  HelpfulVoteResponse,
  PaginatedReviews,
  Review,
  ReviewListQuery,
} from '@app/shared';
import { NotFoundError } from '../errors/app-error.js';
import { BookModel } from '../models/Book.model.js';
import { ReviewModel, type ReviewAttrs } from '../models/Review.model.js';
import { calculateConsensus } from './consensus.service.js';
import { notifyReadingListWatchers } from './notification.service.js';

export interface UpsertReviewInput {
  bookId: string;
  userId: string;
  userName: string;
  isCurator: boolean;
  data: CreateReviewBody;
}

type ReviewLean = ReviewAttrs & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

function toReviewDto(doc: ReviewLean): Review & { _id: string } {
  return {
    _id: doc._id.toString(),
    bookId: doc.bookId.toString(),
    userId: doc.userId,
    userName: doc.userName,
    isCurator: doc.isCurator,
    adequacyVote: doc.adequacyVote,
    ageVote: doc.ageVote,
    suggestedTags: doc.suggestedTags,
    reservations: doc.reservations,
    comment: doc.comment,
    helpfulVotes: doc.helpfulVotes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Cria ou atualiza uma avaliação e recalcula o consenso do livro
 */
export async function upsertReview({
  bookId,
  userId,
  userName,
  isCurator,
  data,
}: UpsertReviewInput): Promise<Review & { _id: string }> {
  const bookObjectId = new Types.ObjectId(bookId);
  const book = await BookModel.findById(bookObjectId);
  if (!book) {
    throw new NotFoundError('Livro não encontrado');
  }

  const reviewDoc = await ReviewModel.findOneAndUpdate(
    { bookId: bookObjectId, userId },
    {
      $set: {
        userName,
        isCurator,
        adequacyVote: data.adequacyVote,
        ageVote: data.ageVote,
        suggestedTags: data.suggestedTags,
        reservations: data.reservations,
        comment: data.comment,
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  ).lean<ReviewLean>();

  if (!reviewDoc) {
    throw new Error('Falha ao persistir avaliação');
  }

  const allReviews = await ReviewModel.find({ bookId: bookObjectId }).lean<ReviewAttrs[]>();

  const consensus = calculateConsensus({
    currentEditorialLock: book.editorialLock,
    reviews: allReviews,
  });

  book.communityStats = consensus.communityStats;
  book.reservations = consensus.reservations;
  if (consensus.tags.length > 0) {
    const mergedTags = new Set([...book.tags, ...consensus.tags]);
    book.tags = Array.from(mergedTags);
  }

  if (!book.editorialLock && consensus.adequacyStatus && consensus.recommendedAge) {
    book.adequacyStatus = consensus.adequacyStatus;
    book.recommendedAge = consensus.recommendedAge;
  }

  await book.save();

  try {
    await notifyReadingListWatchers({
      bookId: book._id,
      bookTitle: book.title,
      type: 'NEW_REVIEW',
      actorUid: userId,
      actorName: userName,
    });
  } catch {
    // Notificação é melhor esforço para não falhar a publicação do parecer
  }

  return toReviewDto(reviewDoc);
}

/**
 * Listagem paginada de reviews de um livro
 * Prioridade: avaliações de curadores primeiro, depois mais úteis, depois mais recentes.
 */
export async function listReviewsByBook(
  bookId: string,
  query: ReviewListQuery,
): Promise<PaginatedReviews> {
  const bookObjectId = new Types.ObjectId(bookId);
  const bookExists = await BookModel.exists({ _id: bookObjectId });
  if (!bookExists) {
    throw new NotFoundError('Livro não encontrado');
  }

  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    ReviewModel.find({ bookId: bookObjectId })
      .sort({ isCurator: -1, helpfulVotes: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<ReviewLean[]>(),
    ReviewModel.countDocuments({ bookId: bookObjectId }),
  ]);

  return {
    items: docs.map(toReviewDto),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Voto útil em uma avaliação (com proteção contra votos duplicados)
 */
export async function voteReviewHelpful(
  reviewId: string,
  userId: string,
): Promise<HelpfulVoteResponse> {
  const reviewObjectId = new Types.ObjectId(reviewId);

  const existingVote = await ReviewModel.findOne({
    _id: reviewObjectId,
    helpfulUserIds: userId,
  });

  if (existingVote) {
    const updated = await ReviewModel.findByIdAndUpdate(
      reviewObjectId,
      {
        $pull: { helpfulUserIds: userId },
        $inc: { helpfulVotes: -1 },
      },
      { returnDocument: 'after' },
    ).lean<ReviewLean>();

    if (!updated) throw new NotFoundError('Avaliação não encontrada');

    return {
      reviewId,
      helpfulVotes: Math.max(0, updated.helpfulVotes),
      voted: false,
    };
  }

  const updated = await ReviewModel.findByIdAndUpdate(
    reviewObjectId,
    {
      $addToSet: { helpfulUserIds: userId },
      $inc: { helpfulVotes: 1 },
    },
    { returnDocument: 'after' },
  ).lean<ReviewLean>();

  if (!updated) {
    throw new NotFoundError('Avaliação não encontrada');
  }

  return {
    reviewId,
    helpfulVotes: updated.helpfulVotes,
    voted: true,
  };
}
