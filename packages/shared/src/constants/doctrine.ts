import { z } from 'zod';

/**
 * Níveis de adequação moral e doutrinária de uma obra.
 */
export const ADEQUACY_LEVELS = [
  'RECOMMENDED',
  'WITH_RESERVATIONS',
  'NOT_RECOMMENDED',
  'UNRATED',
] as const;

export const AdequacyLevelSchema = z.enum(ADEQUACY_LEVELS);
export type AdequacyLevel = z.infer<typeof AdequacyLevelSchema>;

/**
 * Classificação indicativa de faixa etária.
 */
export const AGE_RATINGS = ['ALL', '10+', '12+', '14+', '16+', '18+'] as const;

export const AgeRatingSchema = z.enum(AGE_RATINGS);
export type AgeRating = z.infer<typeof AgeRatingSchema>;

/**
 * Tópicos específicos de ressalva doutrinária ou moral.
 */
export const RESERVATION_TOPICS = [
  'DOCTRINAL_ERROR',
  'MORAL_RELATIVISM',
  'SENSUAL_CONTENT',
  'VIOLENCE_GORE',
  'OCCULTISM',
  'PROFANITY',
  'ANTICLERICALISM',
] as const;

export const ReservationTopicSchema = z.enum(RESERVATION_TOPICS);
export type ReservationTopic = z.infer<typeof ReservationTopicSchema>;

/**
 * Grau de severidade de uma ressalva apontada na obra.
 */
export const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const;

export const SeverityLevelSchema = z.enum(SEVERITY_LEVELS);
export type SeverityLevel = z.infer<typeof SeverityLevelSchema>;

/**
 * Dicionários de rótulos legíveis (exibição consistente na UI).
 */
export const ADEQUACY_LEVEL_LABELS: Record<AdequacyLevel, string> = {
  RECOMMENDED: 'Recomendado',
  WITH_RESERVATIONS: 'Com Ressalvas',
  NOT_RECOMMENDED: 'Não Recomendado',
  UNRATED: 'Sem Avaliação',
};

export const RESERVATION_TOPIC_LABELS: Record<ReservationTopic, string> = {
  DOCTRINAL_ERROR: 'Erro Doutrinário',
  MORAL_RELATIVISM: 'Relativismo Moral',
  SENSUAL_CONTENT: 'Conteúdo Sensual',
  VIOLENCE_GORE: 'Violência / Gore',
  OCCULTISM: 'Ocultismo / Esoterismo',
  PROFANITY: 'Linguagem Imprópria / Blasfêmia',
  ANTICLERICALISM: 'Anticlericalismo',
};

export const SEVERITY_LEVEL_LABELS: Record<SeverityLevel, string> = {
  LOW: 'Leve',
  MEDIUM: 'Moderada',
  HIGH: 'Grave',
};
