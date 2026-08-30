# B&S Veritas Web

Site institucional e comercial da **B&S VERITAS CORRETORA DE SEGUROS LTDA**.

O projeto tem como objetivos transmitir confiança, apresentar a corretora e seus seguros e gerar oportunidades comerciais por meio de cotação, contato e WhatsApp. O domínio planejado para produção é `bsveritas.com.br`.

## Estado atual

O projeto está na construção da experiência pública. O repositório privado e a integração contínua estão ativos, e uma versão de preview está publicada na Cloudflare Workers Static Assets.

O domínio de produção ainda não foi conectado. A aplicação não coleta dados, não possui banco remoto e não utiliza credenciais de produção.

Já estão configurados:

- Next.js com App Router;
- React e TypeScript em modo estrito;
- Tailwind CSS;
- Vitest e React Testing Library;
- Playwright com Chromium;
- fundação do Drizzle ORM para PostgreSQL;
- ESLint, Prettier e pnpm;
- repositório privado no GitHub e CI remoto ativo;
- exportação estática e preview público com `noindex` na Cloudflare Workers;
- página inicial institucional responsiva;
- página Sobre com propósito, princípios e forma de atendimento;
- catálogo de seguros e páginas estáticas das modalidades atendidas;
- página de Sinistros com primeiros cuidados, limites e orientação segura;
- página de Contato com canais públicos e sem formulário ou coleta direta de dados;
- sitemap e `robots.txt` canônicos, além de página 404 personalizada.

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
pnpm format:check
pnpm typecheck
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

## Infraestrutura atual e planejada

- Cloudflare Workers Static Assets para preview e hospedagem inicial;
- Cloudflare para DNS, CDN, SSL e Turnstile quando os formulários existirem;
- PostgreSQL, inicialmente por infraestrutura Supabase;
- GitHub para repositório e integração contínua.

O GitHub, o CI e o preview da Cloudflare já estão configurados. O domínio, o banco, os formulários e os serviços de notificação continuam pendentes e serão tratados em etapas separadas.

O plano gratuito Hobby da Vercel não será utilizado porque restringe o uso a projetos pessoais e não comerciais. Qualquer futura mudança de hospedagem exigirá compatibilidade com uso empresarial sem custo ou aprovação explícita de um plano pago.
