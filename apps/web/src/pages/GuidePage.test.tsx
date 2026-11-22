import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GuidePage } from './GuidePage.js';

describe('GuidePage', () => {
  it('renderiza as abas do guia, alterna seções e exibe links contextuais', () => {
    render(
      <MemoryRouter>
        <GuidePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/As 4 Dimensões & Vereditos/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver Matriz Completa/i })).toHaveAttribute(
      'href',
      '/criterios',
    );

    fireEvent.click(screen.getByRole('tab', { name: /Papéis & Conduta/i }));
    expect(screen.getByText(/Leitores & Visitantes \(READER\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Curadores Oficiais \(CURATOR\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Sugestões & Indicação/i }));
    expect(screen.getByRole('link', { name: /Ir para Enviar Sugestões/i })).toHaveAttribute(
      'href',
      '/sugestoes',
    );

    fireEvent.click(screen.getByRole('tab', { name: /Curadoria & Moderação/i }));
    expect(screen.getByText(/Copiloto Magisterium AI/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Funcionalidades do App/i }));
    expect(screen.getByText(/Importação & Scanner ISBN/i)).toBeInTheDocument();
  });
});
