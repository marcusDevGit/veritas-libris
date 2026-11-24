import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CatalogFilters } from './CatalogFilters.js';

describe('CatalogFilters', () => {
  it('exibe contador de filtros secundários ativos e alterna o painel móvel', () => {
    const onViewModeChange = vi.fn();
    render(
      <CatalogFilters
        selectedAge="14+"
        onSelectAdequacy={vi.fn()}
        onSelectAge={vi.fn()}
        onSelectCategory={vi.fn()}
        onSelectStamp={vi.fn()}
        sortBy="most-reviewed"
        onSortChange={vi.fn()}
        viewMode="grid"
        onViewModeChange={onViewModeChange}
        onResetFilters={vi.fn()}
      />,
    );

    const filtersToggle = screen.getByRole('button', { name: /Filtros/i });
    expect(filtersToggle).toHaveAttribute('aria-expanded', 'false');
    expect(filtersToggle).toHaveTextContent('1');

    fireEvent.click(filtersToggle);
    expect(filtersToggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: /Visualização em Lista/i }));
    expect(onViewModeChange).toHaveBeenCalledWith('list');
  });
});
