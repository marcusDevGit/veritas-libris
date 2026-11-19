# Veritas Libris

Plataforma de **Curadoria e Discernimento Literário Católico** construída em monorepo TypeScript, dedicada à análise moral, doutrinária e estética de obras literárias à luz da Tradição e do Magistério Eclesial.

---

## Arquitetura do Monorepo

O projeto utiliza **npm workspaces** organizado em três pacotes principais:

```text
veritas-libris/
├── packages/
│   └── shared/        # @app/shared — Schemas Zod, enums doutrinários, DTOs e utilitários de ISBN
├── apps/
│   ├── api/           # @app/api — Backend Fastify, Mongoose/MongoDB, Firebase Admin e Google Books
│   └── web/           # @app/web — Frontend React 19, Vite 8, Tailwind CSS v4, TanStack Query e Firebase Auth
├── docker-compose.yml # MongoDB local para desenvolvimento
└── package.json       # Configuração raiz dos workspaces
```

---

## Stack Tecnológica

- **Contratos Compartilhados (`@app/shared`):** TypeScript + Zod (validação única compartilhada entre API e Frontend).
- **Backend (`@app/api`):** Node.js >= 20, Fastify, `fastify-type-provider-zod`, Mongoose (MongoDB), Firebase Admin SDK, integração com Google Books API.
- **Frontend (`@app/web`):** React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), React Router v7, TanStack Query v5, Firebase Web Auth (`firebase/auth`), Lucide React.

---

## Regras de Negócio & Motor de Consenso

O cálculo de consenso literário ([consensus.service.ts](apps/api/src/services/consensus.service.ts)) consolida as avaliações seguindo critérios prudenciais:

1. **Ponderação por Perfil:** Avaliações de **Curadores Oficiais** possuem peso `3`, enquanto leitores comuns possuem peso `1`.
2. **Princípio de Prudência:** Se `>= 40%` do peso total de votos apontar para `NOT_RECOMMENDED`, o veredito da obra é elevado automaticamente para **Desaconselhado**.
3. **Mediana Ponderada Etária:** A faixa etária recomendada (`ALL`, `10+`, `12+`, `14+`, `16+`, `18+`) é calculada pela mediana ponderada dos votos.
4. **Consolidação de Ressalvas:** Pontos de atenção reportados nos mesmos tópicos são agrupados mantendo a **severidade máxima** registrada (`LOW` < `MEDIUM` < `HIGH`).
5. **Trava Editorial (`editorialLock`):** Quando ativada pela curadoria, impede que novas avaliações comunitárias alterem o veredito oficial consolidado.

---

## Como Rodar Localmente

### 1. Pré-requisitos
- Node.js `>= 20.0.0`
- Docker e Docker Compose (para o MongoDB local)
- Conta no Firebase (Auth com Google habilitado)
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

- **Backend (`apps/api/.env`):** Copie `apps/api/.env.example` para `apps/api/.env` e preencha `MONGODB_URI`, credenciais do Firebase Admin e `GOOGLE_BOOKS_API_KEY`.
  - Em `NODE_ENV=production`, `IMPORT_REQUIRES_AUTH=true` e `REVIEW_REQUIRES_AUTH=true` são obrigatórios (a API recusa iniciar caso estejam como `false`).
- **Frontend (`apps/web/.env`):** Copie `apps/web/.env.example` para `apps/web/.env` e preencha as chaves públicas do Web App Firebase (`VITE_FIREBASE_*`).

### 5. Executar em Desenvolvimento

Em dois terminais separados:

```bash
# Terminal 1 — API Fastify (porta 3333)
npm run dev --workspace=@app/api

# Terminal 2 — Frontend Vite (porta 5173 com proxy /api -> localhost:3333)
npm run dev --workspace=@app/web
```

Acesse a aplicação em: `http://localhost:5173`

---

## Scripts de Verificação, Testes e Build

```bash
# Compilar contratos compartilhados (@app/shared)
npm run build --workspace=@app/shared

# Testes unitários (@app/shared e @app/api)
npm test --workspace=@app/shared
npm test --workspace=@app/api

# Verificação de tipos (TypeScript)
npm run typecheck --workspace=@app/shared
npm run typecheck --workspace=@app/api
npm run typecheck --workspace=@app/web

# Build de produção do frontend
npm run build --workspace=@app/web
```

---

## Endpoints Principais da API (`/api/v1`)

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | Pública | Verificação de saúde da API e conexão MongoDB |
| `GET` | `/api/v1/books` | Pública | Listagem paginada com filtros (`q`, `adequacy`, `age`, `tags`) |
| `GET` | `/api/v1/books/external-search` | Pública *(20 req/min)* | Busca externa normalizada na Google Books API |
| `GET` | `/api/v1/books/:id` | Pública | Detalhes completos da obra, ressalvas e estatísticas |
| `POST` | `/api/v1/books/import` | Firebase JWT *(10 req/min)* | Importação idempotente de livro por ISBN-13 (`IMPORT_REQUIRES_AUTH=true` em prod) |
| `PATCH` | `/api/v1/books/:id/refresh-metadata` | Pública *(10 req/min)* | Completa metadados bibliográficos via provedores externos |
| `GET` | `/api/v1/books/:id/reviews` | Pública | Lista paginada de pareceres da obra |
| `POST` | `/api/v1/books/:id/reviews` | Firebase JWT | Publica avaliação/ressalvas e recalcula o consenso |
| `POST` | `/api/v1/reviews/:id/helpful` | Firebase JWT | Registra voto útil em um parecer (sem duplicidade) |

---

## Nota Canônica

> As avaliações e classificações exibidas pelo **Veritas Libris** possuem caráter pedagógico e consultivo de discernimento prudencial leigo e pastoral. Não substituem o parecer oficial diocesano (*Nihil Obstat* / *Imprimatur*) emitido pelas autoridades eclesiásticas competentes.
