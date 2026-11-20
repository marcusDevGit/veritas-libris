import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, Link, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop.js';

describe('ScrollToTop', () => {
  it('rola para o início ao mudar de pathname, sem disparar em mudanças só de query string', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const { getByText } = render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
        <Link to="/?q=tolkien">Filtrar</Link>
        <Link to="/sobre">Sobre</Link>
        <Routes>
          <Route path="/" element={<div>Catálogo</div>} />
          <Route path="/sobre" element={<div>Sobre</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(scrollToSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('Filtrar'));
    expect(scrollToSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('Sobre'));
    expect(scrollToSpy).toHaveBeenCalledTimes(2);
    expect(scrollToSpy).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: 'auto' });

    scrollToSpy.mockRestore();
  });
});
