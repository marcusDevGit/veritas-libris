# Avaliação da Magisterium AI (Golden Set & Feedback Loop)

Este guia descreve como validar o parser, a formatação e a taxa de concordância do Copiloto Editorial da Magisterium AI antes e depois de ajustes em `PROMPT_VERSION`.

## 1. Golden Set Offline

O arquivo `apps/api/src/services/magisterium-eval.ts` contém casos representativos (obras recomendadas, obras com ressalvas morais/violência, obras desaconselhadas e obras sem sinopse).

Para executar a avaliação offline:

```bash
npm run eval:magisterium --workspace=@app/api
```

O script verifica:
1. Aderência ao contrato (`VEREDITO`, `IDADE`, `JUSTIFICATIVA`, `SÍNTESE`);
2. Concordância com o veredito esperado do gabarito;
3. Ausência de vazamento de marcação Markdown (`**`, `#`).

## 2. Feedback Loop em Produção

Ao salvar a Trava Editorial em `updateBookEditorial` (`apps/api/src/services/curation.service.ts`), caso exista um rascunho prévio gerado pela Magisterium AI para aquela obra, o `AuditLog` (`EDITORIAL_LOCK_UPDATED`) registra automaticamente `IA: concordou` ou `IA: divergiu` nos detalhes do evento.
