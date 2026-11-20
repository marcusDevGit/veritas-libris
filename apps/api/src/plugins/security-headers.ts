import type { FastifyInstance } from 'fastify';

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'off',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Resource-Policy': 'cross-origin',
} as const;

/**
 * Aplica cabeçalhos HTTP de segurança compatíveis com API JSON e CORS cross-origin
 * (ex.: Cloudflare Pages consumindo a API no Railway) sem dependências extras.
 */
export function registerSecurityHeaders(app: FastifyInstance): void {
  app.addHook('onSend', async (_request, reply, payload) => {
    for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
      if (!reply.hasHeader(header)) {
        reply.header(header, value);
      }
    }
    return payload;
  });
}
