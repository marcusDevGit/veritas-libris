# Changelog

Todas as mudanças notáveis do projeto **Veritas Libris** estão documentadas neste arquivo.

## [Unreleased]
### Fixed
- Adicionado componente `ScrollToTop` e reset de rolagem nos links do `Footer` para redirecionar automaticamente ao início da página ao navegar entre rotas.

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
