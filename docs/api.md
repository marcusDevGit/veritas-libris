# Referência da API — Veritas Libris

Todos os endpoints de negócio são registrados em `apps/api/src/app.ts` sob o prefixo `/api/v1` (exceto `/health`).

## Autenticação e Controle de Acesso (RBAC)

- Endpoints protegidos esperam o cabeçalho:
  ```http
  Authorization: Bearer <Firebase ID Token>
  ```
- O middleware `requireAuth` verifica o token via Firebase Admin SDK e sincroniza o usuário no MongoDB (`syncUserFromAuth`), resolvendo seu papel efetivo (`READER`, `CURATOR` ou `ADMIN`).
- `requireCurator`: permite `CURATOR` e `ADMIN`.
- `requireAdmin`: permite apenas `ADMIN`.
- Limite de payload padrão do servidor Fastify: `1 MiB` (`bodyLimit: 1_048_576`).
- Quando um rate limit é excedido, a API responde `429` com `{ statusCode: 429, code: "RATE_LIMIT_EXCEEDED", message: "..." }`.

---

## Saúde da Aplicação

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | Pública | Verifica o estado da conexão com o MongoDB (`200` com `status: "ok"` se `connected`; caso contrário `503` com `status: "degraded"`). |

---

## Autenticação (`/api/v1/auth`)

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/auth/me` | `requireAuth` | Sincroniza o perfil autenticado no MongoDB (aplicando `ADMIN_EMAILS`, se aplicável) e retorna `UserDto`. |

---

## Catálogo e Importação (`/api/v1/books`)

| Método | Rota | Autenticação | Rate Limit | Descrição |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/books` | Pública | — | Lista paginada com suporte a `q`, `adequacy`, `age`, `tags`, `familyMode`, `stamp`, `sort` e contadores agregados (`PaginatedBooksSchema`). |
| `GET` | `/api/v1/books/external-search` | Pública | `20 req / 1 min` | Busca normalizada via Google Books API (`q`, `limit`), marcando obras já presentes no catálogo. |
| `GET` | `/api/v1/books/:id` | Pública | — | Retorna detalhes completos de uma obra (`BookDtoSchema`). |
| `POST` | `/api/v1/books/import` | `requireAuth` *(se `IMPORT_REQUIRES_AUTH=true`)* | `10 req / 1 min` *(por `uid` ou `ip`)* | Importação idempotente por `isbn13` usando Google Books, BrasilAPI ISBN e Open Library (`201` se criada, `200` se já existia). |
| `PATCH` | `/api/v1/books/:id/refresh-metadata` | Pública | `10 req / 1 min` | Completa e atualiza metadados bibliográficos faltantes via provedores externos (priorizando sinopses em PT-BR). |

---

## Curadoria Editorial (`/api/v1/curation` e `/api/v1/books/:id/editorial`)

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/curation/books` | `requireAuth` + `requireCurator` | Lista a fila de obras para curadoria editorial (`CurationQueueQuerySchema`). |
| `PATCH` | `/api/v1/books/:id/editorial` | `requireAuth` + `requireCurator` | Atualiza veredito oficial, trava editorial (`editorialLock`), nota editorial e obras alternativas (`alternatives`), registrando em `AuditLog` e disparando notificações (`EDITORIAL_UPDATE`) aos leitores com a obra salva. |

---

## Avaliações e Pareceres (`/api/v1/books/:id/reviews` e `/api/v1/reviews`)

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/books/:id/reviews` | Pública | Lista paginada de pareceres da obra (`ReviewListQuerySchema`). |
| `POST` | `/api/v1/books/:id/reviews` | `requireAuth` *(se `REVIEW_REQUIRES_AUTH=true`)* | Cria ou atualiza (`upsertReview`) o parecer do usuário para a obra, recalcula o consenso (exceto quando bloqueado por `editorialLock`) e notifica (`NEW_REVIEW`) outros leitores que salvaram a obra. |
| `POST` | `/api/v1/reviews/:id/helpful` | `requireAuth` *(se `REVIEW_REQUIRES_AUTH=true`)* | Registra voto útil de um usuário em um parecer sem duplicidade. |

---

## Lista de Leitura (`/api/v1/reading-list`)

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/reading-list` | `requireAuth` | Lista todas as obras salvas pelo usuário autenticado e suas estatísticas (`ReadingListResponseSchema`). |
| `GET` | `/api/v1/reading-list/:id/status` | `requireAuth` | Verifica se uma obra específica (`:id`) está salva na lista do usuário (`ReadingListStatusResponseSchema`). |
| `POST` | `/api/v1/reading-list` | `requireAuth` | Adiciona `bookId` à lista de leitura do usuário. |
| `DELETE` | `/api/v1/reading-list/:id` | `requireAuth` | Remove a obra (`:id`) da lista de leitura do usuário. |

---

## Notificações (`/api/v1/notifications`)

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/notifications` | `requireAuth` | Retorna as notificações do usuário autenticado e `unreadCount` (`NotificationListResponseSchema`). |
| `PATCH` | `/api/v1/notifications/read-all` | `requireAuth` | Marca todas as notificações não lidas do usuário como lidas (`{ updated: number }`). |
| `PATCH` | `/api/v1/notifications/:id/read` | `requireAuth` | Marca uma notificação específica do usuário como lida (`{ read: boolean }`). |

---

## Sugestões (`/api/v1/suggestions`)

| Método | Rota | Autenticação | Rate Limit | Descrição |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/suggestions` | Pública | `10 req / 1 min` | Envia sugestão de obra para curadoria ou melhoria da plataforma (`201`). |
| `GET` | `/api/v1/suggestions` | `requireAuth` + `requireCurator` | — | Lista sugestões recebidas para consulta da curadoria (`SuggestionListResponseSchema`). |

---

## Administração (`/api/v1/admin`)

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/admin/users` | `requireAuth` + `requireAdmin` | Lista usuários cadastrados com busca e paginação (`AdminUsersQuerySchema`). |
| `PATCH` | `/api/v1/admin/users/:uid/role` | `requireAuth` + `requireAdmin` | Altera o papel do usuário (`READER`, `CURATOR`, `ADMIN`), impedindo o rebaixamento do último `ADMIN` ativo e gravando em `AuditLog`. |
| `POST` | `/api/v1/admin/users/invite` | `requireAuth` + `requireAdmin` | Pré-cadastra ou promove um usuário por e-mail para um papel específico com registro em `AuditLog`. |
| `GET` | `/api/v1/admin/audit-logs` | `requireAuth` + `requireAdmin` | Retorna os registros recentes de auditoria (`AuditLogListResponseSchema`). |
