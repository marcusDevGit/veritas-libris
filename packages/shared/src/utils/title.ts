const LOWERCASE_WORDS = new Set([
  'a',
  'as',
  'o',
  'os',
  'e',
  'ou',
  'de',
  'da',
  'das',
  'do',
  'dos',
  'em',
  'na',
  'nas',
  'no',
  'nos',
  'com',
  'por',
  'para',
  'sem',
  'sob',
  'sobre',
  'um',
  'uma',
  'uns',
  'umas',
  'ao',
  'aos',
  'à',
  'às',
  'pelo',
  'pela',
  'pelos',
  'pelas',
  'num',
  'numa',
]);

const ROMAN_NUMERAL_REGEX = /^(?=[MDCLXVI]+$)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;

function capitalizeWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1).toLocaleLowerCase('pt-BR');
}

/**
 * Padroniza títulos de livros em Title Case editorial (PT-BR),
 * corrigindo títulos em CAIXA ALTA ou sem capitalização vindos de provedores externos.
 */
export function formatBookTitle(rawTitle: string): string {
  const collapsed = rawTitle.trim().replace(/\s+/g, ' ');
  if (!collapsed) return '';

  const tokens = collapsed.split(' ');

  return tokens
    .map((token, index) => {
      const match = token.match(/^([^A-Za-zÀ-ÖØ-öø-ÿ0-9]*)([A-Za-zÀ-ÖØ-öø-ÿ0-9-]+)([^A-Za-zÀ-ÖØ-öø-ÿ0-9]*)$/);
      if (!match) return token;

      const prefix = match[1] ?? '';
      const core = match[2] ?? '';
      const suffix = match[3] ?? '';
      if (!core) return token;

      const lowerCore = core.toLocaleLowerCase('pt-BR');
      const prevToken = index > 0 ? (tokens[index - 1] ?? '') : '';
      const isAfterColonOrDash = /[:\-–—]$/.test(prevToken);
      const isFirstOrLast = index === 0 || index === tokens.length - 1;

      if (core.length > 1 && ROMAN_NUMERAL_REGEX.test(core)) {
        return `${prefix}${core.toUpperCase()}${suffix}`;
      }

      if (!isFirstOrLast && !isAfterColonOrDash && LOWERCASE_WORDS.has(lowerCore)) {
        return `${prefix}${lowerCore}${suffix}`;
      }

      const formattedCore = core
        .split('-')
        .map((part, partIdx) => {
          const lowerPart = part.toLocaleLowerCase('pt-BR');
          if (partIdx > 0 && LOWERCASE_WORDS.has(lowerPart)) {
            return lowerPart;
          }
          return capitalizeWord(part);
        })
        .join('-');

      return `${prefix}${formattedCore}${suffix}`;
    })
    .join(' ');
}
