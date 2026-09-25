# Changelog

Este arquivo registra mudanças relevantes do **B&S Veritas Web**.

O projeto possui produção no domínio oficial com formulário de cotação ativo e um preview público não
indexável, sem acesso ao banco ou às integrações de produção.

## Cotação em produção e isolamento do preview — 2026-09-19

### Alterado

- formulário de cotação ativado no domínio oficial com validação no servidor, honeypot, Turnstile e
  rate limiting;
- persistência conectada ao PostgreSQL da Aiven por Hyperdrive com usuário de menor privilégio;
- notificação comercial enviada somente após a persistência;
- preview removido dos bindings de Hyperdrive, e-mail, rate limiter e segredo Turnstile;
- API do preview configurada para falhar de forma fechada antes de qualquer integração;
- formulário do preview mantido visível para revisão, porém desativado e com orientação ao visitante;
- documentação técnica alinhada ao estado operacional e ADR da Aiven adicionado.

### Validação

- fluxo completo confirmado com registro no banco e recebimento do e-mail;
- CI, 122 testes unitários/componentes, 26 testes de navegador e build aprovados;
- monitor de produção, API, Turnstile, layout móvel e ausência de Cloudflare Insights verificados;
- PR #51 mesclado no commit `7dcbb5f4c9f745602a35879d46adc825a402928e`;
- versão Cloudflare `65ca2b79-30a0-41b6-8e9d-5f5f8ea3fb3b` publicada.

## Não lançado

### Adicionado

- rotina diária de descarte de cotações vencidas, limitada a 500 registros por execução;
- função PostgreSQL protegida com privilégio mínimo, tempo limite e concorrência sem bloqueio;
- Cron Trigger exclusivo de produção, desativado explicitamente no preview;
- cobertura da migration e dos estados de sucesso, desativação e falha do agendamento;
- fila assíncrona de notificações comerciais com novas tentativas progressivas e fila de mensagens mortas;
- mensagens da fila limitadas ao UUID da cotação, sem dados pessoais;
- cobertura unitária de sucesso, falha, binding ausente e mensagem inválida no consumidor da fila;
- carrossel acessível e responsivo com Porto Seguro, Petlove, Icatu e Bradesco Seguros como parceiros comerciais confirmados;
- logotipos oficiais hospedados localmente, sem requisições ou rastreamento pelos sites das marcas;
- atalhos de navegação, texto de atribuição e cobertura E2E das quatro marcas.

### Observações

- o preview continua sem acesso a banco, fila, e-mail, rate limiter ou segredo Turnstile;
- a rotina de descarte exige aplicar a migration antes de publicar o Cron Trigger;
- a entrega da fila é pelo menos uma vez e uma notificação duplicada pode ocorrer em caso de nova tentativa;
- a disponibilidade de produtos permanece condicionada ao perfil, à região e às regras de cada empresa;
- nenhuma dependência npm, coleta adicional de dados pessoais ou plano pago foi adicionado.

## Publicação da Política de Cookies — 2026-09-13

### Adicionado

- página de Política de Cookies com inventário atual, categorias não utilizadas, transparência sobre mecanismos necessários da infraestrutura e regras para futuras escolhas;
- link para a política no rodapé, referência cruzada na Política de Privacidade e inclusão da rota no sitemap;
- testes da página, do inventário, do canal de contato, do sitemap e do layout mobile.

### Observações

- a implementação foi confrontada com o código e com a resposta HTTP normal de produção, que não define cookies atualmente;
- a revisão jurídica independente da redação continua recomendada;
- nenhum banner, cookie, analytics, dependência, serviço externo ou custo foi adicionado.

### Publicação

- commit `e10d5d7ac419cda82f6102803a7397a595ab25d7` promovido para produção;
- versão Cloudflare `c8e5eea2-047c-4273-b0df-09205cb0bc44` direcionada para 100% do tráfego;
- página inicial, Política de Cookies, Política de Privacidade, sitemap e redirecionamento `www` aprovados nos smoke tests HTTP;
- produção permaneceu indexável e sem cabeçalho `Set-Cookie` nas respostas verificadas;
- versão anterior `1491f9cb-47cc-4aa9-bd78-7576b180cc19` preservada para rollback.

## Publicação dos Termos de Uso — 2026-09-13

### Adicionado

- página de Termos de Uso com finalidade institucional, limites do conteúdo, condições gerais de atendimento, uso adequado, privacidade e preservação dos direitos do consumidor;
- link para os termos no rodapé e inclusão da rota no sitemap;
- testes da página, do canal de contato, do sitemap e do layout mobile.

### Observações

- a revisão jurídica independente da redação continua recomendada;
- nenhuma coleta de dados, dependência, serviço externo ou custo foi adicionado.

### Publicação

