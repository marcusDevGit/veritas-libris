/**
 * Sanitiza a lista de obras alternativas removendo duplicatas e o próprio ID da obra.
 */
export function sanitizeAlternativeIds(bookId: string, alternatives: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const altId of alternatives) {
    if (altId === bookId || seen.has(altId)) continue;
    seen.add(altId);
    result.push(altId);
  }

  return result;
}

/**
 * Normaliza e remove duplicatas da lista de tags editoriais preservando a ordem.
 */
export function sanitizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags) {
    const cleaned = raw.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }

  return result;
}
