# Implantação do B&S Veritas Web

## Coerência de medição

O código e as políticas públicas declaram que analytics de navegador não está ativo. Antes de
promover a próxima versão, a injeção automática do Cloudflare Web Analytics deve permanecer
desativada em **Web Analytics > Manage site > Disable**. A CSP não deve ser relaxada para permitir o
beacon enquanto essa decisão estiver vigente. Como defesa adicional contra divergência de painel,
as regras de Static Assets acrescentam `Cache-Control: no-transform`, impedindo a injeção automática
documentada pela Cloudflare. A regra específica dos arquivos versionados preserva o cache
`max-age=31536000, immutable`.

Após a alteração da configuração e a publicação do código, `scripts/check-production.mjs` verifica
com um User-Agent de navegador que o HTML contém `no-transform`, não contém
`static.cloudflareinsights.com` e que o payload RSC usado na navegação do Next.js responde sem erro.

Este documento descreve o processo planejado de preview, publicação, validação e rollback do site da **B&S VERITAS CORRETORA DE SEGUROS LTDA**.

O repositório privado, o CI, o preview e a produção na Cloudflare Workers estão ativos. O formulário de cotação, PostgreSQL, proteção antiabuso e notificação comercial estão ativos somente em produção.

## Objetivos

- publicar somente revisões identificáveis e verificadas;
- manter preview e produção isolados;
- impedir o uso de dados reais em homologação;
- permitir rollback seguro;
- validar aplicação, domínio e integrações após cada publicação;
- evitar alterações manuais em arquivos de produção.

## Arquitetura inicial de publicação

```text
Registro.br
   |
   v
Cloudflare
DNS, CDN, SSL e proteção
   |
   v
Workers Static Assets
Next.js com exportação estática
   |
   +--> páginas públicas
   |
   `--> /api/quote
           -> rate limiting, validação e Turnstile
           -> Hyperdrive -> PostgreSQL/Aiven
           -> Cloudflare Queue -> notificação comercial
```

O preview publica os mesmos assets para revisão visual, mas não recebe os bindings da camada dinâmica e recusa o endpoint de cotação.

O e-mail corporativo utilizará o mesmo domínio, mas permanecerá independente do deploy da aplicação.

## Domínios

Configuração atual:

| Endereço                       | Comportamento esperado                              |
| ------------------------------ | --------------------------------------------------- |
| `https://bsveritas.com.br`     | domínio canônico de produção                        |
| `https://www.bsveritas.com.br` | redirecionamento permanente para o domínio canônico |
| HTTP                           | redirecionamento para HTTPS                         |
| URLs de preview                | homologação, sem indexação                          |

Os registros DNS do site foram alterados individualmente após aprovação, com preservação e nova validação dos registros de e-mail.

### Redirecionamento canônico

O redirecionamento de `www` está implementado como uma **Single Redirect** na zona Cloudflare, recurso disponível no plano gratuito. A regra é executada na borda, antes do Worker.

Não será usado o arquivo `_redirects`, pois os redirects de Static Assets não aceitam correspondência por domínio. Também não será alterado `run_worker_first` para todas as páginas, evitando invocações e latência desnecessárias no site estático.

Configuração ativa:

| Campo                  | Valor                            |
| ---------------------- | -------------------------------- |
| nome                   | `WWW para domínio principal`     |
| origem                 | `https://www.bsveritas.com.br/*` |
| destino                | `https://bsveritas.com.br/${1}`  |
| status                 | `301`                            |
| preservar query string | sim                              |

Validação concluída em 2026-09-01:

- ambos os hosts respondem com certificados válidos;
- `www` utiliza registro originless `AAAA 100::` em modo proxy;
- o domínio principal responde com a revisão aprovada;
- não existiam regra ou registro `www` conflitantes antes da mudança;
- HTTP e HTTPS retornam um único `301`, sem loop;
- caminho e query string são preservados.

A regra ativa usa a referência estável `redirect_www_to_apex`. Mudanças futuras continuam exigindo aprovação explícita da alteração na Cloudflare.

## Ambientes

### Local

Desenvolvimento e testes na máquina do desenvolvedor. Não possui acesso a dados ou credenciais de produção.

### Preview

Criado a partir de uma branch ou revisão candidata.

