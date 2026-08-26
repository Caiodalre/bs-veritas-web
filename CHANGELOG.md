# Changelog

Este arquivo registra mudanças relevantes do **B&S Veritas Web**.

O projeto ainda não possui uma versão pública nem um deploy de produção. Até o primeiro lançamento, as mudanças permanecerão na seção **Não lançado** e os marcos internos serão identificados explicitamente.

## Não lançado

### Adicionado

- documentação inicial do propósito, escopo, stack e execução no `README.md`;
- arquitetura e limites do V1 em `docs/ARCHITECTURE.md`;
- política e checklist de segurança em `docs/SECURITY.md`;
- definição dos ambientes em `docs/ENVIRONMENT.md`;
- procedimento planejado de preview, produção e rollback em `docs/DEPLOYMENT.md`;
- padrões de contribuição e revisão em `CONTRIBUTING.md`;
- este changelog.

### Alterado

- substituição do README genérico criado pelo Next.js pela documentação específica do projeto.

### Observações

- mudanças desta seção estão na branch `codex/documentation` até serem revisadas e integradas;
- nenhuma integração externa, credencial ou configuração de produção foi adicionada;
- nenhuma versão pública foi publicada.

## Fundação técnica — 2026-08-25

Marco interno já integrado à `main`. Não representa lançamento público.

### Adicionado

- aplicação Next.js `16.3.2` com App Router;
- React `19.2.8`;
- TypeScript em modo estrito;
- Tailwind CSS `4.3.3`;
- ESLint;
- pnpm `11.3.0` e lockfile;
- regras do repositório em `AGENTS.md`;
- estrutura inicial da aplicação em `src/`;
- teste básico da interface.

Commit relacionado: `80784ba` (`chore: bootstrap Next.js project`).

### Testes unitários e de componentes

- Vitest `4.1.11`;
- React Testing Library;
- ambiente jsdom;
- configuração de testes restrita aos arquivos de teste em `src/`.

Commit relacionado: `7418ee2` (`test: configure Vitest`).

### Testes de jornada

- Playwright `1.62.1`;
- projeto Chromium;
- configuração do servidor web para testes;
- smoke test inicial da Home.

Commit relacionado: `3019225` (`test: configure Playwright`).

### Fundação de dados

- Drizzle ORM `0.45.2`;
- Drizzle Kit `0.31.10`;
- driver PostgreSQL `postgres` `3.4.9`;
- configuração inicial do Drizzle;
- arquivo de schema vazio, sem tabelas de produção;
- scripts de instalação do pnpm restritos aos pacotes revisados.

Commit relacionado: `a69ba17` (`chore: configure Drizzle foundation`).

### Validação do marco

Foram executados com sucesso:

- ESLint;
- Vitest;
- Playwright com Chromium;
- build do Next.js e verificação do TypeScript.

### Fora deste marco

Não foram configurados:

- repositório remoto;
- integração contínua;
- Vercel;
- Cloudflare;
- PostgreSQL remoto;
- variáveis de ambiente reais;
- formulários funcionais;
- analytics;
- domínio de produção;
- serviço de notificações.

## Como manter este arquivo

- registrar mudanças relevantes primeiro em **Não lançado**;
- separar adições, alterações, correções, remoções e segurança quando aplicável;
- não registrar como concluído um recurso apenas planejado;
- não incluir segredos, dados pessoais ou detalhes exploráveis de vulnerabilidades abertas;
- criar uma seção versionada somente quando houver uma versão aprovada;
- usar versionamento semântico quando o processo de releases for definido;
- registrar data, revisão e eventuais migrations em lançamentos de produção.
