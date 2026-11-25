import { Types } from 'mongoose';
import type {
  BookDto,
  CurationQueueQuery,
  CurationQueueResponse,
  CurationStats,
  UpdateBookEditorialBody,
} from '@app/shared';
import { AppError, NotFoundError } from '../errors/app-error.js';
import { AuditLogModel } from '../models/AuditLog.model.js';
import { BookModel } from '../models/Book.model.js';
import { EditorialAiDraftModel } from '../models/EditorialAiDraft.model.js';
import { ReviewModel } from '../models/Review.model.js';
import { calculateConsensus } from './consensus.service.js';
import { toBookDto, type BookLean } from './book.service.js';
import { sanitizeAlternativeIds, sanitizeTags } from './curation.utils.js';
import { notifyReadingListWatchers } from './notification.service.js';
import { escapeRegex } from '../utils/regex.js';

const MAGISTERIUM_DAILY_LIMIT = 100;

export async function getCurationStats(): Promise<CurationStats> {
  const startOfUtcDay = new Date();
  startOfUtcDay.setUTCHours(0, 0, 0, 0);

  const [total, pendingReview, locked, imprimatur, usedToday] = await Promise.all([
    BookModel.countDocuments({}),
    BookModel.countDocuments({ editorialLock: { $ne: true } }),
    BookModel.countDocuments({ editorialLock: true }),
    BookModel.countDocuments({ hasImprimatur: true }),
    AuditLogModel.countDocuments({
      action: 'AI_DRAFT_GENERATED',
      createdAt: { $gte: startOfUtcDay },
    }),
  ]);

  return {
    total,
    pendingReview,
    locked,
    imprimatur,
    aiQuota: {
      usedToday,
      dailyLimit: MAGISTERIUM_DAILY_LIMIT,
      remaining: Math.max(0, MAGISTERIUM_DAILY_LIMIT - usedToday),
      nearLimit: usedToday >= Math.floor(MAGISTERIUM_DAILY_LIMIT * 0.8),
    },
  };
}

export async function listCurationBooks(
  query: CurationQueueQuery,
): Promise<CurationQueueResponse> {
  const filter: Record<string, unknown> = {};

  if (query.filter === 'unlocked') {
    filter.editorialLock = { $ne: true };
  } else if (query.filter === 'locked') {
    filter.editorialLock = true;
  } else if (query.filter === 'imprimatur') {
    filter.hasImprimatur = true;
  }

  if (query.q && query.q.trim().length > 0) {
    const regex = new RegExp(escapeRegex(query.q.trim()), 'i');
    filter.$or = [{ title: regex }, { authors: regex }, { isbn13: regex }];
  }

  const skip = (query.page - 1) * query.limit;

  const [docs, total, stats] = await Promise.all([
    BookModel.find(filter)
      .sort({ editorialLock: 1, 'communityStats.totalReviews': -1, updatedAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean<BookLean[]>(),
    BookModel.countDocuments(filter),
    getCurationStats(),
  ]);

  return {
    items: docs.map(toBookDto),
    stats,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
  };
}

export async function updateBookEditorial(
  bookId: string,
  body: UpdateBookEditorialBody,
  actor: { uid: string; name: string; email: string | null },
): Promise<BookDto> {
  const book = await BookModel.findById(bookId).lean<BookLean | null>();
  if (!book) {
    throw new NotFoundError('Obra não encontrada no catálogo');
  }

  const cleanAlternativeIds = sanitizeAlternativeIds(bookId, body.alternatives);
  if (cleanAlternativeIds.length > 0) {
    const existingCount = await BookModel.countDocuments({
      _id: { $in: cleanAlternativeIds.map((id) => new Types.ObjectId(id)) },
    });
    if (existingCount !== cleanAlternativeIds.length) {
      throw new AppError(
        400,
        'Uma ou mais obras alternativas selecionadas não existem no catálogo.',
        'INVALID_ALTERNATIVE_BOOK',
      );
    }
  }

  const setUpdate: Record<string, unknown> = {
    editorialLock: body.editorialLock,
    hasImprimatur: body.hasImprimatur,
    alternatives: cleanAlternativeIds.map((id) => new Types.ObjectId(id)),
  };
  const unsetUpdate: Record<string, 1> = {};

  if (body.editorialSummary && body.editorialSummary.trim().length > 0) {
    setUpdate.editorialSummary = body.editorialSummary.trim();
  } else {
    unsetUpdate.editorialSummary = 1;
  }

  if (body.editorialLock) {
    setUpdate.adequacyStatus = body.adequacyStatus;
    setUpdate.recommendedAge = body.recommendedAge;
    if (body.tags !== undefined) {
      setUpdate.tags = sanitizeTags(body.tags);
    }
    if (body.reservations !== undefined) {
      setUpdate.reservations = body.reservations;
    }
    setUpdate.editorialLockedAt = new Date();
    setUpdate.editorialLockedBy = actor.email ?? actor.name;
  } else {
    unsetUpdate.editorialLockedAt = 1;
    unsetUpdate.editorialLockedBy = 1;

    const reviews = await ReviewModel.find({ bookId: new Types.ObjectId(bookId) }).lean();
    const consensus = calculateConsensus({
      currentEditorialLock: false,
      reviews,
    });
    setUpdate.communityStats = consensus.communityStats;
    setUpdate.adequacyStatus = consensus.adequacyStatus ?? 'UNRATED';
    setUpdate.recommendedAge = consensus.recommendedAge ?? 'ALL';
    setUpdate.reservations = consensus.reservations;
    setUpdate.tags = consensus.tags;
  }

  const updated = await BookModel.findByIdAndUpdate(
    bookId,
    {
      $set: setUpdate,
      ...(Object.keys(unsetUpdate).length > 0 ? { $unset: unsetUpdate } : {}),
    },
    { new: true },
  ).lean<BookLean | null>();

  if (!updated) {
    throw new NotFoundError('Obra não encontrada após atualização');
  }

  const latestAiDraft = body.editorialLock
    ? await EditorialAiDraftModel.findOne({ bookId: updated._id })
        .sort({ createdAt: -1 })
        .select('suggestedAdequacy')
        .lean<{ suggestedAdequacy?: string | null } | null>()
    : null;
  const aiFeedbackSuffix =
    body.editorialLock && latestAiDraft?.suggestedAdequacy
      ? ` • IA: ${latestAiDraft.suggestedAdequacy === updated.adequacyStatus ? 'concordou' : 'divergiu'}`
      : '';

  await AuditLogModel.create({
    action: 'EDITORIAL_LOCK_UPDATED',
    actorUid: actor.uid,
    actorName: actor.name,
    targetId: updated._id.toString(),
    targetLabel: `${updated.title} (ISBN ${updated.isbn13})`,
    details: body.editorialLock
      ? `Aplicou Trava Editorial: ${updated.adequacyStatus} (${updated.recommendedAge})${
          updated.hasImprimatur ? ' • Com Imprimatur' : ''
        } • ${updated.tags.length} tag(s), ${updated.reservations.length} ressalva(s)${aiFeedbackSuffix}`
      : 'Desativou Trava Editorial e restaurou consenso comunitário',
  });

  try {
    await notifyReadingListWatchers({
      bookId: updated._id,
      bookTitle: updated.title,
      type: 'EDITORIAL_UPDATE',
      actorUid: actor.uid,
      actorName: actor.name,
      summaryDetail: body.editorialLock
        ? `${updated.adequacyStatus} • ${updated.recommendedAge}`
        : 'Trava Editorial atualizada',
    });
  } catch {
    // Melhor esforço
  }

  return toBookDto(updated);
}