- configuração separada;
- dados exclusivamente fictícios;
- `noindex` e bloqueio de indexação;
- formulário visível, porém desativado;
- sem Hyperdrive, fila, e-mail, rate limiter ou segredo Turnstile;
- API de cotação recusada antes de qualquer integração;
- URL utilizada para revisão visual, funcional e mobile.

### Produção

Criado somente a partir da revisão aprovada na `main`.

- domínio oficial ativo;
- assets estáticos e API de cotação no mesmo Worker;
- Hyperdrive, PostgreSQL, Turnstile, rate limiting, fila e e-mail ativos;
- logs e monitoramento restritos;
- estratégia de rollback disponível.

## Fluxo de entrega

```text
branch de trabalho
   -> verificações locais
      -> revisão do diff
         -> preview
            -> homologação
               -> integração na main
                  -> produção
                     -> smoke tests
```

Uma passagem entre etapas depende da validação da etapa anterior. Um preview bem-sucedido não autoriza automaticamente a produção.

## Pré-requisitos para configurar as plataformas

Antes de conectar serviços externos:

- [x] domínio sob titularidade e controle autorizado;
- [x] repositório remoto privado definido;
- [ ] responsáveis administrativos identificados;
- [ ] MFA habilitada nas contas administrativas;
- [x] preview Cloudflare Workers criado e validado;
- [x] titularidade administrativa da zona Cloudflare confirmada para produção;
- [x] serviço PostgreSQL e papel de aplicação definidos;
- [x] bindings e segredos de produção isolados do preview;
- [x] contatos e conteúdo mínimo de produção confirmados;
- [x] procedimento de recuperação registrado.

Nenhuma credencial deve ser compartilhada por mensagem, issue ou arquivo versionado.

## Verificações antes de um preview

Na raiz do projeto:

