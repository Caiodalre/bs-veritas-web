# Implantação do B&S Veritas Web

Este documento descreve o processo planejado de preview, publicação, validação e rollback do site da **B&S VERITAS CORRETORA DE SEGUROS LTDA**.

O repositório privado, o CI, o preview e a produção estática na Cloudflare Workers estão ativos. Banco remoto, formulários e integrações comerciais da aplicação ainda não estão ativos.

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
   `--> páginas públicas sem coleta de dados
```

PostgreSQL, Turnstile e notificações serão conectados somente depois da definição da camada dinâmica e das respectivas políticas de dados e segredos.

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
- integrações externas em modo de teste ou desativadas;
- URL utilizada para revisão visual, funcional e mobile.

### Produção

Criado somente a partir da revisão aprovada na `main`.

- domínio oficial ativo;
- aplicação estática sem credenciais ou banco de produção;
- serviços dinâmicos desativados até aprovação específica;
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
- [ ] ambientes e responsáveis pelo PostgreSQL definidos;
- [ ] política de segredos aprovada;
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
- não possui bindings, banco, variáveis ou segredos de produção;
- foi validado por testes automatizados no preview e smoke tests HTTP em produção.

A publicação ainda é manual. Automatizar deploys exigirá uma etapa separada, com credencial de escopo mínimo e aprovação explícita.

## Estado do domínio Cloudflare

A configuração atual:

- usa o DNS autoritativo da Cloudflare;
- preserva os registros necessários ao e-mail corporativo;
- conecta o domínio principal diretamente ao Worker aprovado;
- força HTTPS sem loop de redirecionamento;
- mantém certificados, CSP e HSTS validados no domínio final.

Permanecem pendentes:

- concluir a cadeia DNSSEC com a publicação do registro DS no domínio pai;
- configurar Turnstile somente quando os formulários públicos forem ativados.

Alterações DNS serão feitas uma por vez, com registro do valor anterior e teste após cada mudança.

## Variáveis de ambiente

Cada variável futura deverá possuir:

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

- a zona publica DNSKEY, mas a cadeia DNSSEC ainda não possui DS no domínio pai;
- monitoramento e alertas de produção ainda não estão configurados;
- serviços dinâmicos permanecem desativados.

## Estado atual da implantação

| Componente            | Estado                                        |
| --------------------- | --------------------------------------------- |
| build local           | configurado e validado                        |
| testes locais         | configurados e validados                      |
| repositório Git local | configurado                                   |
| GitHub remoto         | privado e configurado                         |
| CI                    | ativo e validado no GitHub                    |
| Cloudflare Workers    | preview e produção estática ativos            |
| Vercel                | excluída do plano gratuito                    |
| domínio no projeto    | apex ativo e `www` com redirecionamento `301` |
| PostgreSQL remoto     | não conectado                                 |
| notificações          | não configuradas                              |
| produção              | ativa no commit `70feb0c`                     |

Qualquer mudança desse estado deverá ser feita como uma etapa separada, aprovada e validada.
