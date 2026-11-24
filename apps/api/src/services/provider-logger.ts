export type ExternalProviderName =
  | 'google-books'
  | 'brasil-api'
  | 'open-library'
  | 'magisterium-ai';

export interface ProviderFailureLog {
  provider: ExternalProviderName;
  operation: string;
  durationMs: number;
  statusCode?: number;
  errorName?: string;
  reason: string;
}

export interface ProviderMetricLog {
  provider: ExternalProviderName;
  operation: string;
  durationMs: number;
  success: boolean;
  cacheHit?: boolean;
}

function isLoggingSilenced(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.LOG_LEVEL === 'silent';
}

/**
 * Emite log JSON estruturado para falhas/timeouts de provedores externos,
 * omitindo chaves de API ou payloads sensíveis.
 */
export function logProviderFailure(entry: ProviderFailureLog): void {
  if (isLoggingSilenced()) {
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

/**
 * Emite log JSON estruturado com latência, sucesso e acerto de cache de provedores externos.
 */
export function logProviderMetric(entry: ProviderMetricLog): void {
  if (isLoggingSilenced()) {
    return;
  }

  console.info(
    JSON.stringify({
      level: 'info',
      event: 'external_provider_metric',
      timestamp: new Date().toISOString(),
      ...entry,
    }),
  );
}