```powershell
pnpm install --frozen-lockfile
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Também devem ser revisados:

- diff completo da branch;
- arquivos novos e removidos;
- mudanças no lockfile;
- dependências e scripts de instalação;
- uso de variáveis de ambiente;
- ausência de segredos e dados reais;
- impacto em schema e migrations;
- comportamento em desktop e mobile.

## Configuração atual da Cloudflare

A implantação atual:

- usa Cloudflare Workers Static Assets no plano gratuito;
- publica a pasta `out` gerada pelo Next.js;
- executa o build com `pnpm build`;
- mantém `workers.dev` ativo como preview;
- serve `bsveritas.com.br` como Custom Domain do Worker;
- redireciona `www` para o domínio principal por Single Redirect;
- envia `X-Robots-Tag: noindex` no preview;
- aplica uma Content Security Policy compatível com a exportação estática;
- mantém HSTS versionado somente para os hosts oficiais, sem `includeSubDomains` ou `preload`;
- protege diretamente as respostas da API, que não recebem as regras do arquivo `_headers`;
- publica `robots.txt` e sitemap canônicos no domínio oficial;
- mantém bindings de banco, e-mail, rate limiter e segredo Turnstile somente em produção;
- deixa o preview sem acesso às integrações e com coleta desativada;
- foi validado por testes automatizados no preview e smoke tests HTTP em produção.

A publicação ainda é manual. Automatizar deploys exigirá uma etapa separada, com credencial de escopo mínimo e aprovação explícita.

## Estado do domínio Cloudflare

A configuração atual:

- usa o DNS autoritativo da Cloudflare;
- preserva os registros necessários ao e-mail corporativo;
- conecta o domínio principal diretamente ao Worker aprovado;
- força HTTPS sem loop de redirecionamento;
- mantém a cadeia DNSSEC completa, com o DS publicado no Registro.br;
- mantém certificados, CSP e HSTS validados no domínio final.

A restauração de backup foi validada operacionalmente em 2026-09-20. A rotina automatizada de descarte está publicada; a primeira execução agendada ainda precisa ser acompanhada e registrada.

Alterações DNS serão feitas uma por vez, com registro do valor anterior e teste após cada mudança.

## Variáveis de ambiente

Cada variável deverá possuir:

- nome;
- finalidade;
- classificação pública, privada ou segredo;
- ambientes em que existe;
- serviço responsável;
- procedimento de rotação quando aplicável.

Regras:

- preview e produção não compartilharão segredos por conveniência;
- segredos nunca usarão o prefixo `NEXT_PUBLIC_`;
- valores reais não serão copiados para `.env.example`;
- uma variável removida do código também deverá ser removida da plataforma;
- a aplicação deverá falhar cedo quando uma variável obrigatória estiver ausente.

## Banco e migrations

Quando o banco entrar no fluxo de publicação:

1. gerar a migration a partir de uma alteração aprovada do schema;
2. revisar o SQL gerado;
3. testar a migration em ambiente não produtivo;
4. verificar impacto, duração e possibilidade de reversão;
5. criar ou confirmar backup recuperável;
6. aplicar a migration pelo processo definido;
7. validar aplicação e dados após a mudança.

O deploy da aplicação e a migration deverão ter uma ordem explícita e compatível. Mudanças destrutivas de schema exigirão plano específico e não serão aplicadas automaticamente.

### Ordem do controle comercial

A base `0005_operations_admin.sql` e a evolução aditiva `0006_staff_portal_access.sql` foram aplicadas
e validadas em produção em 2026-09-27. A validação da `0006` confirmou colunas, restrições, índice de
identidade, funções com privilégio mínimo, ausência de concessão direta às tabelas e o ADM master.
`/painel*` permanece protegido pelo Cloudflare Access e o Worker mantém a segunda autorização no
PostgreSQL.

A adoção operacional e a expansão dos perfis do portal foram colocadas em standby pelo responsável.
Até nova aprovação, não serão cadastrados novos funcionários, ampliados os fluxos comerciais nem
alteradas as políticas de retenção desse módulo.

O rollback do Worker desativa a interface, mas não remove tabelas nem registros. A migration é
aditiva e não modifica as solicitações de cotação existentes.

O V1 não publica função, agendamento ou endpoint de exclusão para funcionários, vendas, repasses ou
eventos de auditoria. Uma futura política de descarte deverá ser tratada como mudança separada e não
poderá reutilizar automaticamente a rotina de retenção dos pedidos de cotação.

### Ordem da rotina de retenção

A ativação do descarte automático seguirá obrigatoriamente esta ordem:

1. revisar e aprovar a migration `0003_quote_retention_cleanup.sql`;
2. confirmar o backup automático disponível na Aiven;
3. aplicar a migration com o usuário administrativo;
4. verificar que `bs_veritas_quote_writer` recebeu somente `EXECUTE` na função e continua sem
   `DELETE` direto;
5. publicar o Worker com o Cron Trigger diário `17 6 * * *`;
6. confirmar no painel da Cloudflare que o agendamento existe somente em produção;
7. verificar o primeiro evento pelos logs estruturados, que registram apenas contagem, horário e tipo
   de erro.

O rollback do Worker remove o agendamento, mas não desfaz registros já eliminados. A função exclui
somente linhas cujo `retention_expires_at` já venceu e processa no máximo 500 registros por execução.

## Homologação do preview

O preview candidato deverá validar pelo menos:

- carregamento da Home;
- navegação principal e mobile;
- páginas de seguros alteradas;
- links internos e externos;
- formulário em estados inicial, inválido, envio e falha;
- WhatsApp sem dados pessoais na URL;
- layout em larguras móveis e desktop;
- foco por teclado e labels acessíveis;
- metadata, canonical e bloqueio de indexação do preview;
- ausência de erros no console e de requisições inesperadas;
- respostas sem detalhes técnicos ou dados pessoais.

Somente funcionalidades que já existirem precisam ser marcadas como verificadas. Recursos ainda não implementados permanecem pendentes.

## Publicação em produção

Antes da promoção:

- [ ] revisão candidata identificada por commit;
- [ ] verificações automatizadas aprovadas;
- [ ] homologação registrada;
- [ ] schema e migrations compatíveis;
- [ ] variáveis de produção confirmadas sem expor valores;
- [ ] integrações externas em modo de produção correto;
- [ ] domínio e certificados válidos;
- [ ] backup ou ponto de retorno disponível;
- [ ] responsável pela publicação definido;
- [ ] janela de acompanhamento após o deploy disponível.

A publicação deverá utilizar a revisão aprovada, sem alterações locais não versionadas.

## Smoke tests após publicação

Imediatamente após o deploy:

1. abrir `https://bsveritas.com.br`;
2. confirmar HTTPS e o domínio canônico;
3. testar o redirecionamento de `www` e HTTP;
4. abrir as páginas públicas principais;
5. validar navegação desktop e mobile;
6. testar um lead fictício controlado, se o formulário estiver ativo;
7. confirmar persistência e notificação sem expor os dados em logs;
8. verificar erros de aplicação e serviços externos;
9. confirmar `robots.txt`, sitemap e regras de indexação;
10. registrar o resultado e a revisão publicada.

