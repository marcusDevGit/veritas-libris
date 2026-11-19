import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapBrasilApiVolume,
  mapOpenLibraryVolume,
  mergeBookMetadata,
} from './external-books-providers.service.js';

describe('external-books-providers', () => {
  it('mapeia resposta válida da BrasilAPI ISBN preservando PT-BR', () => {
    const raw = {
      isbn: '9788535914849',
      title: 'Crime e Castigo',
      authors: ['Fiódor Dostoiévski'],
      publisher: 'Editora 34',
      synopsis: 'Romance clássico russo sobre culpa e redenção.',
      year: 2021,
      page_count: 592,
      cover_url: 'https://exemplo.com/capa.jpg',
    };

    const result = mapBrasilApiVolume(raw, '9788535914849');
    assert.ok(result);
    assert.equal(result.title, 'Crime e Castigo');
    assert.equal(result.publisher, 'Editora 34');
    assert.equal(result.pageCount, 592);
    assert.equal(result.publishedYear, 2021);
    assert.equal(result.language, 'pt-BR');
  });

  it('mapeia resposta válida da Open Library extraindo ano e páginas', () => {
    const raw = {
      'ISBN:9780140449136': {
        title: 'Crime and Punishment',
        authors: [{ name: 'Fyodor Dostoevsky' }],
        publishers: [{ name: 'Penguin Classics' }],
        number_of_pages: 656,
        publish_date: 'January 30, 2003',
        cover: { large: 'https://covers.openlibrary.org/b/id/123-L.jpg' },
      },
    };

    const result = mapOpenLibraryVolume(raw, '9780140449136');
    assert.ok(result);
    assert.equal(result.publisher, 'Penguin Classics');
    assert.equal(result.pageCount, 656);
    assert.equal(result.publishedYear, 2003);
    assert.equal(result.coverUrl, 'https://covers.openlibrary.org/b/id/123-L.jpg');
  });

  it('mescla metadados preenchendo campos faltantes e priorizando sinopse em PT-BR', () => {
    const googlePrimary = {
      isbn13: '9788535914849',
      title: 'Dom Casmurro',
      authors: ['Machado de Assis'],
      synopsis: 'English synopsis here.',
      language: 'en',
    };

    const brasilSecondary = {
      isbn13: '9788535914849',
      publisher: 'Editora Ática',
      pageCount: 256,
      synopsis: 'Sinopse original em português brasileiro.',
      language: 'pt-BR',
    };

    const merged = mergeBookMetadata(googlePrimary, brasilSecondary);
    assert.ok(merged);
    assert.equal(merged.publisher, 'Editora Ática');
    assert.equal(merged.pageCount, 256);
    assert.equal(merged.synopsis, 'Sinopse original em português brasileiro.');
    assert.equal(merged.language, 'pt-BR');
  });
});
