# B&S Veritas Web

Site institucional e comercial da **B&S VERITAS CORRETORA DE SEGUROS LTDA**.

O projeto tem como objetivos transmitir confiança, apresentar a corretora e seus seguros e gerar oportunidades comerciais por meio de cotação, contato e WhatsApp. O domínio planejado para produção é `bsveritas.com.br`.

## Estado atual

O projeto está na fase de fundação técnica. A aplicação ainda não possui integrações de produção, credenciais, dados reais ou conteúdo institucional definitivo.

Já estão configurados:

- Next.js com App Router;
- React e TypeScript em modo estrito;
- Tailwind CSS;
- Vitest e React Testing Library;
- Playwright com Chromium;
- fundação do Drizzle ORM para PostgreSQL;
- ESLint e pnpm.

## Documentação

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): arquitetura, camadas e limites do V1;
- [`docs/SECURITY.md`](./docs/SECURITY.md): riscos, controles e checklist de segurança;
- [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md): ambientes, ferramentas e execução local;
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md): preview, produção, smoke tests e rollback;
- [`CONTRIBUTING.md`](./CONTRIBUTING.md): padrões de desenvolvimento e revisão;
- [`CHANGELOG.md`](./CHANGELOG.md): marcos e alterações relevantes;
- [`AGENTS.md`](./AGENTS.md): regras obrigatórias para agentes de desenvolvimento.

## Escopo inicial

O V1 prevê as seguintes áreas:

- Home;
- Sobre;
- Seguros e páginas de cada modalidade;
- Seguradoras parceiras;
- Sinistros;
- Cotação;
- Contato;
- Política de Privacidade;
- Política de Cookies;
- Termos de Uso.

Não fazem parte do V1: área autenticada, upload de documentos, CRM completo ou cotação integral dentro do site.

## Requisitos locais

O ambiente inicial foi validado com:

- Node.js `24.12.0`;
- pnpm `11.3.0`;
- Corepack `0.34.5`;
- Git `2.54.0.windows.1`.

## Execução local

Instale as dependências:

```bash
pnpm install
```

Inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000).

## Verificações

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Na primeira execução local dos testes E2E, pode ser necessário instalar o navegador:

```bash
pnpm exec playwright install chromium
```

## Princípios do projeto

- Server Components por padrão;
- validação no servidor para dados externos;
- nenhuma credencial ou segredo versionado;
- nenhuma coleta desnecessária de dados pessoais;
- nenhum dado real em testes ou ambientes de preview;
- componentes reutilizáveis e identidade visual centralizada;
- acessibilidade, desempenho e experiência mobile como requisitos;
- alterações verificadas antes de integração na `main`.

As regras completas de desenvolvimento estão em [`AGENTS.md`](./AGENTS.md).

## Infraestrutura planejada

- Vercel para aplicação e previews;
- Cloudflare para DNS, segurança e Turnstile;
- PostgreSQL, inicialmente por infraestrutura Supabase;
- GitHub para repositório e integração contínua.

Esses serviços ainda serão configurados em etapas separadas e aprovadas.
