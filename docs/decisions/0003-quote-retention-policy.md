# ADR 0003 — Retenção das solicitações de cotação

- Status: implementado em produção
- Data: 2026-09-14

## Contexto

A ativação do formulário exige uma política explícita para o campo `retention_expires_at`. O prazo
deve ser conhecido antes da gravação, aparecer na informação pública aplicável e permitir descarte
previsível.

A LGPD prevê o término do tratamento quando a finalidade for alcançada ou o período terminar,
permitindo conservação nas hipóteses legais. A Circular Susep nº 605/2020 estabelece guarda mínima
de cinco anos para documentos relacionados a operações e intermediação de seguros.

## Decisão

- cada solicitação recebida pelo formulário terá vencimento de retenção em cinco anos corridos,
  contado do instante de recebimento;
- 29 de fevereiro será ajustado para o último dia de fevereiro no quinto ano;
- a versão `1.1` da Política de Privacidade identificará o texto aplicável ao formulário;
- após o vencimento, o registro deverá ser eliminado ou anonimizado, salvo obrigação legal,
  regulatória, ordem válida ou necessidade de exercício regular de direitos;
- solicitações de titulares serão avaliadas conforme a LGPD e as obrigações aplicáveis;
- o prazo não autoriza coleta de dados além dos campos mínimos já aprovados.

A decisão foi aprovada pelo responsável pelo projeto em 14 de setembro de 2026. Ela não substitui
revisão jurídica independente da redação e do enquadramento regulatório.

## Consequências

- o backend calculará `retention_expires_at` no recebimento, sem aceitar esse valor do navegador;
- a política pública utiliza a versão `1.1` aplicável ao formulário;
- a rotina versionada executará diariamente no Worker e excluirá no máximo 500 solicitações vencidas
  por execução;
- o papel da aplicação não receberá `DELETE` direto; ele poderá apenas executar uma função
  `SECURITY DEFINER` restrita a registros cujo prazo venceu;
- a função usa o índice de expiração, tempo limite e `SKIP LOCKED` para manter a operação curta e
  segura em execuções concorrentes;
- o preview não possui Cron Trigger nem acesso ao banco;
- backups também deverão respeitar regras documentadas de expiração e restauração;
- a aplicação da migration, a publicação do Cron Trigger e o tratamento correspondente dos backups
  continuam como etapas operacionais separadas.

## Referências

- [Lei nº 13.709/2018 — LGPD, arts. 15 e 16](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
- [Circular Susep nº 605/2020](https://www2.susep.gov.br/safe/scripts/bnweb/bnmapi.exe?router=upload%2F22297)
- [Cloudflare Workers — Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Cloudflare Workers — preços](https://developers.cloudflare.com/workers/platform/pricing/)
