import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reseta a rolagem para o topo sempre que o usuário navega para outra rota.
 * Observa apenas o pathname para não interferir em filtros por query string (?q=...).
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname, hash]);

  return null;
};
