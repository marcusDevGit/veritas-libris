import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurationAiAssistantBox } from './CurationAiAssistantBox.js';

const mockGenerateEditorialAiDraft = vi.fn();

vi.mock('../../../services/api.js', () => ({
  ApiError: class extends Error {},
  api: {
    generateEditorialAiDraft: (bookId: string) => mockGenerateEditorialAiDraft(bookId),
  },
}));

describe('CurationAiAssistantBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exibe orientação permanente aos curadores, gera rascunho e aplica ao editor sem salvar', async () => {
    mockGenerateEditorialAiDraft.mockResolvedValue({
      draftText: 'Obra com sólido valor formativo conforme critérios prudenciais.',
      suggestedAdequacy: 'WITH_RESERVATIONS',
      suggestedAge: '14+',
      recommendationRationale: 'Apresenta conflitos morais que pedem maturidade juvenil.',
      cached: false,
      generatedAt: '2026-11-20T11:00:00.000Z',
      citations: [
        {
          documentTitle: 'Inter Mirifica',
          documentReference: '2',
          documentYear: '1963',
          citedText: 'Os meios contribuem eficazmente para enriquecer o espírito humano.',
          sourceUrl: 'https://www.magisterium.com/doc/1',
        },
      ],
    });

    const onApplyDraft = vi.fn();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <CurationAiAssistantBox bookId="book-1" onApplyDraft={onApplyDraft} />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/não lê o livro inteiro/i)).toBeInTheDocument();
    expect(screen.getByText(/rascunho revisável/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Consultar Apoio Doutrinário/i }));

    expect(
      await screen.findByText('Obra com sólido valor formativo conforme critérios prudenciais.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Com Ressalvas')).toBeInTheDocument();
    expect(screen.getByText('14+')).toBeInTheDocument();
    expect(
      screen.getByText(/Apresenta conflitos morais que pedem maturidade juvenil\./i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Inter Mirifica/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Aplicar ao Rascunho da Nota/i }));
    await waitFor(() => {
      expect(onApplyDraft).toHaveBeenCalledWith(
        'Obra com sólido valor formativo conforme critérios prudenciais.',
      );
    });
    expect(screen.getByText(/Texto aplicado na Síntese abaixo para revisão/i)).toBeInTheDocument();
  });
});
