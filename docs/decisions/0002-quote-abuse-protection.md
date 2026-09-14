# ADR 0002 — Proteção contra abuso nas solicitações de cotação

- Status: proposto
- Data: 2026-09-14

## Contexto

O endpoint `/api/quote` permanece desativado e ainda não coleta dados. Antes de sua ativação, a
aplicação precisa reduzir envios automatizados e picos de requisições sem introduzir custo fixo ou
enfraquecer a experiência de pessoas legítimas.

O projeto já possui validação estrita dos campos e um honeypot testado. Esses controles não
substituem proteção na borda nem a validação de um desafio no servidor.

## Proposta

Quando o formulário for aprovado para implementação:

1. criar uma regra de rate limiting da Cloudflare limitada ao caminho `/api/quote`;
2. iniciar com um limite conservador de 5 requisições em 10 segundos por origem e revisar o valor
   com tráfego real, sem tratar o contador como mecanismo preciso de auditoria;
3. usar um widget Cloudflare Turnstile no modo Managed, com hostnames permitidos explicitamente;
4. separar widgets e credenciais de preview e produção;
5. validar cada token no Worker pelo Siteverify antes de validar ou persistir os dados da cotação;
6. exigir `hostname` e `action` compatíveis com o ambiente e a ação `quote`;
7. rejeitar tokens ausentes, inválidos, expirados ou reutilizados com resposta genérica;
8. aplicar timeout curto e falhar de modo seguro se o Siteverify estiver indisponível;
9. manter o segredo somente na Cloudflare, nunca no cliente ou no repositório;
10. registrar apenas métricas operacionais necessárias, sem copiar conteúdo do formulário para
    logs.

## Privacidade e conteúdo público

Antes da ativação:

- revisar a política de privacidade e o inventário de cookies à luz do comportamento realmente
  configurado;
- incluir `https://challenges.cloudflare.com` na Content Security Policy somente nas diretivas
  necessárias;
- informar de maneira clara quando a verificação antiabuso estiver sendo executada;
- não usar o modo Invisible sem a revisão jurídica e a referência exigida pela Cloudflare;
- não declarar o formulário como disponível antes da validação completa em preview.

## Critérios de aceitação

- requisições acima do limite recebem `429` sem detalhes internos;
- o endpoint não persiste dados quando o Turnstile falha;
- tokens inválidos, expirados e reutilizados são rejeitados;
- hostname e action incorretos são rejeitados;
- o honeypot continua sendo verificado;
- mensagens de erro são acessíveis e não expõem credenciais;
- CSP, teclado, telas móveis e falhas de rede são testados;
- produção e preview usam credenciais separadas;
- o custo e os limites do plano gratuito são reconfirmados antes da ativação.

## Estado atual

Esta proposta não cria regra WAF, widget, segredo, binding ou endpoint ativo. A implementação
continua bloqueada pela política de retenção, revisão jurídica, banco e permissões mínimas ainda
pendentes.

## Referências

- [Cloudflare Turnstile — planos](https://developers.cloudflare.com/turnstile/plans/)
- [Cloudflare Turnstile — tipos de widget](https://developers.cloudflare.com/turnstile/concepts/widget/)
- [Cloudflare Turnstile — validação no servidor](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare WAF — rate limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Cloudflare Workers — Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
