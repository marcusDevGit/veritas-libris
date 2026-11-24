import type { SuggestionListQuery, SuggestionStats, SuggestionStatus } from '@app/shared';
import { escapeRegex } from '../utils/regex.js';

/**
 * Monta o filtro Mongoose preservando compatibilidade com documentos antigos
 * sem o campo `status` gravado (tratados como PENDING).
 */
export function buildSuggestionFilter(
  query: Partial<Pick<SuggestionListQuery, 'status' | 'type' | 'q'>>,
): Record<string, unknown> {
  const clauses: Record<string, unknown>[] = [];

  if (query.status === 'PENDING') {
    clauses.push({
      $or: [{ status: 'PENDING' }, { status: { $exists: false } }],
    });
  } else if (query.status) {
    clauses.push({ status: query.status });
  }

  if (query.type) {
    clauses.push({ type: query.type });
  }

  const trimmedQ = query.q?.trim();
  if (trimmedQ) {
    const regex = new RegExp(escapeRegex(trimmedQ), 'i');
    clauses.push({
      $or: [
        { title: regex },
        { author: regex },
        { isbn13: regex },
        { message: regex },
        { senderName: regex },
      ],
    });
  }

  if (clauses.length === 0) {
    return {};
  }

  return clauses.length === 1 ? (clauses[0] ?? {}) : { $and: clauses };
}

export function computeSuggestionStats(
  rows: Array<{ status?: SuggestionStatus | null }>,
): SuggestionStats {
  const stats: SuggestionStats = {
    total: rows.length,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    dismissed: 0,
  };

  for (const row of rows) {
    const effectiveStatus: SuggestionStatus = row.status ?? 'PENDING';
    if (effectiveStatus === 'PENDING') stats.pending += 1;
    else if (effectiveStatus === 'REVIEWED') stats.reviewed += 1;
    else if (effectiveStatus === 'ACCEPTED') stats.accepted += 1;
    else if (effectiveStatus === 'DISMISSED') stats.dismissed += 1;
  }

  return stats;
}
