import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { MongoMemoryServer } from 'mongodb-memory-server';
import {
  clearMongoDatabase,
  startInMemoryMongo,
  stopInMemoryMongo,
} from '../test/mongo-memory.js';

describe('Services integration (MongoDB em memória)', () => {
  let mongod: MongoMemoryServer;
  let BookModel: typeof import('../models/Book.model.js').BookModel;
  let ReviewModel: typeof import('../models/Review.model.js').ReviewModel;
  let AuditLogModel: typeof import('../models/AuditLog.model.js').AuditLogModel;
  let UserModel: typeof import('../models/User.model.js').UserModel;
  let env: typeof import('../config/env.js').env;
  let updateBookEditorial: typeof import('./curation.service.js').updateBookEditorial;
  let upsertReview: typeof import('./review.service.js').upsertReview;
  let voteReviewHelpful: typeof import('./review.service.js').voteReviewHelpful;
  let generateEditorialAiDraft: typeof import('./magisterium.service.js').generateEditorialAiDraft;
  let syncUserFromAuth: typeof import('./user.service.js').syncUserFromAuth;
  let updateUserRole: typeof import('./user.service.js').updateUserRole;
  const originalFetch = globalThis.fetch;

  before(async () => {
    mongod = await startInMemoryMongo();
    ({ BookModel } = await import('../models/Book.model.js'));
    ({ ReviewModel } = await import('../models/Review.model.js'));
    ({ AuditLogModel } = await import('../models/AuditLog.model.js'));
    ({ UserModel } = await import('../models/User.model.js'));
    ({ env } = await import('../config/env.js'));
    ({ updateBookEditorial } = await import('./curation.service.js'));
    ({ upsertReview, voteReviewHelpful } = await import('./review.service.js'));
    ({ generateEditorialAiDraft } = await import('./magisterium.service.js'));
    ({ syncUserFromAuth, updateUserRole } = await import('./user.service.js'));
  });

  beforeEach(async () => {
    await clearMongoDatabase();
    globalThis.fetch = originalFetch;
    env.MAGISTERIUM_API_KEY = undefined;
  });

  after(async () => {
    globalThis.fetch = originalFetch;
    await stopInMemoryMongo(mongod);
  });

  describe('curation.service', () => {
    it('persiste tags/ressalvas oficiais com editorialLock=true, grava AuditLog e restaura consenso ao desativar', async () => {
      const altBook = await BookModel.create({
        isbn13: '9788535902778',
        title: 'Obra Alternativa',
        authors: ['Autor Exemplo'],
      });
      const book = await BookModel.create({
        isbn13: '9786555520545',
        title: 'Crime e Castigo',
        authors: ['Fiódor Dostoiévski'],
      });

      await ReviewModel.create({
        bookId: book._id,
        userId: 'reader-1',
        userName: 'Leitor Teste',
        isCurator: false,
        adequacyVote: 'NOT_RECOMMENDED',
        ageVote: '18+',
        suggestedTags: ['Niilismo'],
        reservations: [
          {
            topic: 'MORAL_RELATIVISM',
            severity: 'HIGH',
            description: 'Ressalva comunitária que deve retornar se a trava for desativada.',
          },
        ],
        comment: 'Parecer comunitário de teste com mais de vinte caracteres.',
      });

      const lockedDto = await updateBookEditorial(
        book._id.toString(),
        {
          editorialLock: true,
          adequacyStatus: 'WITH_RESERVATIONS',
          recommendedAge: '16+',
          hasImprimatur: false,
          editorialSummary: 'Parecer oficial da curadoria.',
          tags: ['  Literatura Universal ', 'literatura universal', 'Redenção & Graça'],
          reservations: [
            {
              topic: 'VIOLENCE_GORE',
              severity: 'MEDIUM',
              description: 'Cenas de violência dramática no enredo.',
              reference: 'Parte I, Cap. VII',
            },
          ],
          alternatives: [altBook._id.toString()],
        },
        { uid: 'cur-1', name: 'Curador Chefe', email: 'curador@veritas.org' },
      );

      assert.equal(lockedDto.editorialLock, true);
      assert.equal(lockedDto.adequacyStatus, 'WITH_RESERVATIONS');
      assert.equal(lockedDto.recommendedAge, '16+');
      assert.deepEqual(lockedDto.tags, ['Literatura Universal', 'Redenção & Graça']);
      assert.equal(lockedDto.reservations.length, 1);
      assert.equal(lockedDto.reservations[0]?.topic, 'VIOLENCE_GORE');
      assert.deepEqual(lockedDto.alternatives, [altBook._id.toString()]);

      const unlockedDto = await updateBookEditorial(
        book._id.toString(),
        {
          editorialLock: false,
          adequacyStatus: 'WITH_RESERVATIONS',
          recommendedAge: '16+',
          hasImprimatur: false,
          alternatives: [],
        },
        { uid: 'cur-1', name: 'Curador Chefe', email: 'curador@veritas.org' },
      );

      assert.equal(unlockedDto.editorialLock, false);
      assert.equal(unlockedDto.adequacyStatus, 'NOT_RECOMMENDED');
      assert.equal(unlockedDto.recommendedAge, '18+');
      assert.deepEqual(unlockedDto.tags, ['niilismo']);
      assert.equal(unlockedDto.reservations[0]?.topic, 'MORAL_RELATIVISM');

      const logs = await AuditLogModel.find({ action: 'EDITORIAL_LOCK_UPDATED' }).lean();
      assert.equal(logs.length, 2);
    });

    it('rejeita com 400 INVALID_ALTERNATIVE_BOOK quando obra alternativa não existe', async () => {
      const book = await BookModel.create({
        isbn13: '9786555520545',
        title: 'Crime e Castigo',
        authors: ['Fiódor Dostoiévski'],
      });

      await assert.rejects(
        () =>
          updateBookEditorial(
            book._id.toString(),
            {
              editorialLock: true,
              adequacyStatus: 'RECOMMENDED',
              recommendedAge: '14+',
              hasImprimatur: false,
              alternatives: ['507f1f77bcf86cd799439011'],
            },
            { uid: 'cur-1', name: 'Curador', email: 'curador@veritas.org' },
          ),
        (err: unknown) =>
          typeof err === 'object' &&
          err !== null &&
          'statusCode' in err &&
          err.statusCode === 400 &&
          'code' in err &&
          err.code === 'INVALID_ALTERNATIVE_BOOK',
      );
    });
  });

  describe('review.service', () => {
    it('aplica peso 3x para curador vs 1x para leitor e respeita editorialLock', async () => {
      const book = await BookModel.create({
        isbn13: '9788535902778',
        title: 'Dom Casmurro',
        authors: ['Machado de Assis'],
      });

      await upsertReview({
        bookId: book._id.toString(),
        userId: 'reader-1',
        userName: 'Leitor Comum',
        isCurator: false,
        data: {
          adequacyVote: 'WITH_RESERVATIONS',
          ageVote: '16+',
          suggestedTags: ['Clássico'],
          reservations: [
            {
              topic: 'MORAL_RELATIVISM',
              severity: 'LOW',
              description: 'Ambiguidade moral que exige leitura atenta.',
            },
          ],
          comment: 'Parecer de leitor comum com mais de vinte caracteres.',
        },
      });

      await upsertReview({
        bookId: book._id.toString(),
        userId: 'curator-1',
        userName: 'Curador Oficial',
        isCurator: true,
        data: {
          adequacyVote: 'RECOMMENDED',
          ageVote: '14+',
          suggestedTags: ['Literatura Brasileira'],
          reservations: [],
          comment: 'Parecer de curador oficial com peso 3x sobre a obra.',
        },
      });

      const afterUnlocked = await BookModel.findById(book._id).lean();
      assert.ok(afterUnlocked);
      assert.equal(afterUnlocked.communityStats.totalReviews, 2);
      assert.equal(afterUnlocked.adequacyStatus, 'RECOMMENDED');
      assert.equal(afterUnlocked.recommendedAge, '14+');

      await BookModel.findByIdAndUpdate(book._id, {
        $set: { editorialLock: true, adequacyStatus: 'NOT_RECOMMENDED', recommendedAge: '18+' },
      });

      await upsertReview({
        bookId: book._id.toString(),
        userId: 'reader-2',
        userName: 'Outro Leitor',
        isCurator: false,
        data: {
          adequacyVote: 'RECOMMENDED',
          ageVote: 'ALL',
          suggestedTags: [],
          reservations: [],
          comment: 'Novo voto de leitor após a trava editorial ativa.',
        },
      });

      const afterLocked = await BookModel.findById(book._id).lean();
      assert.ok(afterLocked);
      assert.equal(afterLocked.communityStats.totalReviews, 3);
      assert.equal(afterLocked.adequacyStatus, 'NOT_RECOMMENDED');
      assert.equal(afterLocked.recommendedAge, '18+');
    });

    it('alterna voto útil sem permitir duplicidade pelo mesmo usuário', async () => {
      const book = await BookModel.create({
        isbn13: '9788535902778',
        title: 'Dom Casmurro',
        authors: ['Machado de Assis'],
      });

      const review = await upsertReview({
        bookId: book._id.toString(),
        userId: 'author-1',
        userName: 'Autor do Parecer',
        isCurator: false,
        data: {
          adequacyVote: 'RECOMMENDED',
          ageVote: '14+',
          suggestedTags: [],
          reservations: [],
          comment: 'Excelente obra para estudo literário e moral.',
        },
      });

      const firstVote = await voteReviewHelpful(review._id, 'voter-1');
      assert.equal(firstVote.voted, true);
      assert.equal(firstVote.helpfulVotes, 1);

      const secondVote = await voteReviewHelpful(review._id, 'voter-1');
      assert.equal(secondVote.voted, false);
      assert.equal(secondVote.helpfulVotes, 0);
    });
  });

  describe('magisterium.service', () => {
    it('retorna 503 MAGISTERIUM_NOT_CONFIGURED quando chave está ausente e não há cache', async () => {
      const book = await BookModel.create({
        isbn13: '9788535902778',
        title: 'Dom Casmurro',
        authors: ['Machado de Assis'],
      });

      await assert.rejects(
        () => generateEditorialAiDraft(book._id.toString(), { uid: 'cur-1', name: 'Curador' }),
        (err: unknown) =>
          typeof err === 'object' &&
          err !== null &&
          'statusCode' in err &&
          err.statusCode === 503 &&
          'code' in err &&
          err.code === 'MAGISTERIUM_NOT_CONFIGURED',
      );
    });

    it('gera rascunho via API, grava AuditLog e reaproveita cache na segunda chamada', async () => {
      env.MAGISTERIUM_API_KEY = 'test-key';
      let fetchCalls = 0;

      globalThis.fetch = (async () => {
        fetchCalls += 1;
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: [
                    'VEREDITO: WITH_RESERVATIONS',
                    'IDADE: 14+',
                    'JUSTIFICATIVA: Obra pede discernimento sobre ciúme.',
                    'SÍNTESE: Clássico literário para leitores maduros.',
                  ].join('\n'),
                },
              },
            ],
            citations: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }) as typeof fetch;

      const book = await BookModel.create({
        isbn13: '9788535902778',
        title: 'Dom Casmurro',
        authors: ['Machado de Assis'],
        synopsis: 'Narrativa sobre memória e ciúme no Rio de Janeiro.',
      });

      const first = await generateEditorialAiDraft(book._id.toString(), {
        uid: 'cur-1',
        name: 'Curador',
      });
      assert.equal(first.cached, false);
      assert.equal(first.suggestedAdequacy, 'WITH_RESERVATIONS');
      assert.equal(first.suggestedAge, '14+');
      assert.equal(fetchCalls, 1);

      const second = await generateEditorialAiDraft(book._id.toString(), {
        uid: 'cur-1',
        name: 'Curador',
      });
      assert.equal(second.cached, true);
      assert.equal(second.draftText, first.draftText);
      assert.equal(fetchCalls, 1);

      const logs = await AuditLogModel.find({ action: 'AI_DRAFT_GENERATED' }).lean();
      assert.equal(logs.length, 1);
    });
  });

  describe('user.service', () => {
    it('vincula usuário convidado (pending:<email>) ao UID real no primeiro login', async () => {
      await UserModel.create({
        uid: 'pending:convidado@veritas.org',
        email: 'convidado@veritas.org',
        name: 'Convidado',
        role: 'CURATOR',
      });

      const synced = await syncUserFromAuth({
        uid: 'firebase-uid-123',
        email: 'convidado@veritas.org',
        name: 'Convidado Real',
      });

      assert.equal(synced.uid, 'firebase-uid-123');
      assert.equal(synced.role, 'CURATOR');
      const pendingStillExists = await UserModel.findOne({ uid: 'pending:convidado@veritas.org' }).lean();
      assert.equal(pendingStillExists, null);
    });

    it('bloqueia rebaixamento do último ADMIN ativo e permite quando há outro ADMIN', async () => {
      await UserModel.create({
        uid: 'admin-1',
        email: 'admin1@veritas.org',
        name: 'Admin Um',
        role: 'ADMIN',
      });

      await assert.rejects(
        () =>
          updateUserRole({
            targetUid: 'admin-1',
            nextRole: 'CURATOR',
            actor: { uid: 'super-actor', name: 'Outro', email: 'outro@veritas.org' },
          }),
        (err: unknown) =>
          typeof err === 'object' &&
          err !== null &&
          'statusCode' in err &&
          err.statusCode === 400 &&
          'code' in err &&
          err.code === 'LAST_ADMIN_PROTECTED',
      );

      await UserModel.create({
        uid: 'admin-2',
        email: 'admin2@veritas.org',
        name: 'Admin Dois',
        role: 'ADMIN',
      });

      const demoted = await updateUserRole({
        targetUid: 'admin-1',
        nextRole: 'CURATOR',
        actor: { uid: 'admin-2', name: 'Admin Dois', email: 'admin2@veritas.org' },
      });

      assert.equal(demoted.role, 'CURATOR');
      const logs = await AuditLogModel.find({ action: 'ROLE_UPDATED' }).lean();
      assert.equal(logs.length, 1);
    });
  });
});
