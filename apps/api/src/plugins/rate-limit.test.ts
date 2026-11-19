import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import Fastify from 'fastify';
import { registerRateLimit } from './rate-limit.js';

describe('registerRateLimit', () => {
  it('aplica limite apenas nas rotas configuradas e retorna 429 ao exceder', async () => {
    const app = Fastify();
    await registerRateLimit(app);

    app.get('/public', async () => ({ ok: true }));
    app.get(
      '/limited',
      {
        config: {
          rateLimit: {
            max: 2,
            timeWindow: '1 minute',
          },
        },
      },
      async () => ({ ok: true }),
    );

    const first = await app.inject({ method: 'GET', url: '/limited' });
    assert.equal(first.statusCode, 200);
    assert.equal(first.headers['x-ratelimit-limit'], '2');
    assert.equal(first.headers['x-ratelimit-remaining'], '1');

    const second = await app.inject({ method: 'GET', url: '/limited' });
    assert.equal(second.statusCode, 200);
    assert.equal(second.headers['x-ratelimit-remaining'], '0');

    const blocked = await app.inject({ method: 'GET', url: '/limited' });
    assert.equal(blocked.statusCode, 429);
    const body = blocked.json() as { statusCode: number; code: string; message: string };
    assert.equal(body.statusCode, 429);
    assert.equal(body.code, 'RATE_LIMIT_EXCEEDED');
    assert.match(body.message, /Muitas requisições em sequência/);

    const publicRes = await app.inject({ method: 'GET', url: '/public' });
    assert.equal(publicRes.statusCode, 200);

    await app.close();
  });
});
