# Ambientes do B&S Veritas Web

Este documento descreve como o projeto deve ser executado e configurado nos ambientes local, preview e produção.

O GitHub, o CI, um preview sem indexação e a produção estão ativos. A produção possui os bindings privados necessários ao formulário de cotação; o preview não recebe acesso ao banco, fila, e-mail, rate limiter nem ao segredo do Turnstile.

## Ambientes previstos

```text
local
   -> preview
      -> produção
```

### Local

Usado para desenvolvimento e verificações na máquina do desenvolvedor.

- pode utilizar apenas dados fictícios;
- não deve acessar serviços ou dados de produção;
- segredos locais permanecem fora do Git;
- erros podem ter detalhes suficientes para desenvolvimento, sem registrar dados pessoais.

### Preview

Usado para revisão antes da produção. O alias estável atual é `https://quote-preview-bs-veritas-web-preview.caio-dalre.workers.dev`.

- possui configuração separada de produção;
- não utiliza dados reais;
- envia `X-Robots-Tag: noindex`;
- permanece fora da indexação de buscadores;
- não é o domínio oficial de produção;
- o formulário permanece visível, mas desativado e acompanhado de uma explicação;
- não possui bindings de Hyperdrive, e-mail, rate limiter ou segredo Turnstile;
- `POST /api/quote` falha de forma fechada antes de qualquer integração externa.

### Produção

Usado exclusivamente pelo domínio público aprovado e ativo.

- domínio canônico: `https://bsveritas.com.br`;
- páginas estáticas e endpoint `/api/quote` no mesmo Worker;
- PostgreSQL acessado somente pelo Worker por Hyperdrive;
- Turnstile, rate limiting e notificação por e-mail ativos no fluxo de cotação;
- logs sem dados pessoais;
- rollback disponível pelas versões anteriores do Worker;
- monitoramento automatizado configurado no GitHub Actions para execução a cada seis horas;
- alertas seguem as preferências da conta e o uso pago do Actions deve permanecer bloqueado;
- alterações somente por código versionado e fluxo de implantação aprovado.

## Ambiente local validado

A fundação foi criada e testada com:

| Ferramenta | Versão validada                          |
| ---------- | ---------------------------------------- |
| Windows    | Windows 11 Pro for Workstations, 64 bits |
| Node.js    | `24.12.0`                                |
| pnpm       | `11.3.0`                                 |
| Corepack   | `0.34.5`                                 |
| Git        | `2.54.0.windows.1`                       |

O gerenciador declarado em `package.json` é `pnpm@11.3.0`. Outro gerenciador não deverá ser usado para instalar dependências neste repositório.

### Compatibilidade conhecida do ESLint

O ESLint está fixado em `9.39.5`. A versão `10.9.1` foi avaliada, mas os plugins `eslint-plugin-import`, `eslint-plugin-jsx-a11y` e `eslint-plugin-react` trazidos pela configuração atual do Next.js ainda declaram compatibilidade somente com ESLint 9.

O comando `pnpm peers check` passa com a versão fixada. A atualização para ESLint 10 deverá ser reavaliada quando o conjunto oficial de plugins utilizado pelo Next.js declarar suporte compatível.

## Preparação local

Abra um terminal na raiz do projeto:

```powershell
Set-Location "C:\Users\T-GAMER\Documents\bs-veritas-web"
```

Confirme as ferramentas:

```powershell
node --version
pnpm --version
git --version
corepack --version
```

Instale as dependências respeitando o lockfile:

```powershell
pnpm install --frozen-lockfile
```

Durante uma alteração intencional de dependências, o lockfile poderá ser atualizado pelo próprio pnpm e deverá ser revisado no diff.

## Servidor de desenvolvimento

```powershell
pnpm dev
```

Endereço padrão:

```text
http://localhost:3000
```

Se a porta estiver ocupada, o Next.js poderá selecionar outra. O endereço exibido no terminal será a referência correta.

## Comandos disponíveis

| Comando                  | Finalidade                                            |
| ------------------------ | ----------------------------------------------------- |
| `pnpm dev`               | iniciar o servidor de desenvolvimento                 |
| `pnpm build`             | validar e gerar o build de produção                   |
| `pnpm start`             | servir localmente o projeto com Wrangler              |
| `pnpm typecheck`         | gerar tipos do Next.js e validar o TypeScript         |
| `pnpm lint`              | executar o ESLint                                     |
| `pnpm format`            | formatar os arquivos cobertos pelo Prettier           |
| `pnpm format:check`      | verificar a formatação sem alterar arquivos           |
| `pnpm test`              | executar os testes Vitest uma vez                     |
| `pnpm test:watch`        | executar Vitest em modo de observação                 |
| `pnpm test:e2e`          | executar os testes Playwright                         |
| `pnpm cloudflare:check`  | validar o pacote Cloudflare sem publicar              |
| `pnpm cloudflare:deploy` | publicar manualmente na Cloudflare Workers            |
| `pnpm db:generate`       | gerar migrations Drizzle a partir de um schema válido |

O comando `db:generate` não deve ser executado apenas para testar a instalação. Ele será usado quando houver uma alteração de schema aprovada.

## Navegador dos testes E2E

O Playwright utiliza Chromium. Em uma nova máquina, instale o navegador uma vez:

```powershell
pnpm exec playwright install chromium
```

O download do navegador não deve ser versionado no repositório.

