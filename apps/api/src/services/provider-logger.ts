export type ExternalProviderName = 'google-books' | 'brasil-api' | 'open-library';

export interface ProviderFailureLog {
  provider: ExternalProviderName;
  operation: string;
  durationMs: number;
  statusCode?: number;
  errorName?: string;
  reason: string;
}

/**
 * Emite log JSON estruturado para falhas/timeouts de provedores externos,
 * omitindo chaves de API ou payloads sensíveis.
 */
export function logProviderFailure(entry: ProviderFailureLog): void {
  if (process.env.NODE_ENV === 'test' || process.env.LOG_LEVEL === 'silent') {
    return;
  }

  console.warn(
    JSON.stringify({
      level: 'warn',
      event: 'external_provider_failure',
      timestamp: new Date().toISOString(),
      ...entry,
    }),
  );
}
