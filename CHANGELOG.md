# Changelog

Todas as mudanças notáveis do projeto **Veritas Libris** estão documentadas neste arquivo.

## [1.6.0] - 2026-11-24
### Added
- **Autenticação com E-mail/Senha e Proteção RBAC (`@app/api` e `@app/web`):**
  - `auth.middleware.ts` exige `email_verified === true` (retornando `403 EMAIL_NOT_VERIFIED` caso contrário) e repassa `emailVerified` para `syncUserFromAuth`.
  - `rbac.utils.ts` e `user.service.ts` restringem promoção via `ADMIN_EMAILS`, `isFounder` e vinculação de convites `pending:<email>` exclusivamente a contas com e-mail verificado.
  - `AuthModal.tsx`, `AuthContext.tsx` e `auth-errors.ts` unificam login com Google, cadastro com nome completo obrigatório + verificação de e-mail, login por e-mail/senha, recuperação de senha (`languageCode = 'pt-BR'`) e mensagens amigáveis em PT-BR.

---

## [1.5.1] - 2026-11-24
### Security & Observability
- **Hardening de Produção (`@app/api` e `@app/web`):**
  - `EnvSchema` agora exige `CORS_ORIGIN` configurado quando `NODE_ENV=production` e `@fastify/cors` adota fallback fail-closed (`false`).
  - Helper único `escapeRegex(value, maxLength = 120)` em `apps/api/src/utils/regex.ts` para prevenir consultas custosas (anti-ReDoS) nos filtros textuais.
  - Cabeçalhos de segurança (`Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`) configurados em `apps/web/public/_headers` para o Cloudflare Pages.
- **Rastreabilidade & Métricas (`@app/api`):**
  - Header `x-request-id` retornado em todas as respostas (exposto via CORS) e campo `requestId` incluído no JSON de erro do `errorHandler`.
  - `logProviderMetric` adicionado em `provider-logger.ts` para registrar latência, sucesso e `cacheHit` da Magisterium AI.

---

## [1.5.0] - 2026-11-24
### Added
- **Notificações de Voto Útil e Promoção (`@app/shared`, `@app/api`, `@app/web`):**
  - Novos tipos `REVIEW_HELPFUL` e `ROLE_UPDATED` em `NotificationDtoSchema` e `NotificationModel`, com `bookId`/`bookTitle` opcionais, campo `link` opcional e `dedupKey` com índice esparso `{ userId: 1, dedupKey: 1 }`.
  - Anti-spam em `voteReviewHelpful`: notifica o autor do parecer apenas uma vez por eleitor (`dedupKey`), ignorando auto-votos.
  - `updateUserRole` notifica promoções para `CURATOR` ou `ADMIN` com link direto para `/curadoria`.
  - `NotificationsPopover` exibe os ícones `ThumbsUp` e `Feather` e suporta navegação por `link` mesmo sem `bookId`.
- **Métricas para Gestão de Curadores (`/admin`):**
  - `UserDtoSchema` e `listUsers` agregam `reviewsCount` e `helpfulVotesReceived` por usuário a partir do `ReviewModel`.
  - `AdminUsersPanel` exibe pareceres e votos úteis recebidos tanto na tabela desktop quanto nos cards mobile.

---

## [1.4.2] - 2026-11-24
### Added
- **Testes de Regras de Negócio com MongoDB em Memória (`@app/api`):** adicionada dependência de desenvolvimento `mongodb-memory-server`, helper `apps/api/src/test/mongo-memory.ts` e suíte `apps/api/src/services/services.integration.test.ts` cobrindo `curation.service`, `review.service`, `magisterium.service` e `user.service` (`60/60` testes passando).

---

## [1.4.1] - 2026-11-24
### Fixed
- **Adequação Mobile (`@app/web`):**
  - Menu de navegação móvel na `Navbar` (`< xl`) e sincronização da busca global (desktop e mobile) com a URL `/?q=...`.
  - Remoção de scroll horizontal em `CatalogFilters` (`grid-cols-2` no `SelectAdequacy` + filtros secundários recolhíveis), `GuidePage` (`grid-cols-2`), `CurationBookQueue`, `BookReviewsSection` e `ReadingListPage`.
  - Ajuste de espaçamento superior (`pt-28`) em todas as páginas para evitar sobreposição pelo header fixo no mobile, incluindo alinhamento de `CriteriaPage` e `AboutCurationPage`.
  - `NotificationsPopover` com posicionamento `fixed inset-x-3` no mobile; `FamilyModeWidget` em largura total; `CurationKpiGrid` compacto no mobile; fluxo mestre-detalhe em `CurationPage`; suporte ao modo `list` no `BookCard`; paginação com janela deslizante em `CatalogPage`; e leitura completa expansível do parecer em `ReadingListCard`.

