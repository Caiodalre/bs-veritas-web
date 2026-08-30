# Arquitetura do B&S Veritas Web

Este documento registra a arquitetura inicial aprovada para o site institucional e comercial da **B&S VERITAS CORRETORA DE SEGUROS LTDA**.

O projeto está em construção. Os componentes descritos como planejados ainda não devem ser considerados ativos em produção.

## Objetivos arquiteturais

- apresentar a corretora e seus seguros com boa experiência em dispositivos móveis;
- gerar leads por cotação, contato e WhatsApp;
- manter dados pessoais protegidos e coletar somente o necessário;
- separar interface, regras de negócio, persistência e serviços externos;
- permitir evolução futura sem acoplar o site a um único fornecedor;
- manter alterações testáveis, versionadas e implantadas por um fluxo controlado.

## Limites do V1

O V1 não terá:

- autenticação de clientes;
- painel administrativo público;
- upload de documentos;
- cotação completa ou subscrição de seguros;
- CRM completo;
- escrita direta do navegador no banco de dados;
- integração direta com sistemas de seguradoras.

## Contexto do sistema

```text
Visitante
   |
   v
Cloudflare
DNS, CDN, SSL e proteção de borda
   |
   v
Cloudflare Workers Static Assets
Next.js com exportação estática
   |
   +--> páginas institucionais
   |
   +--> cotação e contato
           |
           v
      validação no servidor
           |
           v
      proteção contra abuso
           |
           v
      serviço de aplicação
           |
           v
      repositório Drizzle
           |
           v
      PostgreSQL
           |
           v
      notificação comercial
```

O preview atual utiliza somente os arquivos estáticos gerados pelo Next.js e não processa formulários nem dados pessoais.

A camada dinâmica foi definida como um Cloudflare Worker restrito às rotas `/api/*`, com Neon PostgreSQL conectado por Hyperdrive. O endpoint de cotação permanece desativado até que todos os controles necessários sejam aprovados.
A decisão completa está registrada em [`docs/decisions/0001-quote-runtime-and-database.md`](decisions/0001-quote-runtime-and-database.md).

O e-mail corporativo é uma infraestrutura independente. A troca do provedor de e-mail não deve exigir reconstrução do site.

## Camadas da aplicação

O fluxo de dependências seguirá esta direção:

```text
Interface
   -> Action ou Route Handler
      -> Validação e segurança
         -> Serviço
            -> Repositório
               -> Banco de dados
```

### Interface

Responsável por páginas, componentes, formulários e estados visuais. Server Components serão usados por padrão. Client Components serão reservados para interações que realmente dependam do navegador.

### Pontos de entrada

Server Actions ou Route Handlers receberão requisições externas. Eles coordenarão autenticação quando aplicável, validação, proteção contra abuso e chamada do serviço correto.

### Validação e segurança

A fundação local valida e normaliza os campos com Zod, restringe modalidades ao catálogo e inclui honeypot. A ativação ainda depende de rate limiting, Cloudflare Turnstile e nova validação no servidor antes da persistência.

### Serviços

Serviços representarão casos de uso, como registrar um pedido de cotação. Eles não devem depender de componentes React nem conhecer detalhes visuais.

### Repositórios

Repositórios concentrarão operações de persistência. O restante da aplicação não deverá espalhar consultas ao banco por páginas e componentes.

### Infraestrutura

Inclui PostgreSQL, Drizzle ORM, notificações por e-mail, analytics e integrações externas. Cada fornecedor deverá ficar atrás de uma interface local quando houver possibilidade real de substituição.

## Domínios funcionais

A organização prevista é orientada aos seguintes domínios:

- `quote`: solicitação de cotação e registro do lead;
- `contact`: contato geral e encaminhamento do assunto;
- `insurance`: catálogo e páginas das modalidades de seguro;
- `partners`: seguradoras parceiras confirmadas;
- `claims`: conteúdo de orientação e canais para sinistros.

A área de sinistros não deverá solicitar documentos ou dar a entender que a corretora regula ou paga o sinistro. O papel apresentado será de suporte e orientação.

## Estrutura de código pretendida

Esta é uma direção arquitetural, não uma obrigação de criar pastas vazias antecipadamente:

