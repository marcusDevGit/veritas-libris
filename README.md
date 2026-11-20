# Veritas Libris

Plataforma de **Curadoria e Discernimento Literário Católico** construída em monorepo TypeScript, dedicada à análise moral, doutrinária e estética de obras literárias à luz da Tradição e do Magistério Eclesial.

---

## Visão Geral e Documentação

- **[Arquitetura do Sistema](docs/architecture.md)** — Camadas do monorepo, modelos Mongoose, motor de consenso, RBAC, notificações e estratégia de build.
- **[Referência da API (`/api/v1`)](docs/api.md)** — Endpoints completos, parâmetros, autenticação, papéis exigidos e rate limits.
- **[Changelog](CHANGELOG.md)** — Histórico de versões (`v1.0.0`, `v1.0.1`, `v1.1.0`, `v1.2.0`, `v1.3.0`).

---

## Arquitetura do Monorepo

O projeto utiliza **npm workspaces** organizado em três pacotes principais:

```text
veritas-libris/
├── packages/
│   └── shared/        # @app/shared — Schemas Zod (SSOT), enums doutrinários, DTOs e utilitários de ISBN
├── apps/
│   ├── api/           # @app/api — Backend Fastify, Mongoose/MongoDB, Firebase Admin e provedores de livros
│   └── web/           # @app/web — Frontend React 19, Vite 8, Tailwind CSS v4, TanStack Query e Firebase Auth
├── docs/              # Documentação técnica (arquitetura e API)
├── .github/workflows/ # Pipeline CI (build, testes unitários e typecheck)
├── docker-compose.yml # MongoDB local para desenvolvimento
├── railway.toml       # Configuração de build/deploy Docker da API no Railway
└── package.json       # Configuração raiz dos workspaces (v1.3.0)
```

---

## Stack Tecnológica

- **Contratos Compartilhados (`@app/shared`):** TypeScript + Zod (`book`, `catalog`, `curation`, `notification`, `reading-list`, `review`, `suggestion`, `user`).
- **Backend (`@app/api`):** Node.js >= 20, Fastify 5, `fastify-type-provider-zod`, `@fastify/cors`, `@fastify/rate-limit`, Mongoose (MongoDB), Firebase Admin SDK, integração com Google Books API, BrasilAPI ISBN e Open Library.
- **Frontend (`@app/web`):** React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), React Router v7, TanStack Query v5, Firebase Web Auth (`firebase/auth`), Lucide React, code splitting por rota e `manualChunks`.

---

## Páginas e Funcionalidades (`@app/web`)

| Rota | Página | Descrição |
| :--- | :--- | :--- |
| `/` | `CatalogPage` | Catálogo paginado com filtros server-side (`q`, `adequacy`, `age`, `stamp`, `familyMode`, ordenação) e contadores |
| `/livros/:id` | `BookDetailPage` | Ficha bibliográfica, consenso moral, ressalvas, envio de pareceres, voto útil e salvamento na lista |
| `/minha-lista` | `ReadingListPage` | Lista pessoal de leitura persistida no servidor (visível quando autenticado) |
| `/criterios` | `CriteriaPage` | Metodologia editorial, 4 dimensões de análise, escala de vereditos e faixas etárias |
| `/sobre` | `AboutCurationPage` | Missão pastoral, pilares da curadoria e transparência institucional |
| `/sugestoes` | `SuggestionsPage` | Formulário público de indicação de obras e sugestões de melhoria |
| `/curadoria` | `CurationPage` | Fila de curadoria para `CURATOR`/`ADMIN` (trava editorial, notas oficiais e obras alternativas) |
| `/admin` | `AdminPage` | Gestão de usuários, papéis (`READER`/`CURATOR`/`ADMIN`), convites e logs de auditoria (`ADMIN`) |

---

## Regras de Negócio Principais

- **Motor de Consenso (`consensus.service.ts`):**
  1. Pareceres de **Curadores** possuem peso `3`; leitores comuns possuem peso `1`.
  2. **Princípio de Prudência:** se `>= 40%` do peso total votar `NOT_RECOMMENDED`, o veredito sobe automaticamente para **Desaconselhado**.
  3. A faixa etária recomendada (`ALL`, `10+`, `12+`, `14+`, `16+`, `18+`) resulta da mediana ponderada dos votos.
  4. Ressalvas no mesmo tópico consolidam mantendo a **severidade máxima** (`LOW` < `MEDIUM` < `HIGH`).
  5. **Trava Editorial (`editorialLock`):** impede que novas avaliações alterem o veredito oficial definido pela curadoria.
- **RBAC e Proteção de Administradores (`rbac.utils.ts`):**
  - Papéis `READER`, `CURATOR` e `ADMIN` (`ADMIN` herda permissões de `CURATOR`).
  - E-mails listados em `ADMIN_EMAILS` recebem automaticamente o papel `ADMIN` no login.
  - O sistema bloqueia o rebaixamento do último `ADMIN` ativo (`canDemoteAdmin`).
- **Notificações Reais (`notification.service.ts`):**
  - Leitores que salvaram uma obra em `Minha Lista` recebem avisos no sininho quando outro usuário publica um parecer (`NEW_REVIEW`) ou quando a curadoria aplica uma atualização editorial (`EDITORIAL_UPDATE`).

---

## Como Rodar Localmente

