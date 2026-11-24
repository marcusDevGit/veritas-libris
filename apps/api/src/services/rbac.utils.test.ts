import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canDemoteAdmin,
  isAdminRole,
  isCuratorRole,
  resolveEffectiveRole,
} from './rbac.utils.js';

describe('rbac.utils', () => {
  it('ADMIN herda automaticamente permissões de CURATOR', () => {
    assert.equal(isCuratorRole('READER'), false);
    assert.equal(isCuratorRole('CURATOR'), true);
    assert.equal(isCuratorRole('ADMIN'), true);

    assert.equal(isAdminRole('READER'), false);
    assert.equal(isAdminRole('CURATOR'), false);
    assert.equal(isAdminRole('ADMIN'), true);
  });

  it('resolveEffectiveRole promove e-mails listados em ADMIN_EMAILS apenas quando emailVerified é true', () => {
    const unverifiedRole = resolveEffectiveRole({
      email: 'Admin@Veritas.org',
      emailVerified: false,
      adminEmails: ['admin@veritas.org'],
      storedRole: 'READER',
    });
    assert.equal(unverifiedRole, 'READER');

    const verifiedRole = resolveEffectiveRole({
      email: 'Admin@Veritas.org',
      emailVerified: true,
      adminEmails: ['admin@veritas.org'],
      storedRole: 'READER',
    });
    assert.equal(verifiedRole, 'ADMIN');
  });

  it('resolveEffectiveRole prioriza storedRole sobre custom claims quando não é bootstrap admin', () => {
    const role = resolveEffectiveRole({
      email: 'leitor@veritas.org',
      adminEmails: ['admin@veritas.org'],
      storedRole: 'CURATOR',
      claimAdmin: false,
      claimCurator: false,
    });
    assert.equal(role, 'CURATOR');
  });

  it('canDemoteAdmin bloqueia rebaixamento do último ADMIN e permite quando há outros', () => {
    assert.equal(canDemoteAdmin('ADMIN', 'CURATOR', 1), false);
    assert.equal(canDemoteAdmin('ADMIN', 'READER', 1), false);
    assert.equal(canDemoteAdmin('ADMIN', 'CURATOR', 2), true);
    assert.equal(canDemoteAdmin('CURATOR', 'READER', 1), true);
  });
});
