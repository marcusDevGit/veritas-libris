import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { usePageMeta } from './usePageMeta.js';

const MetaTester: React.FC<{ title?: string; description?: string }> = ({ title, description }) => {
  usePageMeta(title, description);
  return null;
};

describe('usePageMeta', () => {
  it('atualiza título e meta tags Open Graph e restaura padrões ao desmontar', () => {
    const { unmount } = render(
      <MetaTester title="Confissões" description="Análise moral e pedagógica de Santo Agostinho." />,
    );

    expect(document.title).toBe('Confissões | Veritas Libris');
    expect(
      document.head.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe('Análise moral e pedagógica de Santo Agostinho.');
    expect(
      document.head.querySelector('meta[property="og:title"]')?.getAttribute('content'),
    ).toBe('Confissões | Veritas Libris');

    unmount();

    expect(document.title).toBe('Veritas Libris — Curadoria & Discernimento Literário Católico');
  });
});
