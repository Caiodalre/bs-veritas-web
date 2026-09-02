# Ambientes do B&S Veritas Web

Este documento descreve como o projeto deve ser executado e configurado nos ambientes local, preview e produção.

Nenhuma credencial de aplicação em produção está configurada. O GitHub, o CI, um preview sem indexação e a produção estática sem coleta de dados estão ativos.

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

Usado para revisão antes da produção. O preview atual está publicado em `https://bs-veritas-web.caio-dalre.workers.dev`.

- possui configuração separada de produção;
- não utiliza dados reais;
- envia `X-Robots-Tag: noindex`;
- permanece fora da indexação de buscadores;
- não é o domínio oficial de produção;
- integrações externas deverão usar modo de teste ou permanecer desativadas.

### Produção

Usado exclusivamente pelo domínio público aprovado e ativo.

- domínio canônico: `https://bsveritas.com.br`;
- revisão inicial implantada: `70feb0c`;
- aplicação estática sem banco, variáveis ou segredos de aplicação;
- logs sem dados pessoais;
- rollback disponível pelas versões anteriores do Worker;
- monitoramento de produção ainda pendente;
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

## Variáveis de ambiente

Na fundação atual, a aplicação não exige variável de ambiente específica para iniciar, testar ou gerar o build.

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

O arquivo `.env.example` ainda não será criado porque nenhuma integração que exija variáveis foi implementada.

## Banco de dados

O Drizzle possui schema de cotação e migration inicial versionados. Ainda não existem:

- URL real de PostgreSQL;
- credenciais locais, de preview ou produção;
- banco conectado à aplicação.

A migration gerada em `drizzle/0000_quote_requests.sql` não foi aplicada a nenhum ambiente.

Quando essa etapa for aprovada:

- cada ambiente terá seu próprio banco ou isolamento equivalente;
- o navegador não receberá a string de conexão;
- preview não utilizará dados de produção;
- migrations serão geradas, revisadas e testadas antes da aplicação;
- a restauração de backup será validada antes do lançamento.

## Serviços externos planejados

| Serviço             | Papel                                       | Estado atual                      |
| ------------------- | ------------------------------------------- | --------------------------------- |
| Cloudflare Workers  | preview e produção estática                 | ambos ativos                      |
| Cloudflare          | DNS, CDN, SSL e Turnstile futuro            | domínio e redirecionamento ativos |
| PostgreSQL/Supabase | persistência de leads                       | não conectado                     |
| Provedor de e-mail  | roteamento e autenticação do e-mail público | MX, SPF, DKIM e DMARC ativos      |
| GitHub              | repositório privado e CI                    | configurado e validado            |
| Analytics           | métricas sem dados pessoais                 | não configurado                   |

A Vercel Hobby não faz parte da infraestrutura porque não permite uso comercial. Banco, formulários, analytics, notificações da aplicação e outros serviços não deverão ser tratados como ativos antes de sua configuração e validação explícitas.

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
