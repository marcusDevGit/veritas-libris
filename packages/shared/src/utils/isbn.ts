/**
 * Utilitários de ISBN. Ficam no @app/shared porque a API (importação) e o frontend
 * (leitor de código de barras, Fase 6) precisam da MESMA regra de normalização.
 * Sem dependências: funciona em Node e no navegador.
 */

/** Remove hifens e espaços e deixa em maiúsculas (o "X" final do ISBN-10 é maiúsculo). */
export function stripIsbn(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

function digitAt(value: string, index: number): number {
  return value.charCodeAt(index) - 48;
}

/** Dígito verificador de um ISBN-13 a partir dos 12 primeiros dígitos (pesos alternados 1 e 3). */
function isbn13CheckDigit(first12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digitAt(first12, i) * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
}

/** `true` se for exatamente 13 dígitos e o dígito verificador conferir. */
export function isValidIsbn13(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) return false;
  if (/^97[89]0{9}\d$/.test(isbn)) return false;
  return isbn13CheckDigit(isbn) === digitAt(isbn, 12);
}

/** `true` se for ISBN-10 válido (9 dígitos + dígito ou "X"; soma ponderada divisível por 11). */
export function isValidIsbn10(isbn: string): boolean {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;
  if (/^0{9}[\dX]$/.test(isbn)) return false;

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const value = isbn[i] === "X" ? 10 : digitAt(isbn, i);
    sum += value * (10 - i);
  }
  return sum % 11 === 0;
}

/** Converte ISBN-10 (já validado) em ISBN-13: prefixo 978 + 9 dígitos + novo dígito verificador. */
export function isbn10ToIsbn13(isbn10: string): string {
  const first12 = `978${isbn10.slice(0, 9)}`;
  return `${first12}${isbn13CheckDigit(first12)}`;
}

/**
 * Aceita ISBN-10 ou ISBN-13, com ou sem hifens, e devolve SEMPRE um ISBN-13 válido.
 * Retorna `null` se a entrada não for um ISBN válido.
 */
export function normalizeIsbn(input: string): string | null {
  const cleaned = stripIsbn(input);

  if (cleaned.length === 13) {
    return isValidIsbn13(cleaned) ? cleaned : null;
  }
  if (cleaned.length === 10) {
    return isValidIsbn10(cleaned) ? isbn10ToIsbn13(cleaned) : null;
  }
  return null;
}