O lead de smoke test deverá ser claramente identificado como fictício e removido conforme o procedimento de teste aprovado.

## Rollback

O rollback será considerado quando houver:

- indisponibilidade relevante;
- falha de navegação ou conversão principal;
- exposição de dados ou segredo;
- erro de integração que gere perda ou duplicação de leads;
- incompatibilidade entre aplicação e banco;
- regressão sem correção segura imediata.

Procedimento geral:

1. interromper novas mudanças;
2. identificar a última revisão estável;
3. avaliar se houve migration incompatível;
4. restaurar o deploy anterior pela plataforma;
5. tratar o banco separadamente conforme o plano da migration;
6. executar smoke tests;
7. registrar causa, impacto e decisão;
8. corrigir em nova branch, sem editar produção manualmente.

Rollback da aplicação não implica rollback automático do banco. Essa compatibilidade deve ser planejada antes de cada alteração de schema.

## Falha durante o deploy

Se build, testes ou publicação falharem:

- não promover o artefato incompleto;
- preservar a saída do erro sem divulgar segredos;
- identificar o primeiro erro relevante;
- corrigir a causa em código ou configuração versionada;
- repetir as verificações desde a etapa afetada;
- não desativar controles apenas para obter um deploy verde.

## Registro de releases

Cada publicação de produção deverá registrar:

- data e hora;
- commit implantado;
- responsável;
- resumo das mudanças;
- migrations aplicadas;
- resultado dos smoke tests;
- problemas conhecidos;
- rollback, quando ocorrido.

### Produção inicial — 2026-09-01

| Campo                | Valor                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| commit implantado    | `70feb0caf759e62901376875bd1d2248f4e5118a`                              |
| versão Cloudflare    | `7268ae1e-433d-4ee3-ae63-030801a74ec1`                                  |
| responsável          | publicação autorizada pelo responsável pelo repositório e pela zona DNS |
| migrations aplicadas | nenhuma                                                                 |
| rollback executado   | não                                                                     |

Resumo:

- produção estática publicada em `https://bsveritas.com.br`;
- preview `workers.dev` preservado e protegido com `noindex`;
- redirecionamento `www` ativado e validado separadamente;
- banco, formulários, analytics e notificações da aplicação permaneceram desativados.

Smoke tests:

- domínio principal e páginas públicas retornaram `200` em HTTPS;
- `www` retornou `301` preservando caminho e query string em HTTP e HTTPS;
- preview retornou `200` e rota inexistente retornou `404`;
- `robots.txt` e sitemap retornaram `200`;
- CSP, HSTS e `X-Robots-Tag` foram verificados nos hosts correspondentes;
- MX, SPF, DKIM e DMARC permaneceram publicados.

Pendências conhecidas:

- a cadeia DNSSEC, pendente no lançamento inicial, foi concluída em 2026-09-07;
- o monitoramento automático está programado no GitHub Actions para execução a cada seis horas;
- a entrega dos alertas depende das preferências de notificação da conta GitHub;
- o uso pago do GitHub Actions deve permanecer bloqueado para garantir custo zero;
- serviços dinâmicos permanecem desativados.

### Ativação do DNSSEC — 2026-09-07

- DS `2371 13 2 639BF1A3C7C5ADB282C17F0583CB9BE16F1D134E59023ED41A2C37BF04C4554E` publicado no Registro.br;
- Cloudflare DNS e Google Public DNS retornaram o mesmo DS com validação autenticada (`AD=true`);
- consultas `A` e `MX` retornaram respostas autenticadas (`AD=true`);
- domínio principal permaneceu com resposta `200` e `www` com redirecionamento `301` preservando caminho e query string;
- MX, SPF, DKIM e DMARC permaneceram publicados.