- commit `84c86d7b5fda42319ea5dc6e54645a072f55530f` promovido para produção;
- versão Cloudflare `1491f9cb-47cc-4aa9-bd78-7576b180cc19` direcionada para 100% do tráfego;
- página inicial, contato, Política de Privacidade, Termos de Uso e sitemap aprovados nos smoke tests HTTP;
- preview permaneceu protegido com `noindex` e a produção permaneceu indexável;
- versão anterior preservada para rollback.

## Publicação da política e contato — 2026-09-13

### Adicionado

- Política de Privacidade com identificação do controlador, práticas atuais, finalidades, bases legais, critérios de retenção, compartilhamentos, direitos dos titulares e canal de atendimento;
- link institucional no rodapé e inclusão da nova rota no sitemap;
- testes da página, do canal de privacidade, do sitemap e do layout mobile.

### Alterado

- botão principal do cabeçalho renomeado para “Fale conosco”, com acesso à página que reúne e-mail e telefone acionáveis;
- testes de jornada ampliados para validar o botão e os destinos oficiais de e-mail e telefone.

### Publicação

- commit `53e3043f85602434da99f637357a925f3bce0017` promovido para produção;
- versão Cloudflare `604177f0-48c8-4121-b39e-0592ba5ae72f` direcionada para 100% do tráfego;
- página inicial, contato, Política de Privacidade e sitemap aprovados nos smoke tests HTTP;
- preview permaneceu protegido com `noindex` e a produção permaneceu indexável;
- nenhuma migration, credencial, banco ou serviço pago foi adicionado.

## Cadastro no Google Search Console — 2026-09-12

- propriedade de domínio `bsveritas.com.br` verificada por registro DNS;
- sitemap canônico `https://bsveritas.com.br/sitemap.xml` enviado e processado;
- página inicial aprovada no teste em tempo real e encaminhada para indexação;
- nenhuma ferramenta de analytics, cookie ou serviço pago foi ativado.

## Publicação dos dados estruturados — 2026-09-09

- commit d4e2b13508037bde83cbd3218c69e162f5d544a0 promovido para produção;
- versão Cloudflare 973fba95-a92b-47c4-96ce-801411a87ca1 direcionada para 100% do tráfego;
- JSON-LD Organization e WebSite validado no domínio canônico;
- sete rotas públicas, redirecionamento www e cabeçalhos de segurança aprovados;
- nenhuma migration, credencial, banco ou serviço pago foi adicionado.

## Dados estruturados para buscadores — 2026-09-08

### Adicionado

- JSON-LD do tipo `Organization` com identificação e canais oficiais já exibidos no site;
- JSON-LD do tipo `WebSite` associado à organização;
- serialização que neutraliza caracteres capazes de encerrar a tag `script`;
- testes dos dados publicados e da proteção da serialização.

## Monitoramento automático — 2026-09-07

### Adicionado

- workflow `Production monitor` preparado para execução a cada seis horas, no minuto 17, e sob demanda;
- verificações das páginas públicas, `robots.txt`, sitemap, cabeçalhos de segurança, redirecionamento `www` e proteção do preview;
- validação da cadeia DNSSEC por dois resolvedores e dos registros MX, SPF, DKIM e DMARC;
- tentativas controladas, timeout e relatório agregado das falhas;
- execução sem segredos e sem dependências adicionais.

### Operação

- o agendamento passa a valer somente após entrada na branch padrão;
- alertas de falha dependem das preferências de notificação do GitHub;
- para assegurar custo zero, a conta deve bloquear uso pago do GitHub Actions ao atingir o limite gratuito.

## Proteção DNSSEC — 2026-09-07

### Segurança

- registro DS da Cloudflare publicado no Registro.br;
- cadeia DNSSEC validada pelo Cloudflare DNS e pelo Google Public DNS;
- respostas `A` e `MX` autenticadas com `AD=true`;
- site, redirecionamento `www` e registros MX, SPF, DKIM e DMARC preservados após a ativação.

## Lançamento público inicial — 2026-09-01

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
- redirecionamento canônico ativo de `www` para o domínio principal por regra gratuita da Cloudflare;
- domínio principal ativo como Custom Domain do Worker;
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

- a produção está disponível em `https://bsveritas.com.br` no commit `70feb0c`;
- a versão Cloudflare da publicação inicial é `7268ae1e-433d-4ee3-ae63-030801a74ec1`;
- a URL `workers.dev` permanece somente como preview com `noindex`;
- ESLint `10.9.1` foi avaliado e rejeitado porque os plugins atuais do Next.js ainda exigem ESLint 9; a versão compatível `9.39.5` permanece fixada;
- GitHub, CI, Cloudflare Workers e domínio personalizado estão ativos sem credenciais versionadas;
- banco, formulários, analytics e integrações dinâmicas de produção ainda não estão configurados;
- nenhuma migration foi aplicada na publicação inicial;
- smoke tests confirmaram produção `200`, preview `200`, `www` com `301`, `robots.txt`, sitemap e registros de e-mail preservados;
- a cadeia DNSSEC foi concluída em 2026-09-07 com a publicação do DS no Registro.br;
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