---

## [1.4.0] - 2026-11-22
### Added
- **Manual Completo da Plataforma (`docs/guia-veritas.md`):** guia oficial cobrindo critérios de discernimento, motor de consenso, papéis (`READER`, `CURATOR`, `ADMIN`), Copiloto IA, sugestões e funcionalidades.
- **Página Interativa `/guia` (`GuidePage.tsx`):** central navegável por abas no `@app/web` (`Critérios & Consenso`, `Papéis & Conduta`, `Sugestões & Indicação`, `Curadoria & Moderação`, `Funcionalidades do App`), com atalhos contextuais no `Footer`, `/curadoria` e `/sugestoes`, inclusão no `sitemap.xml` e teste `GuidePage.test.tsx`.
- **README & Prévia Visual:** `README.md` simplificado e enriquecido com capturas do Stitch em `docs/images/`.

---

## [1.3.2] - 2026-11-20
### Fixed
- **Preservação de parágrafos na sinopse (`stripHtml`):** `google-books.service.ts` passa a preservar quebras de linha (`\n`) em tags de bloco (`<p>`, `<br>`, `<div>`, `<li>`), permitindo que `BookSynopsisAccordion` exiba os parágrafos com espaçamento.
- **Rótulos de ressalvas no catálogo (`BookCard`):** substituído o mapa local desatualizado por `RESERVATION_TOPIC_LABELS` de `@app/shared`, exibindo os tópicos em português em vez de chaves cruas (`DOCTRINAL_ERROR`, `MORAL_RELATIVISM`, `SENSUAL_CONTENT`).

---

## [1.3.1] - 2026-11-20
### Added
- **Padronização de títulos (`formatBookTitle`):** utilitário compartilhado em `@app/shared` com Title Case editorial em PT-BR (preservando preposições/artigos no meio do título e algarismos romanos), aplicado na importação (`book.service.ts`) e na exibição (`BookCard`, `BookVerdictHeroCard`, `CurationBookSummaryHeader`).

### Fixed
- **Migração automática do índice `$text` no boot (`ensureBookTextIndex`):** garante a recriação do índice textual antigo em `books` com `language_override: 'textSearchLanguage'` em ambientes já existentes.
- **Quebra de parágrafos em pareceres:** adicionada `whitespace-pre-line` em `BookReviewsSection` para preservar espaçamento entre parágrafos.
- **Campo opcional de referência nas ressalvas:** `ReviewStepReservations` e `ReviewModal` agora normalizam `reference` vazio para `undefined`, evitando erro Zod (`>=1 characters`) ao deixar o capítulo/trecho em branco.

---

## [1.3.0] - 2026-11-20
### Added
- **Copiloto de Curadoria com Magisterium AI (`/curadoria`):** rota `POST /api/v1/curation/books/:id/ai-draft` protegida por autenticação, papel de curador/admin e rate limit (`5 req/min`), cache determinístico em MongoDB (`EditorialAiDraftModel`), log de auditoria `AI_DRAFT_GENERATED` e componente `CurationAiAssistantBox` com aviso permanente de limites/cota e aplicação apenas manual ao rascunho.
- **Paridade de 4 pontos na Curadoria:** `PATCH /api/v1/books/:id/editorial` e `CurationEditorialEditor` agora permitem editar `tags` e `reservations` oficiais quando `editorialLock` está ativo, mantendo a ficha pública coerente em casos de discordância com a comunidade.

### Fixed
- Definido `language_override: 'textSearchLanguage'` no índice `$text` de `BookModel` para evitar erro `Location17262` ao importar livros com `language: 'pt-BR'`.
- Atualizado o parser de `magisterium.utils.ts` (`PROMPT_VERSION = 'v5'`) para limpar formatações Markdown antes da extração de `VEREDITO`, `IDADE`, `JUSTIFICATIVA` e `SÍNTESE`.
- Ajustado o selo de alerta em `BookVerdictHeroCard` para exibir `Obra Desaconselhada` ou `Contém Pontos de Cautela` em vez de `Sem Heresia Dogmática Formal` quando a obra é `NOT_RECOMMENDED` ou possui ressalvas.

---

