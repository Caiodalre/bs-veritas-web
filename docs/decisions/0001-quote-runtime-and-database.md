# ADR 0001 — Runtime e banco para solicitações de cotação

- Status: substituído pelo ADR 0004
- Data: 2026-08-30

## Contexto

O site usa exportação estática do Next.js em Cloudflare Workers Static Assets. O formulário V1 exige validação no servidor e PostgreSQL, mas não deve comprometer o custo inicial nem ativar coleta antes das decisões de segurança e privacidade.

## Decisão

- manter as páginas públicas como exportação estática;
- executar somente rotas `/api/*` em um Cloudflare Worker;
- usar Neon Free como PostgreSQL inicial;
- conectar o Worker ao Neon por Cloudflare Hyperdrive;
- acessar o banco por Drizzle ORM e Postgres.js;
- manter `/api/quote` desativado até existirem banco, binding, retenção aprovada, proteção contra abuso e conteúdo jurídico revisado.

Essa combinação preserva a stack PostgreSQL já aprovada e permite iniciar sem mensalidade. Nenhum projeto Neon, binding Hyperdrive, segredo ou banco foi criado nesta etapa.

## Substituição

A arquitetura de Worker, Drizzle e Hyperdrive foi preservada, mas o provedor PostgreSQL escolhido na
implementação foi a Aiven. O estado operacional e o isolamento do preview estão registrados no
[ADR 0004](0004-aiven-and-preview-isolation.md).

## Consequências

- os assets estáticos continuam independentes do endpoint dinâmico;
- o plano gratuito não oferece SLA empresarial e deverá ser monitorado;
- o primeiro envio real dependerá de rate limiting, honeypot, Turnstile e validação no servidor;
- a política de retenção precisa definir o valor de `retention_expires_at` antes da ativação;
- crescimento além dos limites gratuitos exigirá aprovação de custo ou migração planejada.

## Referências

- [Cloudflare Workers — preços](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Workers — Neon e Hyperdrive](https://developers.cloudflare.com/workers/databases/third-party-integrations/neon/)
- [Neon — preços](https://neon.com/pricing)
- [Neon — termos da plataforma](https://neon.com/platform-terms)
