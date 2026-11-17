import type {
  AdequacyLevel,
  AgeRating,
  ReservationItem,
  ReservationTopic,
  SeverityLevel,
} from '@app/shared';
import type { ReviewAttrs } from '../models/Review.model.js';

export interface ConsensusCalculationInput {
  currentEditorialLock: boolean;
  reviews: Array<Pick<ReviewAttrs, 'adequacyVote' | 'ageVote' | 'isCurator' | 'reservations' | 'suggestedTags'>>;
}

export interface ConsensusCalculationResult {
  communityStats: {
    totalReviews: number;
    recommendedCount: number;
    reservationsCount: number;
    notRecommendedCount: number;
  };
  adequacyStatus?: AdequacyLevel;
  recommendedAge?: AgeRating;
  reservations: ReservationItem[];
  tags: string[];
}

const AGE_ORDER: AgeRating[] = ['ALL', '10+', '12+', '14+', '16+', '18+'];
const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

/**
 * Motor puro de cálculo de consenso e consolidação.
 * Exportado para testes unitários isolados (sem mock de banco de dados).
 */
export function calculateConsensus({
  currentEditorialLock,
  reviews,
}: ConsensusCalculationInput): ConsensusCalculationResult {
  const totalReviews = reviews.length;

  let recommendedCount = 0;
  let reservationsCount = 0;
  let notRecommendedCount = 0;

  let weightedRecommended = 0;
  let weightedReservations = 0;
  let weightedNotRecommended = 0;
  let totalWeight = 0;

  const reservationsMap = new Map<
    ReservationTopic,
    { severity: SeverityLevel; descriptions: Set<string>; reference?: string }
  >();

  const ageVotesWeight = new Map<AgeRating, number>();
  for (const age of AGE_ORDER) {
    ageVotesWeight.set(age, 0);
  }

  const tagsSet = new Set<string>();

  for (const rev of reviews) {
    const weight = rev.isCurator ? 3 : 1;
    totalWeight += weight;

    if (rev.adequacyVote === 'RECOMMENDED') {
      recommendedCount++;
      weightedRecommended += weight;
    } else if (rev.adequacyVote === 'WITH_RESERVATIONS') {
      reservationsCount++;
      weightedReservations += weight;
    } else if (rev.adequacyVote === 'NOT_RECOMMENDED') {
      notRecommendedCount++;
      weightedNotRecommended += weight;
    }

    const currentAgeWeight = ageVotesWeight.get(rev.ageVote) ?? 0;
    ageVotesWeight.set(rev.ageVote, currentAgeWeight + weight);

    for (const tag of rev.suggestedTags ?? []) {
      const trimmed = tag.trim();
      if (trimmed) tagsSet.add(trimmed.toLowerCase());
    }

    for (const res of rev.reservations ?? []) {
      const existing = reservationsMap.get(res.topic);
      if (!existing) {
        reservationsMap.set(res.topic, {
          severity: res.severity,
          descriptions: new Set([res.description.trim()]),
          reference: res.reference?.trim() || undefined,
        });
      } else {
        if (SEVERITY_ORDER[res.severity] > SEVERITY_ORDER[existing.severity]) {
          existing.severity = res.severity;
        }
        existing.descriptions.add(res.description.trim());
        if (!existing.reference && res.reference?.trim()) {
          existing.reference = res.reference.trim();
        }
      }
    }
  }

  const communityStats = {
    totalReviews,
    recommendedCount,
    reservationsCount,
    notRecommendedCount,
  };

  const consolidatedReservations: ReservationItem[] = Array.from(reservationsMap.entries()).map(
    ([topic, data]) => ({
      topic,
      severity: data.severity,
      description: Array.from(data.descriptions).join('; '),
      ...(data.reference ? { reference: data.reference } : {}),
    }),
  );

  const result: ConsensusCalculationResult = {
    communityStats,
    reservations: consolidatedReservations,
    tags: Array.from(tagsSet),
  };

  if (currentEditorialLock) {
    return result;
  }

  if (totalReviews === 0 || totalWeight === 0) {
    result.adequacyStatus = 'UNRATED';
    result.recommendedAge = 'ALL';
    return result;
  }

  const notRecommendedRatio = weightedNotRecommended / totalWeight;
  const withReservationsRatio = (weightedReservations + weightedNotRecommended) / totalWeight;

  if (notRecommendedRatio >= 0.4) {
    result.adequacyStatus = 'NOT_RECOMMENDED';
  } else if (withReservationsRatio >= 0.5) {
    result.adequacyStatus = 'WITH_RESERVATIONS';
  } else {
    result.adequacyStatus = 'RECOMMENDED';
  }

  const halfWeight = totalWeight / 2;
  let cumulativeWeight = 0;
  let selectedAge: AgeRating = 'ALL';

  for (const age of AGE_ORDER) {
    cumulativeWeight += ageVotesWeight.get(age) ?? 0;
    if (cumulativeWeight >= halfWeight) {
      selectedAge = age;
      break;
    }
  }
  result.recommendedAge = selectedAge;

  return result;
}
