import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';

describe('API HTTP integration (buildApp)', () => {
  let app: FastifyInstance;

  before(async () => {
    process.env.NODE_ENV ??= 'test';
    process.env.LOG_LEVEL = 'silent';
    process.env.MONGODB_URI ??= 'mongodb://localhost:27017/veritas-libris-test';
    process.env.FIREBASE_PROJECT_ID ??= 'test-project';
    process.env.FIREBASE_CLIENT_EMAIL ??= 'test@example.com';
    process.env.FIREBASE_PRIVATE_KEY ??= 'dummy-test-private-key';
    process.env.IMPORT_REQUIRES_AUTH = 'true';
    process.env.REVIEW_REQUIRES_AUTH = 'true';

    const { buildApp } = await import('./app.js');
    app = buildApp();
    await app.ready();
  });

  after(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /health retorna 503 degraded quando MongoDB não está conectado e envia headers de segurança', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    assert.equal(res.statusCode, 503);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-frame-options'], 'DENY');
    assert.equal(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
    assert.equal(res.headers['cross-origin-resource-policy'], 'cross-origin');

    const body = res.json() as { status: string; database: string; uptimeSeconds: number };
    assert.equal(body.status, 'degraded');
    assert.equal(body.database, 'disconnected');
    assert.equal(typeof body.uptimeSeconds, 'number');
  });

  it('valida payload com Zod e retorna 400 VALIDATION_ERROR formatado em POST /api/v1/suggestions', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/suggestions',
      payload: {
        type: 'BOOK',
        title: 'A',
        message: 'curta',
      },
    });

    assert.equal(res.statusCode, 400);
    const body = res.json() as {
      statusCode: number;
      code: string;
      details?: Array<{ path: string; message: string }>;
    };
    assert.equal(body.statusCode, 400);
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(body.details) && body.details.length > 0);
  });

  it('valida querystring com Zod em GET /api/v1/books', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/books?page=0' });
    assert.equal(res.statusCode, 400);
    const body = res.json() as { code: string };
    assert.equal(body.code, 'VALIDATION_ERROR');
  });

  it('bloqueia acesso sem token Bearer (401) em todas as rotas autenticadas', async () => {
    const protectedEndpoints: Array<{ method: 'GET' | 'POST' | 'PATCH' | 'DELETE'; url: string; payload?: unknown }> = [
      { method: 'GET', url: '/api/v1/auth/me' },
      { method: 'GET', url: '/api/v1/notifications' },
      { method: 'DELETE', url: '/api/v1/notifications/read' },
      { method: 'GET', url: '/api/v1/reading-list' },
      { method: 'GET', url: '/api/v1/reviews/me' },
      { method: 'GET', url: '/api/v1/curation/books' },
      { method: 'GET', url: '/api/v1/suggestions' },
      {
        method: 'PATCH',
        url: '/api/v1/suggestions/507f1f77bcf86cd799439011',
        payload: { status: 'ACCEPTED' },
      },
      { method: 'DELETE', url: '/api/v1/reviews/507f1f77bcf86cd799439011' },
      { method: 'GET', url: '/api/v1/admin/users' },
      { method: 'POST', url: '/api/v1/books/import', payload: { isbn13: '9788535902778' } },
    ];

    for (const endpoint of protectedEndpoints) {
      const res = await app.inject({
        method: endpoint.method,
        url: endpoint.url,
        payload: endpoint.payload as Record<string, unknown> | undefined,
      });
      assert.equal(
        res.statusCode,
        401,
        `Esperava 401 em ${endpoint.method} ${endpoint.url}, recebeu ${res.statusCode}`,
      );
      const body = res.json() as { code: string };
      assert.equal(body.code, 'UNAUTHORIZED');
    }
  });

  it('aplica rate limit (429) após exceder o limite em POST /api/v1/suggestions', async () => {
    const remoteAddress = '203.0.113.55';
    for (let i = 0; i < 10; i += 1) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/suggestions',
        remoteAddress,
        payload: { type: 'BOOK', title: 'X', message: 'curta' },
      });
      assert.equal(res.statusCode, 400);
    }

    const throttled = await app.inject({
      method: 'POST',
      url: '/api/v1/suggestions',
      remoteAddress,
      payload: { type: 'BOOK', title: 'X', message: 'curta' },
    });
    assert.equal(throttled.statusCode, 429);
    const body = throttled.json() as { code: string };
    assert.equal(body.code, 'RATE_LIMIT_EXCEEDED');
  });
});
