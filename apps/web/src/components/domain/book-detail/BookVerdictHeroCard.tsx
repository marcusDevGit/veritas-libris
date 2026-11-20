import React from 'react';
import type { BookDto } from '@app/shared';
import { AdequacyBadge } from '../AdequacyBadge.js';
import { CommunityStatsBar } from '../CommunityStatsBar.js';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Tag,
} from 'lucide-react';

export interface BookVerdictHeroCardProps {
  book: BookDto;
}

/**
 * Calcula indicadores visuais das 4 dimensões de discernimento
 * a partir do veredito e das ressalvas registradas na obra.
 */
function computeDimensionIndicators(book: BookDto) {
  if (book.adequacyStatus === 'UNRATED') {
    return null;
  }

  const hasDoctrinal = book.reservations.some(
    (r) =>
      r.topic === 'DOCTRINAL_ERROR' ||
      r.topic === 'MORAL_RELATIVISM' ||
      r.topic === 'ANTICLERICALISM'
  );
  const hasImmodesty = book.reservations.some(
    (r) => r.topic === 'SENSUAL_CONTENT'
  );
  const hasViolence = book.reservations.some(
    (r) => r.topic === 'VIOLENCE_GORE'
  );

  const doctrinalScore =
    book.adequacyStatus === 'NOT_RECOMMENDED'
      ? 3.0
      : hasDoctrinal
        ? 6.5
        : book.hasImprimatur
          ? 10.0
          : 9.0;

  const modestyScore = hasImmodesty
    ? 5.0
    : book.adequacyStatus === 'NOT_RECOMMENDED'
      ? 4.5
      : 9.0;

  const violenceScore = hasViolence ? 4.5 : 9.0;

  const total = book.communityStats.totalReviews;
  const approvalRatio =
    total > 0
      ? Math.round(
          ((book.communityStats.recommendedCount +
            book.communityStats.reservationsCount * 0.5) /
            total) *
            100
        )
      : book.adequacyStatus === 'RECOMMENDED'
        ? 95
        : book.adequacyStatus === 'WITH_RESERVATIONS'
          ? 70
          : 20;

  return {
    doctrinalScore,
    modestyScore,
    violenceScore,
    approvalRatio,
  };
}

/**
 * BookVerdictHeroCard — Card Principal de Título e Veredito Doutrinário
 *
 * Reproduz o Hero Card do Stitch na coluna direita:
 * - Título, subtítulo e autoria
 * - Banner colorido dinâmico de acordo com o veredito (Recomendado, Com Ressalvas, Desaconselhado, Sem Avaliação)
 * - Síntese do parecer editorial e barras quantitativas das dimensões morais
 * - Estatísticas reais da comunidade e tags temáticas
 */
export const BookVerdictHeroCard: React.FC<BookVerdictHeroCardProps> = ({ book }) => {
  const bannerClasses = {
    RECOMMENDED: 'bg-success-container/30 border-success/25',
    WITH_RESERVATIONS: 'bg-secondary-container/30 border-secondary-container/60',
    NOT_RECOMMENDED: 'bg-error-container/35 border-error/25',
    UNRATED: 'bg-surface-container border-outline/15',
  }[book.adequacyStatus];

  const hasDoctrinalAlert = book.reservations.some(
    (r) =>
      r.topic === 'DOCTRINAL_ERROR' ||
      r.topic === 'ANTICLERICALISM'
  );

  const dimensions = computeDimensionIndicators(book);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-sm border border-outline/10">
      <div className="flex flex-col gap-1 mb-6">
        <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
          Parecer Doutrinário Geral
        </span>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          {book.title}
        </h1>
        <p className="text-base sm:text-lg font-editorial text-on-surface-variant mt-0.5">
          Por <span className="text-primary font-semibold">{book.authors.join(', ')}</span>
        </p>
      </div>

      <div className={`rounded-xl p-5 sm:p-6 border relative overflow-hidden ${bannerClasses}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <AdequacyBadge status={book.adequacyStatus} size="md" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-tertiary text-on-tertiary text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Faixa Recomendada: {book.recommendedAge}</span>
            </div>
          </div>

          <div className="text-xs font-semibold flex items-center gap-1.5">
            {book.adequacyStatus === 'UNRATED' ? (
              <span className="text-outline">Aguardando Pareceres</span>
            ) : hasDoctrinalAlert ? (
              <span className="text-error flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Contém Ressalva Doutrinária</span>
              </span>
            ) : book.adequacyStatus === 'NOT_RECOMMENDED' ? (
              <span className="text-error flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Obra Desaconselhada</span>
              </span>
            ) : book.reservations.length > 0 ? (
              <span className="text-secondary flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Contém Pontos de Cautela</span>
              </span>
            ) : (
              <span className="text-secondary flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sem Heresia Dogmática Formal</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-secondary" />
            <span>Síntese do Discernimento Editorial</span>
          </h3>

          <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
            {book.editorialSummary ||
              (book.adequacyStatus === 'UNRATED'
                ? 'Esta obra foi catalogada no acervo e aguarda as primeiras análises morais e doutrinárias de curadores e leitores da comunidade.'
                : `Obra avaliada pela comunidade Veritas Libris com classificação etária recomendada de ${book.recommendedAge} e ${book.reservations.length} ${
                    book.reservations.length === 1 ? 'ressalva apontada' : 'ressalvas apontadas'
                  }. Consulte abaixo os pontos específicos de atenção.`)}
          </p>
        </div>

        {dimensions && (
          <div className="mt-6 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-surface-container-lowest/85 rounded-lg p-4 border border-outline/10">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-on-surface-variant">Fidelidade Doutrinária</span>
                <span className="font-bold text-primary">{dimensions.doctrinalScore.toFixed(1)}/10</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${dimensions.doctrinalScore * 10}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-on-surface-variant">Modéstia & Pureza</span>
                <span className="font-bold text-secondary">{dimensions.modestyScore.toFixed(1)}/10</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full"
                  style={{ width: `${dimensions.modestyScore * 10}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-on-surface-variant">Violência / Gravidade</span>
                <span className="font-bold text-error">{dimensions.violenceScore.toFixed(1)}/10</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-error rounded-full"
                  style={{ width: `${dimensions.violenceScore * 10}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-on-surface-variant">Consenso Positivo</span>
                <span className="font-bold text-primary">{dimensions.approvalRatio}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${dimensions.approvalRatio}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-surface-container-low rounded-xl border border-outline/10">
        <CommunityStatsBar stats={book.communityStats} />
      </div>

      {book.tags.length > 0 && (
        <div className="mt-5 pt-4 border-t border-outline/10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Temáticas:</span>
          </span>
          {book.tags.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant text-xs font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
