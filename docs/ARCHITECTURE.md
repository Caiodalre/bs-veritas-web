# Arquitetura do B&S Veritas Web

Este documento registra a arquitetura inicial aprovada para o site institucional e comercial da **B&S VERITAS CORRETORA DE SEGUROS LTDA**.

O documento distingue o estado operacional atual das evoluções ainda planejadas.

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
      fila de notificação
           |
           v
      notificação comercial
```

O preview utiliza somente os arquivos estáticos gerados pelo Next.js. O formulário permanece visível para revisão, mas desativado, e o Worker recusa `POST /api/quote` antes de qualquer integração.

A camada dinâmica é um Cloudflare Worker restrito às rotas `/api/*`, com PostgreSQL da Aiven conectado por Hyperdrive. O endpoint de cotação está ativo somente em produção, protegido por rate limiting, validação Zod, honeypot e Turnstile.
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

O Worker recebe as requisições externas da API e coordena validação, proteção contra abuso e chamada do serviço correto. As páginas continuam exportadas como assets estáticos.

### Validação e segurança

O fluxo valida e normaliza os campos com Zod, restringe modalidades ao catálogo, inclui honeypot, aplica rate limiting e valida o token Turnstile no servidor antes da persistência.

### Serviços

O serviço local de cotação já define o caso de uso de registrar um pedido validado. A política da cotação usa a versão `1.1` e calcula a expiração em cinco anos corridos a partir do recebimento, conforme a decisão de retenção aprovada. Serviços não dependem de componentes React nem conhecem detalhes visuais.

### Repositórios

O contrato do repositório de cotação concentra a gravação do lead. O adaptador Drizzle tipado executa o `insert` por Hyperdrive e retorna somente o identificador criado. As migrations estão aplicadas e o papel da aplicação não pode ler os demais campos, alterar ou excluir registros.

### Infraestrutura

Inclui PostgreSQL, Drizzle ORM, Cloudflare Queues, notificações por e-mail, analytics e integrações externas. Cada fornecedor deverá ficar atrás de uma interface local quando houver possibilidade real de substituição.

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

O formulário do V1 possui uma única etapa e coleta apenas os dados necessários:

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
                  -> enfileirar identificador da cotação
                     -> enviar notificação à equipe
```

A indisponibilidade do serviço de e-mail não apaga um lead já registrado. A fila transporta somente o UUID da cotação, tenta novamente com espera progressiva e encaminha falhas esgotadas para uma fila de mensagens mortas. A entrega é pelo menos uma vez; por isso, uma notificação duplicada é possível e pode ser reconhecida pelo mesmo UUID.

## Dados e privacidade

O formulário público não solicitará CPF, RG, CNH, dados bancários, dados de cartão, renda, documentos, informações médicas ou dados completos de apólices.

Regras obrigatórias:

- não registrar dados pessoais em logs;
- não enviar dados pessoais para analytics;
- não usar dados reais em testes ou previews;
- não colocar dados pessoais na URL do WhatsApp;
- avisar o visitante para não escrever informações sensíveis na mensagem;
- registrar a versão da política de privacidade aplicável ao lead;
- aplicar a política de retenção aprovada de cinco anos e a versão correspondente da Política de Privacidade.

## Banco de dados

O PostgreSQL será acessado somente pelo backend da aplicação. O navegador não receberá credenciais administrativas nem permissão irrestrita de escrita.

O schema registra somente os campos aprovados para cotação, a versão da política e a expiração de retenção. As migrations PostgreSQL estão versionadas e aplicadas na Aiven. A produção acessa o banco pelo binding Hyperdrive; o preview não recebe esse binding.

A rotina de descarte preparada para produção executa diariamente às `06:17 UTC`. O Worker chama uma
função PostgreSQL que exclui somente registros vencidos, em lotes de até 500, usando o índice de
`retention_expires_at` e `SKIP LOCKED`. O papel da aplicação recebe apenas `EXECUTE` nessa função e
continua sem permissão direta de `DELETE`.

## Configuração e segredos

- segredos existem apenas em variáveis de ambiente locais ou bindings da plataforma;
- arquivos `.env` reais não serão versionados;
- variáveis obrigatórias serão validadas ao iniciar a aplicação;
- ambientes local, preview e produção terão configurações separadas;
- a produção falha de forma fechada quando um binding obrigatório está ausente;
- o preview não possui bindings de banco, fila, e-mail, rate limiter nem segredo Turnstile.

## Segurança HTTP

As respostas atuais utilizam:

- Content Security Policy;
- Strict Transport Security;
- X-Content-Type-Options;
- Referrer Policy;
- Permissions Policy;
- proteção contra submissões repetidas e automação abusiva.

A política de segurança não deverá liberar domínios externos sem necessidade comprovada.

## Renderização e desempenho

A hospedagem mantém a exportação estática no Cloudflare Workers Static Assets. O Worker atende os assets e intercepta somente os pontos de entrada dinâmicos aprovados.

- Server Components por padrão;
- JavaScript no cliente somente quando necessário;
- imagens e fontes otimizadas;
- scripts de terceiros limitados;
- páginas públicas preparadas para SEO;
- experiência mobile considerada desde o primeiro componente;
- domínio canônico `https://bsveritas.com.br`.

O ambiente de preview deverá permanecer fora da indexação de buscadores.

## Testes e entrega

As alterações deverão ser verificadas proporcionalmente ao risco com:

- TypeScript e build do Next.js;
- ESLint;
- testes unitários e de componentes com Vitest;
- testes de jornada com Playwright;
- revisão do diff antes da integração na `main`.

O fluxo de entrega é:

```text
branch de trabalho
   -> verificações locais
      -> revisão
         -> integração na main
            -> preview ou produção
```

Não haverá edição manual de arquivos em produção.

## Pendências atuais

- acompanhar a primeira execução agendada e registrar evidência operacional da rotina diária de descarte;
- homologar o consumo da fila e o tratamento da fila de mensagens mortas em produção;
- concluir MFA e responsáveis administrativos nas plataformas;
- definir um canal específico para incidentes e vulnerabilidades;
- obter revisão jurídica independente do conteúdo publicado;
- decidir se analytics sem dados pessoais será necessário; até lá, permanece desativado;