### Monitor de produção — 2026-09-07

- workflow em `.github/workflows/production-monitor.yml` com execução agendada e manual;
- frequência de quatro execuções por dia, sempre no minuto 17 para evitar o pico do início da hora;
- cinco páginas públicas, `robots.txt`, sitemap e cabeçalhos de segurança verificados;
- redirecionamento canônico de `www` e proteção `noindex` do preview verificados;
- DS e resolução `A` autenticados por DNSSEC no Cloudflare DNS e no Google Public DNS;
- MX, SPF, DKIM e DMARC verificados no Cloudflare DNS;
- três tentativas por consulta, timeout de 15 segundos e falha do workflow quando qualquer verificação não passa;
- nenhum segredo, banco ou dado pessoal utilizado.

### Dados estruturados em produção — 2026-09-09

- publicação às 20:28 BRT (23:28 UTC);
- commit d4e2b13508037bde83cbd3218c69e162f5d544a0;
- versão Cloudflare 973fba95-a92b-47c4-96ce-801411a87ca1 em 100% do tráfego;
- versão anterior 7268ae1e-433d-4ee3-ae63-030801a74ec1 preservada para rollback;
- sete rotas, redirecionamento www, cabeçalhos e JSON-LD validados;
- nenhuma migration ou serviço dinâmico ativado.

### Política de Privacidade e contato em produção — 2026-09-13

- publicação às 01:47 BRT (04:47 UTC);
- commit `53e3043f85602434da99f637357a925f3bce0017`;
- versão Cloudflare `604177f0-48c8-4121-b39e-0592ba5ae72f` em 100% do tráfego;
- versão anterior `973fba95-a92b-47c4-96ce-801411a87ca1` preservada para rollback;
- página inicial, contato, Política de Privacidade e sitemap retornaram `200`;
- links oficiais de e-mail e telefone foram validados na página de contato;
- preview permaneceu protegido com `noindex` e a produção permaneceu indexável;
- nenhuma migration, credencial, banco ou serviço pago foi adicionado.

### Termos de Uso em produção — 2026-09-13

- publicação às 10:01 BRT (13:01 UTC);
- commit `84c86d7b5fda42319ea5dc6e54645a072f55530f`;
- versão Cloudflare `1491f9cb-47cc-4aa9-bd78-7576b180cc19` em 100% do tráfego;
- versão anterior `604177f0-48c8-4121-b39e-0592ba5ae72f` preservada para rollback;
- página inicial, contato, Política de Privacidade, Termos de Uso e sitemap retornaram `200`;
- links legais, canal de contato e inclusão dos termos no sitemap foram validados;
- preview permaneceu protegido com `noindex` e a produção permaneceu indexável;
- nenhuma migration, credencial, banco ou serviço pago foi adicionado;
- a revisão jurídica independente da redação continua recomendada.

### Cotação em produção e isolamento do preview — 2026-09-19

- commit `7dcbb5f4c9f745602a35879d46adc825a402928e`;
- versão Cloudflare `65ca2b79-30a0-41b6-8e9d-5f5f8ea3fb3b`;
- formulário de cotação ativo no domínio oficial com Turnstile, rate limiting, validação no servidor,
  Hyperdrive, PostgreSQL/Aiven e notificação por e-mail;
- fluxo completo confirmado com persistência e recebimento da notificação;
- preview publicado sem Hyperdrive, e-mail, rate limiter ou segredo Turnstile;
- interface do preview desativa o formulário e a API retorna `503 quote_submission_disabled`;
- CI, 122 testes unitários/componentes, 26 testes de navegador, build e monitor de produção aprovados;
- analytics de navegador permaneceu desativado e bloqueado por `Cache-Control: no-transform`;
- a restauração de backup ainda não havia sido validada nessa entrega; a rotina de descarte por retenção permanecia pendente.

### Automação do descarte por retenção — 2026-09-19

- commit `15e546e` integrado pela PR #54;
- migration `0003_quote_retention_cleanup.sql` aplicada ao PostgreSQL/Aiven;
- função de descarte restrita ao papel de escrita e sem concessão de `DELETE` direto à aplicação;
- Cron Trigger publicado somente em produção, com execução diária às `06:17 UTC` (`03:17 BRT`);
- versão Cloudflare `efde43ba-e69b-45b6-b991-d3b43cd5c7ad` recebendo 100% do tráfego;
- build, TypeScript, exportação estática e monitor público de produção aprovados;
- primeira execução agendada ainda precisa de evidência operacional.