```text
src/
|-- app/                 rotas, layouts e pontos de entrada
|-- components/
|   |-- ui/              componentes básicos reutilizáveis
|   |-- layout/          header, footer e navegação
|   `-- sections/        seções institucionais
|-- features/
|   |-- quote/
|   |-- contact/
|   |-- insurance/
|   |-- partners/
|   `-- claims/
|-- config/              site, navegação e contatos
|-- db/                  schema e acesso ao banco
`-- lib/                 utilitários compartilhados e integrações
```

Uma pasta somente será criada quando houver código real que justifique sua existência.

## Fluxo de cotação

O formulário do V1 terá uma única etapa e coletará apenas os dados necessários:

- nome completo;
- telefone ou WhatsApp;
- e-mail;
- tipo de seguro;
- cidade opcional;
- mensagem opcional.

O processamento seguirá esta ordem:

```text
receber solicitação
   -> validar no servidor
      -> aplicar proteção contra abuso
         -> normalizar dados
            -> gravar o lead
               -> confirmar a gravação
                  -> solicitar notificação à equipe
```

A indisponibilidade do serviço de e-mail não deve apagar um lead já registrado. A estratégia de nova tentativa da notificação será definida durante a implementação dessa integração.

## Dados e privacidade

O formulário público não solicitará CPF, RG, CNH, dados bancários, dados de cartão, renda, documentos, informações médicas ou dados completos de apólices.

Regras obrigatórias:

- não registrar dados pessoais em logs;
- não enviar dados pessoais para analytics;
- não usar dados reais em testes ou previews;
- não colocar dados pessoais na URL do WhatsApp;
- avisar o visitante para não escrever informações sensíveis na mensagem;
- registrar a versão da política de privacidade aplicável ao lead;
- definir uma política de retenção antes da produção.

## Banco de dados

O PostgreSQL será acessado somente pelo backend da aplicação. O navegador não receberá credenciais administrativas nem permissão irrestrita de escrita.

O schema local inicial registra somente os campos aprovados para cotação, a versão da política e a expiração de retenção. Nenhuma migration foi aplicada e a conexão real ainda não existe.

## Configuração e segredos

- segredos existirão apenas em variáveis de ambiente locais ou da plataforma;
- arquivos `.env` reais não serão versionados;
- variáveis obrigatórias serão validadas ao iniciar a aplicação;
- ambientes local, preview e produção terão configurações separadas;
- nenhuma credencial real será adicionada antes da configuração do respectivo serviço.

## Segurança HTTP

As políticas serão ajustadas aos serviços efetivamente utilizados. Estão planejados:

- Content Security Policy;
- Strict Transport Security;
- X-Content-Type-Options;
- Referrer Policy;
- Permissions Policy;
- proteção contra submissões repetidas e automação abusiva.

A política de segurança não deverá liberar domínios externos sem necessidade comprovada.

## Renderização e desempenho

A hospedagem mantém a exportação estática no Cloudflare Workers Static Assets. Um Worker separado no mesmo projeto atenderá somente os pontos de entrada dinâmicos aprovados.

- Server Components por padrão;
- JavaScript no cliente somente quando necessário;
- imagens e fontes otimizadas;
- scripts de terceiros limitados;
- páginas públicas preparadas para SEO;
- experiência mobile considerada desde o primeiro componente;
- domínio canônico planejado como `https://bsveritas.com.br`.

O ambiente de preview deverá permanecer fora da indexação de buscadores.

## Testes e entrega

As alterações deverão ser verificadas proporcionalmente ao risco com:

- TypeScript e build do Next.js;
- ESLint;
- testes unitários e de componentes com Vitest;
- testes de jornada com Playwright;
- revisão do diff antes da integração na `main`.

O fluxo de entrega planejado é:

```text
branch de trabalho
   -> verificações locais
      -> revisão
         -> integração na main
            -> preview ou produção
```

Não haverá edição manual de arquivos em produção.

## Decisões ainda pendentes

- provedor definitivo de e-mail e notificações;
- criação do projeto Neon, credenciais e binding Hyperdrive;
- estratégia e valores de rate limiting;
- política de retenção dos leads;
- conteúdo jurídico revisado;
- contatos corporativos reais;
- seguradoras parceiras confirmadas;
- configuração final de analytics e cookies;
- regras finais de Content Security Policy.

Esses pontos serão decididos e documentados antes da respectiva implementação.