## Verificação local recomendada

Antes de concluir uma alteração de código:

```powershell
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Uma alteração exclusivamente documental pode ser validada pela revisão do diff e por verificações de formatação, sem executar toda a suíte quando não houver impacto em código ou configuração.

## Scripts de instalação de dependências

O pnpm está configurado para permitir scripts de instalação somente quando revisados. O arquivo `pnpm-workspace.yaml` registra as decisões atuais:

- `esbuild`: permitido;
- `sharp`: bloqueado;
- `unrs-resolver`: bloqueado.

Uma nova solicitação de build script deverá ser analisada pelo nome do pacote, finalidade, procedência e necessidade antes de ser aprovada.

## Configuração pública do Turnstile

O formulário seleciona a chave pública do Turnstile no navegador conforme o hostname conhecido:
produção ou ambiente local. O preview não carrega o widget porque a coleta está desativada. Essas chaves identificam os widgets e são
publicamente visíveis por definição; elas não substituem o segredo `TURNSTILE_SECRET_KEY`, que existe
somente no Worker.

O build executa uma verificação obrigatória sobre `out/contato.html` e falha quando o formulário não
está no export estático. Dessa forma, a presença do formulário não depende de uma variável de ambiente
invisível no momento da publicação.

Quando integrações forem implementadas, cada variável deverá ser classificada como:

- pública: pode ser incorporada ao bundle do navegador;
- privada: disponível somente no servidor;
- segredo: privada e com acesso administrativo restrito.

Somente valores realmente públicos poderão utilizar o prefixo `NEXT_PUBLIC_`.

## Arquivos locais de ambiente

Convenção prevista:

```text
.env.example        nomes documentados e valores fictícios
.env.local          configuração privada do desenvolvedor
```

Regras:

- `.env.local` nunca será versionado;
- `.env.example` nunca conterá segredo real;
- comentários deverão explicar finalidade e formato, não revelar credenciais;
- novas variáveis exigirão validação centralizada;
- variáveis obsoletas deverão ser removidas da plataforma e da documentação.

Como `.env*` é ignorado integralmente, qualquer configuração privada local deve ser criada apenas na
máquina do desenvolvedor. O segredo do Turnstile de produção é administrado na Cloudflare. O preview
não recebe esse segredo.

## Banco de dados

O schema e as três migrations de cotação foram aplicados ao serviço PostgreSQL da Aiven usado pela produção. O
usuário de aplicação `bs_veritas_app` recebe o papel `bs_veritas_quote_writer`, limitado a inserir
solicitações e ler somente o UUID retornado. A conexão do Worker é intermediada pelo Hyperdrive; a
string de conexão e a senha não são enviadas ao navegador nem versionadas.

Regras operacionais:

- somente a produção possui o binding Hyperdrive;
- somente a produção habilita o Cron Trigger de retenção; o preview declara `crons: []`;
- o navegador não receberá a string de conexão;
- o preview não acessará nem gravará dados;
- migrations serão geradas, revisadas e testadas antes da aplicação;
- mudanças destrutivas exigirão plano próprio de backup e reversão;
- a restauração de backup continua pendente de validação operacional.

## Serviços externos

| Serviço               | Papel                                       | Estado atual                                       |
| --------------------- | ------------------------------------------- | -------------------------------------------------- |
| Cloudflare Workers    | site, endpoint e assets                     | produção ativa; preview isolado                    |
| Cloudflare Cron       | descarte diário de cotações vencidas        | preparado; depende de migration e deploy           |
| Cloudflare Hyperdrive | conexão protegida com PostgreSQL            | ativo somente em produção; cache desativado        |
| Cloudflare Turnstile  | verificação antiabuso                       | ativo em produção e validado no servidor           |
| PostgreSQL/Aiven      | persistência de leads                       | migrations aplicadas e menor privilégio verificado |
| Cloudflare Queues     | tentativa assíncrona da notificação         | somente produção; mensagem contém apenas UUID      |
| Cloudflare Email      | notificação comercial após persistência     | consumido pela fila em produção                    |
| Provedor de e-mail    | roteamento e autenticação do e-mail público | MX, SPF, DKIM e DMARC ativos                       |
| GitHub                | repositório privado e CI                    | configurado e validado                             |
| Analytics             | métricas sem dados pessoais                 | não configurado                                    |

A Vercel Hobby não faz parte da infraestrutura porque não permite uso comercial. O formulário está
ativo apenas no domínio oficial; o preview serve para revisão visual e recusa qualquer tentativa de
envio ou persistência.

## Dados de desenvolvimento

- utilizar nomes, telefones e e-mails claramente fictícios;
- não copiar leads reais para a máquina local;
- não inserir dados reais em testes, screenshots ou issues;
- limpar artefatos temporários que contenham dados de teste desnecessários;
- evitar exemplos que possam ser confundidos com contatos reais da empresa.

## Diagnóstico básico

Se o projeto não iniciar:

1. confirme que o terminal está na raiz correta;
2. confirme as versões de Node.js e pnpm;
3. execute `pnpm install --frozen-lockfile`;
4. leia o primeiro erro completo exibido pelo comando;
5. verifique se existem alterações locais antes de modificar arquivos;
6. não apague o lockfile nem reinstale dependências de forma indiscriminada.

Correções no ambiente deverão preservar mudanças locais e ser executadas uma por vez, com nova validação após cada ação.