### Validação de backup e restauração — 2026-09-20

- cliente e servidor local PostgreSQL `18.6` instalados no Ubuntu/WSL pelo repositório oficial do PostgreSQL;
- conexão administrativa com o PostgreSQL/Aiven validada com TLS obrigatório;
- backup lógico criado com `pg_dump` 18 no formato custom, sem preservar proprietário ou privilégios;
- restauração concluída em banco PostgreSQL 18 local isolado;
- tabela de cotações, histórico de quatro migrations, restrições e função de retenção confirmados sem
  exibir dados pessoais;
- senha removida da área de transferência e do ambiente imediatamente após o uso;
- banco restaurado e arquivo de backup temporários removidos ao final da validação;
- banco remoto de produção permaneceu inalterado durante todo o teste.

### Auditoria das filas de notificação — 2026-09-20

- fila `bs-veritas-quote-notifications` confirmada com o Worker `bs-veritas-web` como único produtor
  e único consumidor;
- consumidor remoto conferido com lote 5, espera máxima de 5 segundos, oito novas tentativas,
  atraso de 60 segundos e DLQ `bs-veritas-quote-notifications-dlq`;
- fila principal e DLQ com backlog em tempo real de 0 mensagens e 0 bytes;
- nenhuma pausa de entrega indicada pela API da Cloudflare;
- ambas as filas retêm mensagens não consumidas por 24 horas;
- DLQ sem consumidor; o monitor não lê nem remove mensagens;
- verificação automática da DLQ publicada em produção a cada seis horas, com alerta por e-mail
  somente quando o backlog for maior que zero e sem incluir conteúdo das mensagens;
- validação local concluída com 142 testes, tipos, lint, formatação, build e dry-runs dos ambientes;
  a primeira execução real do monitor ainda precisa de evidência operacional.

### Administração protegida de solicitações — 2026-09-26

- PR #66 integrada pelo merge commit `c522403dc6b3b0e4fba2a44ddca6d70d76410b86`;
- migration `0004_quote_request_admin.sql` aplicada ao PostgreSQL/Aiven e confirmada com dois índices,
  duas funções e o quinto registro no histórico do Drizzle;
- versão Cloudflare `5d985998-da39-48c5-96b1-83e145af0e15` recebendo 100% do tráfego;
- `QUOTE_ADMIN_ENABLED=true` somente em produção, com Hyperdrive e Cloudflare Access preservados;
- rota pública de contato respondeu `200`, rota administrativa redirecionou ao Access e API direta
  sem autenticação respondeu `401`;
- smoke test autenticado carregou a lista por Hyperdrive sem evento de erro `quote_admin`;
- nenhuma solicitação ou situação foi alterada durante a homologação.

## Estado atual da implantação

| Componente            | Estado                                                               |
| --------------------- | -------------------------------------------------------------------- |
| build local           | configurado e validado                                               |
| testes locais         | configurados e validados                                             |
| repositório Git local | configurado                                                          |
| GitHub remoto         | privado e configurado                                                |
| CI                    | ativo e validado no GitHub                                           |
| Cloudflare Workers    | preview isolado e produção com API ativos                            |
| Vercel                | excluída do plano gratuito                                           |
| domínio no projeto    | apex ativo e `www` com redirecionamento `301`                        |
| monitoramento         | agendado no GitHub Actions a cada seis horas                         |
| PostgreSQL remoto     | Aiven conectado; backup, restauração e migrations até 0006 validados |
| notificações          | fila e e-mail ativos; monitor da DLQ publicado                       |
| retenção              | descarte diário publicado; primeira execução pendente                |
| administração         | campanhas e solicitações protegidas; portal da equipe em standby     |
| versão Cloudflare     | `056d5810-a514-455b-b03b-7bdf7d7a03f2`                               |
| produção              | ativa no commit `79b4690`                                            |

Qualquer mudança desse estado deverá ser feita como uma etapa separada, aprovada e validada.