## [1.2.0] - 2026-11-19
### Added
- **Painel de Triagem de Sugestões (`/curadoria`):** aba dedicada com filtros por status (`PENDING`, `REVIEWED`, `ACCEPTED`, `DISMISSED`), nota de resolução, endpoint `PATCH /api/v1/suggestions/:id`, auditoria (`SUGGESTION_TRIAGED`) e importação rápida via ISBN-13.
- **Gerenciamento e Moderação de Pareceres:** edição de parecer existente no `ReviewModal`, rota `DELETE /api/v1/reviews/:id` para autor ou moderador (`CURATOR`/`ADMIN`) com recálculo automático de consenso e log `REVIEW_MODERATED`.
- **Perfil do Leitor & Arquivamento de Notificações:** página `/meus-pareceres` (`GET /api/v1/reviews/me`), atalho no `ProfileMenu` e limpeza/arquivamento lógico de avisos (`DELETE /api/v1/notifications/read` e `DELETE /api/v1/notifications/:id`).
- **Suíte de Testes e CI:** configuração de **Vitest + React Testing Library** no `@app/web` (`11` testes em 6 arquivos), suíte de integração HTTP da API (`buildApp().inject()`) e inclusão no `.github/workflows/ci.yml`.
- **Hardening HTTP, SEO e Observabilidade:** plugin nativo de cabeçalhos de segurança (`security-headers.ts`), logs estruturados de falha para provedores externos (`provider-logger.ts`), meta tags Open Graph dinâmicas (`usePageMeta`), `robots.txt` e `sitemap.xml`.
- **Documentação Técnica:** atualização do `README.md` e criação de `docs/api.md`, `docs/architecture.md` e `CHANGELOG.md`.

### Fixed
- Adicionado componente `ScrollToTop` e reset de rolagem nos links do `Footer` para redirecionar automaticamente ao início da página ao navegar entre rotas.
- Preservado o código `RATE_LIMIT_EXCEEDED` em respostas `429` no `errorHandler`.

---

## [1.1.0] - 2026-11-19
### Added
- **Notificações reais no sininho:** modelo `NotificationModel`, rotas `/api/v1/notifications*`, disparo automático para usuários com a obra salva em `Minha Lista` (`NEW_REVIEW` e `EDITORIAL_UPDATE`) e integração de `NotificationsPopover` com TanStack Query.
- **Páginas institucionais e sugestões:** novas rotas `/criterios`, `/sobre` e `/sugestoes`, modelo `SuggestionModel` e endpoints `POST/GET /api/v1/suggestions`.
- **Menu de perfil e busca expansível:** componente `ProfileMenu` com logout no dropdown do avatar, campo de busca expansível na `Navbar` e exibição condicional da aba `Minha Lista` para usuários autenticados.

### Fixed
- Proteção contra rebaixamento do último administrador ativo (`canDemoteAdmin`), preservação do e-mail administrativo via `ADMIN_EMAILS` e adição de `prompt: 'select_account'` no login Google.
- Alinhamento visual e textual de `/criterios`, `/sobre` e `/sugestoes` com os layouts definidos no Stitch e limpeza do rodapé (`Footer`).

---

## [1.0.1] - 2026-11-19
### Added
- **RBAC e Área Administrativa (`/admin`):** papéis `READER`, `CURATOR` e `ADMIN`, gestão de usuários, convites e logs de auditoria (`AuditLogModel`).
- **Painel de Curadoria Oficial (`/curadoria`):** fila editorial, trava manual de veredito (`editorialLock`), nota oficial e recomendação de alternativas.
- **Lista de Leitura (`/minha-lista`):** persistência pessoal de obras salvas (`/api/v1/reading-list*`) e estatísticas.
- **Filtros server-side:** Modo Família, ordenação, filtro por selo (`imprimatur`, `classico-cristao`) e contadores reais do catálogo.
- **CI e Otimização:** workflow do GitHub Actions (`.github/workflows/ci.yml`), `@fastify/rate-limit` nas rotas sensíveis, code splitting por rota e `manualChunks` no Vite.

---

## [1.0.0] - 2026-11-19
### Added
- Estrutura inicial do monorepo (`@app/shared`, `@app/api`, `@app/web`).
- Catálogo literário, importação idempotente por ISBN-13 com multi-provedor (Google Books, BrasilAPI ISBN e Open Library) e priorização de sinopse em PT-BR.
- Motor de consenso moral e pedagógico com ponderação para curadores e princípio de prudência.
- Interface React com autenticação Firebase, scanner de código de barras ISBN e layout responsivo mobile.
