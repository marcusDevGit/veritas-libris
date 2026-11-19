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
