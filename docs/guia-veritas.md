# Manual Completo da Plataforma Veritas Libris

Este documento é a referência oficial de uso, critérios, papéis e diretrizes operacionais da plataforma **Veritas Libris** para **Leitores**, **Curadores Oficiais**, **Administradores** e **Colaboradores**.

> **Nota Canônica:** As classificações, pareceres e selos exibidos pela **Veritas Libris** possuem caráter exclusivamente pedagógico, pastoral e consultivo de discernimento leigo. **Não substituem** o juízo oficial da autoridade eclesiástica competente (*Nihil Obstat* e *Imprimatur* diocesanos).

---

## 1. Sobre os Critérios & Discernimento

### 1.1 As 4 Dimensões de Análise
Na ficha de cada obra, o discernimento moral e literário é sintetizado visualmente em quatro indicadores:

1. **Fidelidade Doutrinária:** verifica se a obra respeita a ortodoxia católica ou se contém desvios dogmáticos, relativismo moral ou anticlericalismo.
2. **Modéstia & Pureza:** avalia a presença de conteúdo sensual, imodéstia ou apologia ao vício contra a castidade.
3. **Violência / Gravidade:** observa o nível de violência explícita, crueldade ou cenas perturbadoras e se há finalidade dramática legítima ou gratuidade.
4. **Consenso Positivo:** traduz o grau de aprovação da comunidade e da curadoria, ponderando avaliações favoráveis e com ressalvas.

*(O mérito literário e pedagógico acompanha a análise na síntese editorial e nas recomendações de faixa etária.)*

### 1.2 Vereditos Oficiais
- **Recomendado (`RECOMMENDED`):** leitura edificante, formativa e alinhada à visão cristã da pessoa humana.
- **Com Ressalvas (`WITH_RESERVATIONS`):** possui valor literário, histórico ou cultural, mas exige maturidade, contextualização ou mediação formativa por conter trechos sensíveis.
- **Não Recomendado / Desaconselhado (`NOT_RECOMMENDED`):** contém erros doutrinários graves, relativismo moral estrutural, blasfêmia, ocultismo ou conteúdo incompatível com a formação cristã.
- **Sem Avaliação (`UNRATED`):** obra recém-catalogada que ainda aguarda as primeiras análises da comunidade ou da curadoria.

### 1.3 Faixas Etárias Recomendadas
- **`ALL` (Livre):** adequada para todas as idades.
- **`10+`**, **`12+`**, **`14+`**, **`16+`**, **`18+`:** indicação prudencial considerando maturidade afetiva, psicológica e formação doutrinária necessária para lidar com os temas da obra.

### 1.4 Como Funciona o Motor de Consenso
Enquanto a obra não possui **Trava Editorial (`editorialLock`)** ativa, o veredito é calculado automaticamente (`consensus.service.ts`) a partir de todas as avaliações registradas:

1. **Peso dos votos:** pareceres de **Curadores Oficiais** possuem **peso `3`**; pareceres de leitores comuns possuem **peso `1`**.
2. **Princípio de Prudência:** se **`>= 40%` do peso total** votar em `NOT_RECOMMENDED`, o veredito da obra sobe automaticamente para **Não Recomendado**, protegendo leitores e famílias em casos de risco relevante.
3. **Faixa etária:** calculada pela mediana ponderada dos votos de idade.
4. **Consolidação de ressalvas:** múltiplas ressalvas sobre o mesmo tópico são consolidadas preservando sempre a **severidade máxima** apontada (`Leve` < `Moderada` < `Grave`).

---

## 2. O que é Esperado de Cada Envolvido

### 2.1 Visitantes e Leitores (`READER`)
- **Pesquisa e Filtros:** utilize a busca textual no catálogo, filtros por veredito, faixa etária, selos (`Imprimatur`, `Clássico Cristão`) e o **Modo Família** para restringir resultados a obras seguras para o ambiente familiar.
- **Conduta ao Publicar Pareceres (`Avaliar Obra`):**
  - Seja objetivo, honesto e movido pela **caridade cristã** — critique ideias e trechos, evitando ataques pessoais.
  - Avalie apenas obras que você realmente leu ou conhece em profundidade suficiente.
  - O formulário possui **4 etapas**: (1) Classificação Geral & Faixa Etária, (2) Temas & Tags, (3) Pontos de Inadequação & Ressalvas (obrigatório ao marcar *Com Ressalvas* ou *Não Recomendado*, sendo opcional o campo de capítulo/trecho), e (4) Parecer Crítico.
  - Sempre que possível, informe o capítulo ou trecho localizado para ajudar pais e educadores.
- **Recursos Pessoais:**
  - **`Minha Lista` (`/minha-lista`):** salve livros de interesse e receba avisos automáticos quando houver novos pareceres ou decisões editoriais.
  - **`Meus Pareceres` (`/meus-pareceres`):** consulte, edite ou exclua suas próprias avaliações publicadas.
  - **Notificações (Sininho):** acompanhe avisos não lidos, marque como lidos ou arquive notificações antigas.

