# Changelog

Este arquivo registra mudanças relevantes do **B&S Veritas Web**.

O projeto possui um preview público não indexável, mas ainda não possui domínio conectado nem lançamento de produção. Até o primeiro lançamento, as mudanças permanecerão na seção **Não lançado** e os marcos internos serão identificados explicitamente.

## Não lançado

### Adicionado

- página inicial institucional responsiva com identidade visual própria;
- página institucional Sobre com propósito e princípios de atendimento;
- componentes reutilizáveis de navegação, layout, marca textual e botões;
- catálogo público de seguros e páginas estáticas para cada modalidade;
- navegação e metadados específicos para as páginas de seguros;
- página pública de Sinistros com orientação inicial e responsabilidades claramente delimitadas;
- página pública de Contato com e-mail, telefone, WhatsApp e identificação empresarial;
- `robots.txt` de produção com rastreamento permitido e referência ao sitemap canônico;
- sitemap das rotas públicas e página 404 personalizada;
- testes de interface e de jornada para a experiência pública;
- cobertura E2E de todas as páginas de modalidades e de suas entradas no sitemap;
- política CSP para páginas estáticas, HSTS restrito aos hosts oficiais e cabeçalhos defensivos na API;
- procedimento de redirecionamento canônico de `www` para o domínio principal por regra gratuita da Cloudflare;
- documentação inicial do propósito, escopo, stack e execução no `README.md`;
- arquitetura e limites do V1 em `docs/ARCHITECTURE.md`;
- política e checklist de segurança em `docs/SECURITY.md`;
- definição dos ambientes em `docs/ENVIRONMENT.md`;
- procedimento planejado de preview, produção e rollback em `docs/DEPLOYMENT.md`;
- padrões de contribuição e revisão em `CONTRIBUTING.md`;
- Prettier com configuração e comandos reproduzíveis;
- comando independente de typecheck com geração prévia dos tipos do Next.js;
- workflow de CI com formatação, tipos, lint, testes, build e Playwright;
- repositório privado no GitHub com CI remoto validado;
- política de finais de linha reproduzível em `.gitattributes`;
- exportação estática e configuração da Cloudflare Workers Static Assets;
- decisão arquitetural para Cloudflare Worker, Hyperdrive e Neon PostgreSQL;
- schema local inicial de solicitações de cotação, sem banco ou migration aplicada;
- endpoint `/api/quote` desativado por padrão, sem coleta de dados;
- validação local com Zod, normalização, modalidades permitidas e honeypot;
- serviço local de cotação com política explícita e contrato de repositório, sem persistência ativa;
- adaptador local Drizzle para solicitações de cotação, sem conexão ou migration aplicada;
- migration PostgreSQL inicial do schema de cotação, gerada e revisada sem aplicação em banco;
- preview público na Cloudflare com cabeçalho `X-Robots-Tag: noindex`;
- este changelog.

### Alterado

- substituição do README genérico criado pelo Next.js pela documentação específica do projeto.

### Observações

- o projeto permanece sem lançamento de produção; a URL `workers.dev` é somente preview;
- ESLint `10.9.1` foi avaliado e rejeitado porque os plugins atuais do Next.js ainda exigem ESLint 9; a versão compatível `9.39.5` permanece fixada;
- GitHub, CI e Cloudflare Workers estão ativos sem credenciais versionadas;
- domínio personalizado, banco, formulários e integrações de produção ainda não estão configurados;
- a Vercel Hobby foi excluída da arquitetura gratuita por restringir o uso a projetos pessoais e não comerciais.

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
