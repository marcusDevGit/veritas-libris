import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { BookDto } from '@app/shared';
import { CurationEditorialEditor } from './CurationEditorialEditor.js';

vi.mock('../../../services/api.js', () => ({
  ApiError: class extends Error {},
  api: {
    listBooks: vi.fn().mockResolvedValue({ items: [] }),
    generateEditorialAiDraft: vi.fn(),
  },
}));

const sampleBook: BookDto = {
  _id: 'book-1',
  isbn13: '9788535902778',
  title: 'Dom Casmurro',
  authors: ['Machado de Assis'],
  editorialLock: false,
  hasImprimatur: false,
  adequacyStatus: 'UNRATED',
  recommendedAge: 'ALL',
  tags: [],
  reservations: [],
  alternatives: [],
  communityStats: {
    totalReviews: 0,
    recommendedCount: 0,
    reservationsCount: 0,
    notRecommendedCount: 0,
  },
  createdAt: new Date('2026-11-20T00:00:00.000Z'),
  updatedAt: new Date('2026-11-20T00:00:00.000Z'),
};

function renderEditor(
  book: BookDto,
  feedback: { type: 'success' | 'error'; text: string } | null = null,
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onSave = vi.fn();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <CurationEditorialEditor
        book={book}
        isSaving={false}
        feedback={feedback}
        onSave={onSave}
      />
    </QueryClientProvider>,
  );
  return { ...utils, onSave, queryClient };
}

describe('CurationEditorialEditor', () => {
  it('mantém botão de salvar desabilitado sem alterações (inclusive em obra UNRATED) e desabilita após salvar', () => {
    const { rerender, queryClient, onSave } = renderEditor(sampleBook);

    const saveBtn = screen.getByRole('button', { name: /Salvar Parecer Oficial/i });
    expect(saveBtn).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/Redija o parecer pastoral/i);
    fireEvent.change(textarea, { target: { value: 'Síntese pastoral revisada.' } });
    expect(saveBtn).toBeEnabled();

    fireEvent.click(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(1);

    rerender(
      <QueryClientProvider client={queryClient}>
        <CurationEditorialEditor
          book={{ ...sampleBook, editorialSummary: 'Síntese pastoral revisada.' }}
          isSaving={false}
          feedback={{ type: 'success', text: 'Parecer oficial salvo com sucesso.' }}
          onSave={onSave}
        />
      </QueryClientProvider>,
    );

    const savedBtn = screen.getByRole('button', { name: /Parecer Salvo/i });
    expect(savedBtn).toBeDisabled();
  });

  it('permite editar tags e ressalvas oficiais apenas quando a Trava Editorial está ativa', () => {
    const bookWithCommunityData: BookDto = {
      ...sampleBook,
      adequacyStatus: 'NOT_RECOMMENDED',
      recommendedAge: '18+',
      tags: ['Niilismo / Existencialismo'],
      reservations: [
        {
          topic: 'DOCTRINAL_ERROR',
          severity: 'HIGH',
          description: 'Ressalva antiga da comunidade que o curador vai substituir.',
        },
      ],
    };

    const { onSave } = renderEditor(bookWithCommunityData);

    const addReservationBtn = screen.getByRole('button', { name: /Adicionar outro ponto de atenção/i });
    expect(addReservationBtn).toBeDisabled();

    const lockSwitch = screen.getAllByRole('switch')[0];
    fireEvent.click(lockSwitch);

    expect(addReservationBtn).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /^Recomendado\b/i }));
    fireEvent.click(screen.getByRole('button', { name: /Virtudes Cristãs/i }));
    fireEvent.click(screen.getByTitle('Remover ressalva'));

    const saveBtn = screen.getByRole('button', { name: /Salvar Parecer Oficial/i });
    expect(saveBtn).toBeEnabled();
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        editorialLock: true,
        adequacyStatus: 'RECOMMENDED',
        tags: ['Niilismo / Existencialismo', 'Virtudes Cristãs'],
        reservations: [],
      }),
    );
  });

  it('valida justificativa mínima de 10 caracteres nas ressalvas oficiais', () => {
    const { onSave } = renderEditor(sampleBook);

    const lockSwitch = screen.getAllByRole('switch')[0];
    fireEvent.click(lockSwitch);

    fireEvent.click(screen.getByRole('button', { name: /Adicionar ponto de atenção/i }));
    const descInput = screen.getByPlaceholderText(/Descreva objetivamente o trecho/i);
    fireEvent.change(descInput, { target: { value: 'Curta' } });

    const saveBtn = screen.getByRole('button', { name: /Salvar Parecer Oficial/i });
    fireEvent.click(saveBtn);

    expect(
      screen.getByText(/Cada ponto de atenção deve ter uma justificativa com pelo menos 10 caracteres\./i),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
