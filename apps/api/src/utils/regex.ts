const MAX_REGEX_INPUT_LENGTH = 120;

/**
 * Escapa caracteres especiais de expressão regular e limita o tamanho da entrada
 * para prevenir consultas custosas (ReDoS) em filtros textuais no MongoDB.
 */
export function escapeRegex(value: string, maxLength = MAX_REGEX_INPUT_LENGTH): string {
  const bounded = value.trim().slice(0, maxLength);
  return bounded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
