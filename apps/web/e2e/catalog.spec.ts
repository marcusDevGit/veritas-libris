import { expect, test, type Page } from '@playwright/test';

const mockBooks = [
  {
    _id: 'book-1',
    isbn13: '9788535902778',
    title: 'Confissões',
    authors: ['Santo Agostinho'],
    publisher: 'Paulus',
    publishedYear: 397,
    pageCount: 416,
    language: 'pt-BR',
    synopsis: 'Autobiografia espiritual de Santo Agostinho.\n\nObra clássica da patrística cristã.',
    hasImprimatur: true,
    editorialLock: true,
    adequacyStatus: 'RECOMMENDED',
    recommendedAge: '14+',
    tags: ['Patristica', 'Teologia'],
    reservations: [],
    alternatives: [],
    communityStats: {
      totalReviews: 4,
      recommendedCount: 4,
      reservationsCount: 0,
      notRecommendedCount: 0,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: 'book-2',
    isbn13: '9788535902785',
    title: 'Obra Restrita',
    authors: ['Autor Exemplo'],
    language: 'pt-BR',
    synopsis: 'Obra com conteúdo inadequado para menores.',
    hasImprimatur: false,
    editorialLock: false,
    adequacyStatus: 'NOT_RECOMMENDED',
    recommendedAge: '18+',
    tags: ['Contemporaneo'],
    reservations: [
      {
        topic: 'MORAL_RELATIVISM',
        severity: 'HIGH',
        description: 'Relativismo moral explícito.',
      },
    ],
    alternatives: [],
    communityStats: {
      totalReviews: 2,
      recommendedCount: 0,
      reservationsCount: 0,
      notRecommendedCount: 2,
    },
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
];

async function mockApi(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname;

    if (pathname === '/api/v1/books') {
      const familyMode = url.searchParams.get('familyMode') === 'true';
      const tagsParam = url.searchParams.get('tags');
      const requestedTags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];

      const filtered = mockBooks.filter((book) => {
        if (familyMode && (book.recommendedAge === '18+' || book.adequacyStatus === 'NOT_RECOMMENDED')) {
          return false;
        }
        if (requestedTags.length > 0 && !requestedTags.every((t) => book.tags.includes(t))) {
          return false;
        }
        return true;
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: filtered,
          total: filtered.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          stats: {
            totalAll: mockBooks.length,
            reviewed: mockBooks.length,
            recommended: 1,
            withReservations: 0,
            notRecommended: 1,
          },
        }),
      });
      return;
    }

    if (pathname === '/api/v1/books/book-1') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks[0]),
      });
      return;
    }

    if (pathname === '/api/v1/books/book-1/reviews') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              _id: 'rev-1',
              bookId: 'book-1',
              userId: 'curator-1',
              userName: 'Curador Teste',
              userRole: 'CURATOR',
              adequacyVote: 'RECOMMENDED',
              ageVote: '14+',
              suggestedTags: ['Patristica'],
              reservations: [],
              comment: 'Leitura edificante e fundamental para formação cristã.',
              helpfulVotes: 3,
              votedByMe: false,
              createdAt: '2026-01-05T00:00:00.000Z',
              updatedAt: '2026-01-05T00:00:00.000Z',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

test.describe('Fluxos críticos do Catálogo e Ficha (Desktop & Mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test('filtra por tag clicável e alterna Modo Família sem overflow horizontal', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Confissões' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Obra Restrita' })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    await page.getByRole('link', { name: 'Patristica' }).first().click();
    await expect(page).toHaveURL(/tags=Patristica/);
    await expect(page.getByRole('button', { name: /Remover filtro da tag Patristica/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Obra Restrita' })).toHaveCount(0);

    await page.getByRole('button', { name: /Remover filtro da tag Patristica/i }).click();
    await expect(page.getByRole('heading', { name: 'Obra Restrita' })).toBeVisible();

    await page.getByRole('switch').first().click();
    await expect(page).toHaveURL(/familyMode=true/);
    await expect(page.getByRole('heading', { name: 'Obra Restrita' })).toHaveCount(0);
  });

  test('navega para a ficha do livro e abre o modal unificado de autenticação', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Ver Ficha/i }).first().click();
    await expect(page).toHaveURL(/\/livros\/book-1$/);
    await expect(page.getByRole('heading', { name: 'Confissões' })).toBeVisible();
    await expect(page.getByText('Leitura edificante e fundamental para formação cristã.')).toBeVisible();

    const desktopSignIn = page.getByRole('button', { name: 'Entrar' });
    if (await desktopSignIn.isVisible()) {
      await desktopSignIn.click();
    } else {
      await page.getByRole('button', { name: /Abrir menu de navegação/i }).click();
      await page.getByRole('button', { name: 'Entrar' }).click();
    }

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Criar Conta' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Recuperar' })).toBeVisible();
  });
});
