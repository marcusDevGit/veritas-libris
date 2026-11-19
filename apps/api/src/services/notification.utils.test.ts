import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildNotificationPayloads } from './notification.utils.js';

describe('notification.utils', () => {
  it('buildNotificationPayloads exclui o próprio autor da ação e remove duplicatas', () => {
    const built = buildNotificationPayloads({
      bookTitle: 'Dom Casmurro',
      type: 'NEW_REVIEW',
      actorUid: 'user-1',
      actorName: 'Marcus',
      recipientUserIds: ['user-1', 'user-2', 'user-3', 'user-2'],
    });

    assert.equal(built.length, 2);
    assert.deepEqual(
      built.map((n) => n.userId),
      ['user-2', 'user-3'],
    );
    assert.match(built[0]!.title, /Dom Casmurro/);
    assert.match(built[0]!.description, /Marcus/);
  });

  it('buildNotificationPayloads gera mensagem apropriada para EDITORIAL_UPDATE', () => {
    const built = buildNotificationPayloads({
      bookTitle: 'Crime e Castigo',
      type: 'EDITORIAL_UPDATE',
      actorUid: 'curator-1',
      actorName: 'Pe. Mateus',
      recipientUserIds: ['user-2'],
      summaryDetail: 'WITH_RESERVATIONS • 16+',
    });

    assert.equal(built.length, 1);
    assert.match(built[0]!.description, /WITH_RESERVATIONS • 16\+/);
  });
});