### 2.2 Curadores Oficiais (`CURATOR`)
- **Rigor Pastoral, Teológico e Literário:** o parecer do curador orienta famílias, catequistas e escolas católicas; exige fidelidade ao Magistério, equilíbrio prudencial e clareza na distinção entre *retratar o mal criticamente* e *fazer apologia do erro*.
- **Fila Editorial (`/curadoria`):**
  - **Manter consenso aberto (`editorialLock: false`):** recomendado quando o consenso comunitário já reflete com justiça a obra ou enquanto se aguardam mais leituras.
  - **Ativar Trava Editorial (`editorialLock: true`):** homologa o parecer oficial da curadoria e conclui a obra na fila de pendentes. Com a trava ativa, o curador controla os **4 pontos** da ficha pública (Veredito/Idade, Temas/Tags, Pontos de Inadequação/Ressalvas e Síntese Editorial), além de sinalizar **`hasImprimatur`** (somente quando a edição possuir aprovação eclesiástica formal) e indicar **obras alternativas (`alternatives`)** saudáveis.
- **Copiloto de Curadoria (Magisterium AI):**
  - Disponível dentro do editor em `/curadoria` (limite de `5 req/min` e cota compartilhada do Free Tier de `100 req/dia`, com cache automático em banco para evitar chamadas repetidas).
  - **Limitações:** a IA **não lê o livro inteiro** — analisa apenas título, autores, sinopse cadastrada e ressalvas da comunidade para sugerir fundamentos do Magistério.
  - **Responsabilidade humana:** a IA gera apenas um rascunho revisável e nunca publica pareceres nem ativa `editorialLock` sozinha. Toda consulta gera registro em `AuditLog` (`AI_DRAFT_GENERATED`).
- **Moderação de Pareceres:**
  - Curadores podem remover avaliações abusivas, spam, ofensas ou denúncias comprovadamente falsas na ficha do livro.
  - Toda moderação exige confirmação e registra automaticamente um log de auditoria (`REVIEW_MODERATED`) com recálculo imediato do consenso.
- **Triagem de Sugestões:** acompanhar a aba *Triagem de Sugestões* em `/curadoria`, validar dados enviados pelos leitores e importar obras aprovadas.

### 2.3 Administradores (`ADMIN` / Fundadores)
- **Nomeação e Gestão de Curadores (`/admin`):**
  - Promover ou convidar novos curadores (`InviteCuratorModal`) priorizando maturidade doutrinária, equilíbrio literário e histórico construtivo na plataforma.
  - Gerenciar papéis (`READER`, `CURATOR`, `ADMIN`), respeitando que `ADMIN` herda todas as permissões de `CURATOR`.
- **Governança e Segurança:**
  - O sistema protege a plataforma bloqueando o rebaixamento do último `ADMIN` ativo (`canDemoteAdmin`).
  - E-mails configurados em `ADMIN_EMAILS` no servidor recebem automaticamente o papel `ADMIN` no login.
  - Revisar periodicamente o **`AuditLog`** em `/admin` para acompanhar promoções de cargo, travas editoriais, moderações, triagens de sugestões e consultas ao copiloto de IA.

---

## 3. Sobre as Sugestões (`/sugestoes` e Triagem)

Qualquer leitor pode colaborar enviando sugestões em **`/sugestoes`**, escolhendo entre dois tipos:
- **Indicação de Obra (`BOOK`):** sugerir um livro relevante que ainda não está no catálogo.
- **Melhoria ou Correção (`IMPROVEMENT`):** reportar erros de metadados, sugestões de usabilidade ou correções editoriais.

### Boas Práticas ao Sugerir
- Ao indicar um livro, informe sempre que possível o **ISBN-13 válido** (13 dígitos). Isso permite que a curadoria importe a obra com **1 clique** diretamente do painel de triagem.
- Explique brevemente por que a obra merece análise ou qual ajuste é necessário.

### Ciclo de Vida da Sugestão
1. **`PENDING` (Pendente):** sugestão recém-enviada aguardando leitura da curadoria.
2. **`REVIEWED` (Em análise):** a curadoria já visualizou e está verificando metadados ou avaliando a proposta.
3. **`ACCEPTED` (Aceita):** sugestão aprovada (obra importada para o catálogo ou melhoria incorporada).
4. **`DISMISSED` (Descartada):** sugestão não acolhida (ex.: duplicada, ISBN inválido ou fora do escopo), podendo conter nota de resolução registrada pelo curador.

---

## 4. Demais Funcionalidades

- **Importação de Livros & Scanner ISBN:**
  - A busca e importação por ISBN-13 consultam automaticamente **Google Books**, **BrasilAPI ISBN** e **Open Library**, unificando metadados faltantes.
  - Títulos são padronizados automaticamente em Title Case editorial (`formatBookTitle`) e o sistema inclui **Scanner de Código de Barras ISBN** via câmera no navegador.
- **Atualização de Metadados (`refresh-metadata`):**
  - Na página da obra, é possível atualizar metadados bibliográficos faltantes (editora, páginas, capa, ano e sinopse), priorizando sinopses em português (`PT-BR`).
- **Central de Notificações (Sininho):**
  - Usuários autenticados que salvam uma obra em **`Minha Lista`** recebem notificações automáticas quando outro usuário publica um novo parecer (`NEW_REVIEW`) ou quando a curadoria aplica uma atualização editorial (`EDITORIAL_UPDATE`).
- **Voto `Útil`:**
  - Leitores autenticados podem marcar avaliações como úteis (`+1`), ajudando a destacar os pareceres mais claros e bem fundamentados no topo da seção.
- **Privacidade & Segurança de Login:**
  - Autenticação via Firebase Auth (Google) com validação de tokens JWT no servidor e controle de acesso baseado em papéis (RBAC).
  - Nenhuma chave privada ou credencial de API externa (como Google Books ou Magisterium AI) é exposta no frontend.
