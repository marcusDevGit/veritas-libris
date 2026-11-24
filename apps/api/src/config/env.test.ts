import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { escapeRegex } from '../utils/regex.js';

const baseEnv: NodeJS.ProcessEnv = {
  NODE_ENV: 'production',
  MONGODB_URI: 'mongodb://localhost:27017/veritas-libris',
  FIREBASE_PROJECT_ID: 'veritas-prod',
  FIREBASE_CLIENT_EMAIL: 'firebase@example.com',
  FIREBASE_PRIVATE_KEY: 'private-key',
  IMPORT_REQUIRES_AUTH: 'true',
  REVIEW_REQUIRES_AUTH: 'true',
};

describe('env validation (production hardening)', () => {
  it('bloqueia boot em production quando CORS_ORIGIN está ausente', async () => {
    process.env.NODE_ENV ??= 'test';
    process.env.MONGODB_URI ??= 'mongodb://localhost:27017/veritas-libris-test';
    process.env.FIREBASE_PROJECT_ID ??= 'test-project';
    process.env.FIREBASE_CLIENT_EMAIL ??= 'test@example.com';
    process.env.FIREBASE_PRIVATE_KEY ??= 'dummy-test-private-key';

    const { loadEnv } = await import('./env.js');

    assert.throws(
      () => loadEnv({ ...baseEnv }),
      /CORS_ORIGIN deve ser configurado em produção/,
    );
  });

  it('aceita production quando CORS_ORIGIN está configurado', async () => {
    process.env.NODE_ENV ??= 'test';
    process.env.MONGODB_URI ??= 'mongodb://localhost:27017/veritas-libris-test';
    process.env.FIREBASE_PROJECT_ID ??= 'test-project';
    process.env.FIREBASE_CLIENT_EMAIL ??= 'test@example.com';
    process.env.FIREBASE_PRIVATE_KEY ??= 'dummy-test-private-key';

    const { loadEnv } = await import('./env.js');
    const parsed = loadEnv({
      ...baseEnv,
      CORS_ORIGIN: 'https://veritaslibris.pages.dev/',
    });

    assert.deepEqual(parsed.CORS_ORIGIN, ['https://veritaslibris.pages.dev']);
  });
});

describe('escapeRegex', () => {
  it('escapa metacaracteres e limita o tamanho máximo da entrada (anti-ReDoS)', () => {
    const longInput = 'a+'.repeat(100);
    const escaped = escapeRegex(longInput, 10);
    assert.equal(escaped, 'a\\+a\\+a\\+a\\+a\\+');
  });
});
