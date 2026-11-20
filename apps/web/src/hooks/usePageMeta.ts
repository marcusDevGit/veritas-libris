import { useEffect } from 'react';

const DEFAULT_TITLE = 'Veritas Libris — Curadoria & Discernimento Literário Católico';
const DEFAULT_DESCRIPTION =
  'Plataforma independente de curadoria e discernimento literário católico à luz da Tradição e do Magistério Eclesial.';

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Atualiza título e meta tags (description / Open Graph) da página ativa
 * sem dependências extras, restaurando os valores padrão ao desmontar.
 */
export function usePageMeta(title?: string, description?: string): void {
  useEffect(() => {
    const fullTitle = title ? `${title} | Veritas Libris` : DEFAULT_TITLE;
    const metaDescription = description?.trim() || DEFAULT_DESCRIPTION;

    document.title = fullTitle;
    upsertMetaTag('name', 'description', metaDescription);
    upsertMetaTag('property', 'og:title', fullTitle);
    upsertMetaTag('property', 'og:description', metaDescription);

    return () => {
      document.title = DEFAULT_TITLE;
      upsertMetaTag('name', 'description', DEFAULT_DESCRIPTION);
      upsertMetaTag('property', 'og:title', DEFAULT_TITLE);
      upsertMetaTag('property', 'og:description', DEFAULT_DESCRIPTION);
    };
  }, [title, description]);
}