### 1. Pré-requisitos
- Node.js `>= 20.0.0`
- Docker e Docker Compose (para o MongoDB local)
- Projeto no Firebase (Authentication com Google habilitado)
- Chave da Google Books API (opcional, recomendada para evitar limites de cota)

### 2. Instalar Dependências
```bash
npm install
```

### 3. Subir o Banco de Dados (MongoDB)
```bash
docker compose up -d
```

### 4. Configurar Variáveis de Ambiente

Copie `apps/api/.env.example` para `apps/api/.env` e `apps/web/.env.example` para `apps/web/.env` (nunca versione arquivos `.env`).

#### Backend (`apps/api/.env`)

| Variável | Obrigatória | Padrão | Descrição |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Não | `development` | `development`, `test` ou `production` |
| `HOST` | Não | `0.0.0.0` | Endereço de bind do servidor Fastify |
| `PORT` | Não | `3333` | Porta HTTP da API |
| `LOG_LEVEL` | Não | `info` | `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent` |
| `MONGODB_URI` | **Sim** | — | URI de conexão (`mongodb://` ou `mongodb+srv://`) |
| `FIREBASE_PROJECT_ID` | **Sim** | — | ID do projeto Firebase Admin |
| `FIREBASE_CLIENT_EMAIL` | **Sim** | — | E-mail da service account Firebase |
| `FIREBASE_PRIVATE_KEY` | **Sim** | — | Chave privada da service account (aceita `\n` literal) |
| `GOOGLE_BOOKS_API_KEY` | Não | `undefined` | Chave da Books API (Google Cloud) |
| `CORS_ORIGIN` | Não | `undefined` | Origens permitidas separadas por vírgula (se omitido, permite qualquer origem) |
| `IMPORT_REQUIRES_AUTH` | Não | `true` | Exige Bearer JWT no `POST /api/v1/books/import` *(obrigatório `true` em `production`)* |
| `REVIEW_REQUIRES_AUTH` | Não | `true` | Exige Bearer JWT nas rotas de parecer/voto útil *(obrigatório `true` em `production`)* |
| `ADMIN_EMAILS` | Não | `""` | Lista de e-mails separados por vírgula promovidos automaticamente a `ADMIN` |
| `MAGISTERIUM_API_KEY` | Não | `undefined` | Chave da Magisterium AI (exclusiva do servidor) para o copiloto de curadoria |

#### Frontend (`apps/web/.env`)

| Variável | Descrição |
| :--- | :--- |
| `VITE_API_URL` | URL base da API em produção (vazio em dev para usar o proxy Vite `/api -> http://localhost:3333`) |
| `VITE_FIREBASE_API_KEY` | Chave pública Web App do Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `VITE_FIREBASE_APP_ID` | ID do Web App Firebase |

### 5. Executar em Desenvolvimento

```bash
# Terminal 1 — API Fastify (porta 3333)
npm run dev --workspace=@app/api

# Terminal 2 — Frontend Vite (porta 5173)
npm run dev --workspace=@app/web
```

Acesse: `http://localhost:5173`

---

## Scripts de Verificação, Testes e CI

O workflow `.github/workflows/ci.yml` executa em Pull Requests e pushes para `develop` e `main` (Node 26):

```bash
# Compilar e testar contratos compartilhados (@app/shared)
npm test --workspace=@app/shared

# Testes unitários do backend (@app/api)
npm test --workspace=@app/api

# Verificação de tipos (TypeScript)
npm run typecheck --workspace=@app/shared
npm run typecheck --workspace=@app/api
npm run typecheck --workspace=@app/web

# Build de produção do frontend
npm run build --workspace=@app/web
```

---

## Resumo dos Endpoints da API

Consulte os detalhes completos em **[docs/api.md](docs/api.md)**:

- **Saúde:** `GET /health`
- **Autenticação:** `GET /api/v1/auth/me`
- **Catálogo & Importação:** `GET /api/v1/books`, `GET /api/v1/books/external-search`, `GET /api/v1/books/:id`, `POST /api/v1/books/import`, `PATCH /api/v1/books/:id/refresh-metadata`
- **Curadoria:** `GET /api/v1/curation/books`, `PATCH /api/v1/books/:id/editorial`, `POST /api/v1/curation/books/:id/ai-draft`
- **Avaliações:** `GET /api/v1/books/:id/reviews`, `POST /api/v1/books/:id/reviews`, `POST /api/v1/reviews/:id/helpful`
- **Minha Lista:** `GET /api/v1/reading-list`, `GET /api/v1/reading-list/:id/status`, `POST /api/v1/reading-list`, `DELETE /api/v1/reading-list/:id`
- **Notificações:** `GET /api/v1/notifications`, `PATCH /api/v1/notifications/read-all`, `PATCH /api/v1/notifications/:id/read`
- **Sugestões:** `POST /api/v1/suggestions`, `GET /api/v1/suggestions`
- **Administração:** `GET /api/v1/admin/users`, `PATCH /api/v1/admin/users/:uid/role`, `POST /api/v1/admin/users/invite`, `GET /api/v1/admin/audit-logs`

---

## Nota Canônica

> As avaliações e classificações exibidas pelo **Veritas Libris** possuem caráter pedagógico e consultivo de discernimento prudencial leigo e pastoral. Não substituem o parecer oficial diocesano (*Nihil Obstat* / *Imprimatur*) emitido pelas autoridades eclesiásticas competentes.
