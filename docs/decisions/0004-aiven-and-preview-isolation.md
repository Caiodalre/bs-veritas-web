# ADR 0004 — Aiven e isolamento do preview

- Status: implementado em produção
- Data: 2026-09-19

## Contexto

O ADR 0001 escolheu Worker, Drizzle e Hyperdrive, mas indicava Neon como provedor PostgreSQL antes da
criação da infraestrutura. A implementação utilizou um serviço PostgreSQL gratuito da Aiven. Durante
a homologação, o preview ainda possuía os mesmos bindings de dados da produção, embora a notificação
estivesse desativada.

Uma prévia pública não deve conseguir gravar dados reais nem depender de credenciais de produção.

## Decisão

- manter Next.js com exportação estática e Cloudflare Worker para `/api/*`;
- usar PostgreSQL da Aiven conectado ao Worker por Cloudflare Hyperdrive;
- acessar o banco com Drizzle ORM e Postgres.js;
- conceder ao usuário da aplicação apenas inserção e leitura do UUID retornado;
- manter Hyperdrive, envio de e-mail, rate limiter e segredo Turnstile somente em produção;
- definir `QUOTE_SUBMISSION_ENABLED=true` somente em produção;
- definir `QUOTE_SUBMISSION_ENABLED=false` no preview;
- recusar a API antes de qualquer integração quando a coleta estiver desativada;
- manter o formulário visível para revisão no preview, porém com campos desativados e orientação
  para usar o domínio oficial.

## Consequências

- a produção persiste solicitações e tenta enviar a notificação somente após a gravação;
- o preview não consegue acessar o banco nem enviar notificações, mesmo que a interface seja
  contornada;
- ambientes desconhecidos não habilitam coleta no navegador;
- a ausência de bindings obrigatórios em produção causa falha fechada com resposta genérica;
- mudanças de schema continuam exigindo migration revisada e ordem explícita de implantação;
- restauração de backup e descarte após a retenção continuam como pendências operacionais.

## Evidências

- tipos de bindings gerados pelo Wrangler distinguem produção e preview;
- o dry-run e o upload do preview listaram somente assets e variáveis públicas de controle;
- `POST /api/quote` no preview retorna `503 quote_submission_disabled`;
- testes unitários verificam que o bloqueio ocorre antes do rate limiter, Turnstile e repositório;
- a CI e os testes de navegador foram aprovados antes da publicação.
