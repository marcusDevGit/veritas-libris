import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { SuggestionDto } from '@app/shared';
import { SuggestionTriageCard } from './SuggestionTriageCard.js';

const baseSuggestion: SuggestionDto = {
  id: 'sug-1',
  type: 'BOOK',
  title: 'Ortodoxia',
  author: 'G. K. Chesterton',
  isbn13: '978-85-359-0277-8',
  senderName: 'Maria',
  senderEmail: 'maria@example.com',
  message: 'Excelente obra apologética para análise moral no catálogo.',
  status: 'PENDING',
  reviewedByName: null,
  reviewedAt: null,
  resolutionNote: null,
  createdAt: '2026-11-19T12:00:00.000Z',
};

describe('SuggestionTriageCard', () => {
  it('habilita importação quando o ISBN é válido e envia nota de resolução na triagem', () => {
    const onTriage = vi.fn();
    const onImportBook = vi.fn();

    render(
      <SuggestionTriageCard
        suggestion={baseSuggestion}
        isBusy={false}
        onTriage={onTriage}
        onImportBook={onImportBook}
      />,
    );

    const importBtn = screen.getByRole('button', { name: /Importar Obra/i });
    fireEvent.click(importBtn);
    expect(onImportBook).toHaveBeenCalledWith('9788535902778', 'sug-1');

    const noteInput = screen.getByPlaceholderText(/Nota interna de resolução/i);
    fireEvent.change(noteInput, { target: { value: 'Aprovado para curadoria prioritária' } });
    fireEvent.click(screen.getByRole('button', { name: /Aceitar/i }));

    expect(onTriage).toHaveBeenCalledWith(
      'sug-1',
      'ACCEPTED',
      'Aprovado para curadoria prioritária',
    );
  });

  it('oculta botão de importação para sugestões de melhoria ou ISBN inválido', () => {
    render(
      <SuggestionTriageCard
        suggestion={{ ...baseSuggestion, type: 'IMPROVEMENT', isbn13: '123' }}
        isBusy={false}
        onTriage={vi.fn()}
        onImportBook={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /Importar Obra/i })).not.toBeInTheDocument();
  });
});
