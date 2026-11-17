import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateReviewBodySchema,
  type AdequacyLevel,
  type AgeRating,
  type BookDto,
  type ReservationItem,
} from '@app/shared';
import { api, ApiError } from '../../../services/api.js';
import { useAuth } from '../../../contexts/AuthContext.js';
import { ReviewModalHeader } from './ReviewModalHeader.js';
import { ReviewStepVerdict } from './ReviewStepVerdict.js';
import { ReviewStepTags } from './ReviewStepTags.js';
import { ReviewStepReservations } from './ReviewStepReservations.js';
import { ReviewStepComment } from './ReviewStepComment.js';
import { Send, LogIn, AlertTriangle } from 'lucide-react';

export interface ReviewModalProps {
  book: BookDto;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ReviewModal — Modal Completo de Avaliação & Ressalvas do Stitch
 *
 * Orquestra as 4 etapas do formulário doutrinário:
 * 1. Classificação Moral & Prudencial + Faixa Etária
 * 2. Marcadores Temáticos & Doutrinários
 * 3. Pontos de Inadequação & Alertas (Ressalvas dinâmicas)
 * 4. Parecer Editorial & Submissão autenticada
 */
export const ReviewModal: React.FC<ReviewModalProps> = ({
  book,
  isOpen,
  onClose,
}) => {
  const { user, signInWithGoogle, authError } = useAuth();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [adequacyVote, setAdequacyVote] = useState<Exclude<AdequacyLevel, 'UNRATED'>>('RECOMMENDED');
  const [ageVote, setAgeVote] = useState<AgeRating>(book.recommendedAge || 'ALL');
  const [suggestedTags, setSuggestedTags] = useState<string[]>(book.tags || []);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [comment, setComment] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        adequacyVote,
        ageVote,
        suggestedTags,
        reservations,
        comment: comment.trim(),
      };
      return api.submitReview(book._id!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', book._id] });
      queryClient.invalidateQueries({ queryKey: ['book-reviews', book._id] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setValidationError(err.message);
      } else {
        setValidationError('Erro inesperado ao publicar o parecer.');
      }
    },
  });

  if (!isOpen) return null;

  const handleSelectStep = (step: number) => {
    setCurrentStep(step);
    const refs = [step1Ref, step2Ref, step3Ref, step4Ref];
    refs[step - 1]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (adequacyVote !== 'RECOMMENDED' && reservations.length === 0) {
      setValidationError(
        'Ao marcar "Com Ressalvas" ou "Desaconselhado", adicione ao menos um ponto de atenção na Etapa 3.'
      );
      handleSelectStep(3);
      return;
    }

    const parsed = CreateReviewBodySchema.safeParse({
      adequacyVote,
      ageVote,
      suggestedTags,
      reservations,
      comment: comment.trim(),
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setValidationError(firstIssue?.message || 'Verifique os campos obrigatórios do formulário.');
      return;
    }

    mutation.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-xs overflow-y-auto px-4 py-8 sm:py-12"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden flex flex-col border border-outline/20 my-auto">
        <ReviewModalHeader
          book={book}
          currentStep={currentStep}
          onSelectStep={handleSelectStep}
          onClose={onClose}
        />

        {!user ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <LogIn className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl font-bold text-primary">
              Autenticação Necessária
            </h3>
            <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
              Para assegurar a responsabilidade moral e evitar avaliações anônimas automatizadas, entre com sua conta Google antes de publicar um parecer no índice.
            </p>
            {authError && (
              <p className="text-xs text-error bg-error-container/30 px-4 py-2 rounded-lg">
                {authError}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-secondary-container" />
                <span>Entrar com Google</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-10">
            <div ref={step1Ref} onFocus={() => setCurrentStep(1)}>
              <ReviewStepVerdict
                adequacyVote={adequacyVote}
                onChangeAdequacy={(val) => {
                  setAdequacyVote(val);
                  setCurrentStep(1);
                }}
                ageVote={ageVote}
                onChangeAge={setAgeVote}
              />
            </div>

            <div ref={step2Ref} onFocus={() => setCurrentStep(2)}>
              <ReviewStepTags
                selectedTags={suggestedTags}
                onChangeTags={(tags) => {
                  setSuggestedTags(tags);
                  setCurrentStep(2);
                }}
              />
            </div>

            <div ref={step3Ref} onFocus={() => setCurrentStep(3)}>
              <ReviewStepReservations
                adequacyVote={adequacyVote}
                reservations={reservations}
                onChangeReservations={(items) => {
                  setReservations(items);
                  setCurrentStep(3);
                }}
              />
            </div>

            <div ref={step4Ref} onFocus={() => setCurrentStep(4)}>
              <ReviewStepComment
                comment={comment}
                onChangeComment={(val) => {
                  setComment(val);
                  setCurrentStep(4);
                }}
              />
            </div>

            {validationError && (
              <div className="p-4 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-xs sm:text-sm flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-error shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="pt-4 border-t border-outline/15 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={mutation.isPending}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-auto px-7 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                <Send className="w-4 h-4 text-secondary-container" />
                <span>
                  {mutation.isPending ? 'Publicando Parecer...' : 'Publicar Avaliação no Índice'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
