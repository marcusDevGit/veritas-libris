# Arquitetura do Sistema — Veritas Libris

Este documento descreve a organização interna do monorepo, o fluxo de dados e as principais decisões arquiteturais adotadas até a versão **v1.1.0**.

---

## 1. Estrutura do Monorepo (`npm workspaces`)

```text
packages/shared   ──▶ Contratos Zod, tipos TypeScript, constantes doutrinárias e utilitários de ISBN
       ▲
       ├─────────▶ apps/api   (Fastify 5 + Mongoose/MongoDB + Firebase Admin SDK)
       └─────────▶ apps/web   (React 19 + Vite 8 + TanStack Query + Tailwind CSS v4)
```

### `@app/shared` (`packages/shared`)
Funciona como **Single Source of Truth (SSOT)** para contratos entre frontend e backend:
- Schemas em `packages/shared/src/schemas/`: `book`, `catalog`, `curation`, `notification`, `reading-list`, `review`, `suggestion`, `user`.
- Utilitários compartilhados de validação e normalização de ISBN-10 / ISBN-13 (`isValidIsbn13`, `isValidIsbn10`, `isbn10ToIsbn13`, `normalizeIsbn`).
- Deve ser compilado (`npm run build --workspace=@app/shared`) sempre que seus contratos forem alterados, antes do build de produção da API ou Web.

---

## 2. Backend (`apps/api`)

### Separação em Camadas
- **`config/`**: validação de variáveis de ambiente na inicialização (`env.ts` com Zod), conexão MongoDB (`database.ts`) e inicialização Firebase Admin (`firebase.ts`).
- **`middlewares/`**: `auth.middleware.ts` (`requireAuth`, `requireCurator`, `requireAdmin`) e `error-handler.ts`.
- **`plugins/`**: `rate-limit.ts` usando `@fastify/rate-limit` no modo opt-in (`global: false`).
- **`routes/`**: camada fina que traduz HTTP ↔ Services com validação automática de `params`, `querystring`, `body` e `response` via `fastify-type-provider-zod`.
- **`services/`**: regras de negócio isoladas, acompanhadas de funções puras testáveis (`*.utils.ts` + `*.utils.test.ts`).
- **`models/`**: schemas Mongoose (`Book`, `Review`, `User`, `ReadingListItem`, `Notification`, `Suggestion`, `AuditLog`).

### Provedores Externos de Livros
- `google-books.service.ts` realiza buscas e normaliza volumes da Google Books API (removendo tags HTML, normalizando capa HTTPS e validando ISBN).
- `external-books-providers.service.ts` combina metadados da Google Books, **BrasilAPI ISBN** e **Open Library**, preenchendo lacunas bibliográficas e priorizando sinopses em português (`PT-BR`).

### Motor de Consenso (`consensus.service.ts`)
- Calcula o veredito da obra (`RECOMMENDED`, `WITH_RESERVATIONS`, `NOT_RECOMMENDED`, `UNRATED`) a partir dos pareceres em `ReviewModel`.
- Aplica peso `3` para curadores (`isCurator: true`) e peso `1` para leitores comuns.
- Aplica o **Princípio de Prudência** (`>= 40%` do peso total em `NOT_RECOMMENDED`).
- Consolida ressalvas preservando a severidade máxima por tópico.
- Respeita `editorialLock` quando definido manualmente pela curadoria.

### Modelo RBAC (`rbac.utils.ts` e `user.service.ts`)
- Papéis suportados: `READER`, `CURATOR` e `ADMIN` (`ADMIN` herda permissões de `CURATOR`).
- `resolveEffectiveRole` garante que e-mails em `ADMIN_EMAILS` recebam sempre o papel `ADMIN`.
- `canDemoteAdmin` impede que o último administrador ativo do sistema seja rebaixado.
- Mudanças de papel, convites e alterações editoriais são gravados em `AuditLogModel`.

### Sistema de Notificações (`notification.service.ts` e `notification.utils.ts`)
- Sempre que um livro recebe um parecer (`review.service.ts`) ou uma atualização editorial (`curation.service.ts`), `notifyReadingListWatchers` consulta `ReadingListItemModel`, deduplica os destinatários excluindo o próprio autor da ação (`buildNotificationPayloads`) e persiste avisos em `NotificationModel` (indexado por `{ userId: 1, createdAt: -1 }`).
- A operação roda protegida em `try/catch` para não bloquear a publicação do parecer ou da curadoria caso haja erro transitório de notificação.

---

## 3. Frontend (`apps/web`)

### Roteamento, Code Splitting e UX
- `apps/web/src/App.tsx` utiliza `React.lazy` + `Suspense` para carregar sob demanda páginas secundárias (`BookDetailPage`, `ReadingListPage`, `CurationPage`, `AdminPage`, `CriteriaPage`, `AboutCurationPage`, `SuggestionsPage`) e modais pesados (`ImportBookModal`, `IsbnScannerModal`).
- `apps/web/vite.config.ts` separa pacotes vendor em `manualChunks` (`react-vendor`, `firebase-vendor`, `query-vendor`, `icons-vendor`).
- `<ScrollToTop />` (`apps/web/src/components/layout/ScrollToTop.tsx`) observa `pathname` para posicionar a rolagem no topo ao mudar de página sem interferir nos filtros da URL (`?q=...`) do catálogo.

### Estado, API e Autenticação
- **TanStack Query (`@tanstack/react-query`)**: gerencia cache e revalidação de consultas (`staleTime` de 2 minutos, polling de 60s em `NotificationsPopover` quando autenticado).
- **`apps/web/src/services/api.ts`**: envia o token `Authorization: Bearer` apenas nas rotas onde `requiresAuth = true`, evitando preflights `OPTIONS` desnecessários em consultas públicas `GET`.
- **`apps/web/src/contexts/AuthContext.tsx`**: integra Firebase Auth com Google (`prompt: 'select_account'` para facilitar troca de conta) e sincroniza o perfil RBAC em `/api/v1/auth/me`.

---

## 4. Fluxo Git, CI/CD e Deploy

- **Gitflow:** desenvolvimento em branches de feature/fix integradas em `develop`; releases fechadas via branch `release/vX.Y.Z` com merge para `main`, tag anotada e retorno em `develop`.
- **CI (`.github/workflows/ci.yml`):** executa build/testes de `@app/shared`, testes de `@app/api`, `typecheck` de `@app/api` e `@app/web` e `build` de `@app/web` em Node 26.
- **Deploy:** backend empacotado via Docker (`railway.toml` / `apps/api/Dockerfile`) com healthcheck em `/health`; frontend publicado como SPA estática (Cloudflare Pages).
