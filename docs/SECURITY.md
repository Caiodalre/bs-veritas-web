# Segurança do B&S Veritas Web

Este documento define os princípios, limites e controles de segurança do site da **B&S VERITAS CORRETORA DE SEGUROS LTDA**.

Ele distingue os controles ativos dos controles ainda pendentes. A produção coleta apenas as solicitações enviadas pelo formulário de cotação; o preview não envia nem armazena dados.

## Escopo

Esta política cobre:

- aplicação Next.js;
- formulários de cotação e contato;
- banco de leads;
- áreas administrativas de campanhas, solicitações e controle comercial;
- integrações de notificação;
- variáveis de ambiente;
- ambientes local, preview e produção;
- dependências e processo de entrega.

O e-mail corporativo e as contas Cloudflare, GitHub e PostgreSQL também precisam de políticas administrativas próprias conforme forem configurados.

## Modelo de risco inicial

Os principais riscos considerados são:

- envio automatizado ou abusivo de formulários;
- injeção de conteúdo malicioso;
- exposição de credenciais;
- acesso indevido ao banco de leads;
- acesso indevido às rotas administrativas ou às peças privadas de campanha;
- alteração indevida de valores comerciais, atribuição de vendas ou situação de repasses;
- vazamento de dados pessoais por logs, analytics ou mensagens de erro;
- dependências comprometidas ou desatualizadas;
- configuração incorreta de DNS, headers ou ambientes;
- publicação acidental de preview ou dados de teste;
- falsificação de e-mails enviados em nome da empresa.

O modelo será revisado quando uma nova integração ou categoria de dado entrar no projeto.

## Estado atual

Já existem no repositório:

- TypeScript em modo estrito;
- ESLint;
- Prettier com verificação reproduzível;
- testes unitários e E2E básicos;
- repositório privado no GitHub e CI remoto validado;
- Drizzle ORM conectado ao PostgreSQL por Hyperdrive, sem credenciais no repositório;
- schema local, validação Zod, normalização e honeypot para cotação;
- endpoint de cotação com persistência, Turnstile e respostas sem dados pessoais ativo em produção;
- rate limiting de 5 solicitações em 10 segundos por origem configurado no Worker;
- política de retenção de cinco anos aplicada às solicitações do formulário;
- `.gitignore` gerado para evitar o versionamento normal de arquivos locais de ambiente;
- regras de desenvolvimento em `AGENTS.md`;
- preview na Cloudflare Workers sem bindings de banco, fila, e-mail, rate limiter ou segredo Turnstile;
- produção no domínio oficial com banco, proteção antiabuso e notificação por e-mail;
- HTTPS, proteção contra framing, `nosniff`, política de referência e política de permissões;
- Content Security Policy compatível com a exportação estática do Next.js;
- HSTS restrito aos hosts oficiais, sem incluir subdomínios ainda não auditados;
- DNSSEC com cadeia de confiança validada até o Registro.br;
- cabeçalhos defensivos aplicados diretamente às respostas JSON da API;
- cabeçalho `X-Robots-Tag: noindex` no endereço `workers.dev`;
- fila de notificação restrita ao UUID da cotação, sem dados pessoais na mensagem;
- novas tentativas automáticas de e-mail com espera progressiva e fila de mensagens mortas;
- migration e Cron Trigger de descarte ao fim da retenção publicados somente em produção;
- backup lógico do PostgreSQL/Aiven restaurado e validado em PostgreSQL 18 local isolado.
- Cloudflare Access restringindo as áreas internas às identidades individuais aprovadas;
- validação do JWT do Access dentro do Worker antes de consultar R2 ou dados de solicitações;
- bucket R2 privado, APIs administrativas com `Cache-Control: no-store` e preview administrativo desativado;
- funções PostgreSQL de consulta paginada e atualização de situação com privilégio mínimo, sem leitura, alteração ou exclusão direta da tabela pelo papel da aplicação.

Ainda não estão configurados ou homologados:

- migration `0006_staff_portal_access.sql`, proteção de `/painel*` no Access e publicação dos perfis
  do portal da equipe;
- acompanhamento e registro da primeira execução agendada do descarte ao fim da retenção;
- analytics de navegador, que permanece deliberadamente desativado;
- MFA e canal específico para incidentes e vulnerabilidades.

Para o controle comercial, a política inicial aprovada em 2026-09-26 mantém funcionários, vendas,
repasses e eventos de auditoria sem exclusão automática. Essa decisão não reutiliza o prazo de cinco
anos dos pedidos de cotação. Qualquer descarte ou anonimização futura exige nova aprovação formal,
backup recuperável, implementação específica e validação antes da publicação.

## Princípios obrigatórios

- menor privilégio para pessoas, serviços e credenciais;
- coleta mínima de dados pessoais;
- validação de toda entrada externa no servidor;
- nenhuma confiança em validações executadas somente no navegador;
- separação entre ambientes;
- falha segura e mensagens externas sem detalhes técnicos;
- nenhuma credencial no código, histórico Git, logs ou documentação;
- revisão proporcional ao risco antes da integração na `main`.

## Dados pessoais

O formulário de cotação coleta somente:

- nome;
- e-mail;
- telefone ou WhatsApp;
- cidade, quando informada;
- tipo de seguro;
- mensagem livre.

O site não deverá solicitar no V1:

- CPF, RG ou CNH;
- dados bancários ou de cartão;
- renda;
- documentos;
- dados médicos;
- dados de dependentes;
- informações completas de apólices.

O campo de mensagem orienta o visitante a não enviar dados sensíveis. Cada lead recebe `retention_expires_at` calculado no servidor para cinco anos após o recebimento, sujeito às exceções legais documentadas.

## Formulários públicos

O fluxo ativo em produção possui as seguintes camadas:

```text
requisição
   -> rate limiting por origem
      -> limite de tamanho e formato
         -> schema de validação no servidor e honeypot
            -> verificação Turnstile
               -> normalização
                  -> persistência com menor privilégio
```

Regras:

- ignorar campos não definidos pelo schema;
- aplicar limites de tamanho a textos livres;
- normalizar telefone antes da persistência;
- impedir envios múltiplos acidentais na interface;
- não confiar em cabeçalhos de origem como único controle;
- não revelar qual camada de proteção rejeitou uma requisição;
- definir timeouts para serviços externos.

O Worker inicia com o limite de 5 solicitações em 10 segundos por origem. O valor deverá ser revisado com tráfego real, sem tratar o contador como mecanismo de auditoria.

## Banco de dados

- o navegador nunca terá credencial administrativa do PostgreSQL;
- gravações de leads passarão pelo backend;
- o usuário do banco terá apenas as permissões necessárias;
- o preview não receberá credenciais nem bindings de banco;
- migrations serão versionadas e revisadas;
- restaurações de backup deverão ser validadas operacionalmente e registradas com evidência;
- consultas deverão ser feitas por APIs seguras do ORM, sem concatenação manual de entrada externa;
- dados reais não serão copiados para testes locais ou previews.

As migrations foram aplicadas ao serviço Aiven usado pela produção. O papel de conexão foi verificado com
`INSERT ... RETURNING id` e sem permissão direta para ler os demais campos, alterar ou excluir registros.
As operações administrativas de leitura paginada e atualização de situação são expostas somente por funções
específicas, com `EXECUTE` concedido ao papel da aplicação. Em
2026-09-20, um backup lógico criado com `pg_dump` 18 foi restaurado em PostgreSQL 18 local isolado. A
validação confirmou a tabela de cotações, o histórico de migrations, as restrições e a função de retenção,
sem imprimir dados pessoais; o banco e o arquivo temporários foram removidos ao final.

## Segredos e variáveis de ambiente

Segredos incluem senhas, tokens, chaves privadas, URLs de banco com credenciais e chaves administrativas.

Regras:

- armazenar segredos locais somente em arquivos ignorados pelo Git;
- armazenar o segredo de produção na plataforma correspondente e não fornecer segredo ao preview;
- validar variáveis obrigatórias no início da aplicação;
- nunca prefixar segredo com `NEXT_PUBLIC_`;
- não inserir valores reais em exemplos ou fixtures;
- rotacionar imediatamente qualquer segredo exposto;
- manter credenciais diferentes por ambiente;
- conceder acesso somente a quem precisar operar o serviço.

Um arquivo de exemplo poderá ser criado futuramente apenas com nomes de variáveis e valores fictícios seguros.

## Logs, erros e analytics

Logs não deverão registrar:

- conteúdo completo de formulários;
- e-mail ou telefone do visitante;
- tokens ou headers de autorização;
- strings de conexão;
- respostas completas de serviços externos.

Erros apresentados ao visitante serão genéricos e úteis. Detalhes técnicos permanecerão em observabilidade restrita, com remoção de dados pessoais.

Eventos de analytics poderão registrar ações como início ou envio de cotação e cliques em canais de contato, mas nunca os valores preenchidos pelo visitante.

## Segurança HTTP

As respostas estáticas possuem:

- `Content-Security-Policy` restritiva às origens utilizadas pelo site;
- `X-Content-Type-Options`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- bloqueio de framing.

O HSTS está preparado somente para `bsveritas.com.br` e `www.bsveritas.com.br`, com duração de um ano. `includeSubDomains` e `preload` permanecem desativados até que todos os subdomínios e o serviço de e-mail sejam auditados.

As respostas JSON geradas pelo Worker aplicam seus próprios cabeçalhos defensivos e `Cache-Control: no-store`, pois não herdam as regras dos assets estáticos.

A Content Security Policy foi construída a partir dos recursos atuais. A exportação estática do Next.js exige scripts e estilos inline; migrar para nonces exigiria renderização dinâmica e uma decisão arquitetural separada. Não serão liberadas novas origens por conveniência sem justificativa.

CSP e HSTS foram verificados no domínio final durante a publicação inicial de 2026-09-01 e deverão ser revalidados após mudanças relevantes.

## Autenticação administrativa

O V1 não possui painel administrativo público. As áreas internas são protegidas pelo Cloudflare
Access, aceitam somente identidades individuais aprovadas e validam o token novamente no Worker. O
portal da equipe não armazena senha: ele vincula o `sub` do Access ao funcionário previamente
cadastrado e ativo. A API e as funções PostgreSQL repetem a autorização por perfil: master gerencia
acessos, administrador gerencia vendas e funcionário consulta apenas os próprios registros. Além
desses controles, as plataformas de infraestrutura deverão seguir estas regras:

- autenticação multifator obrigatória;
- contas individuais, sem senha compartilhada;
- pelo menos dois responsáveis administrativos quando o serviço exigir recuperação operacional;
- privilégio administrativo separado do uso cotidiano quando possível;
- revisão de acessos após entrada ou saída de colaboradores;
- recuperação de conta armazenada de forma segura;
- preferência por passkeys ou chaves físicas em contas críticas.

## Dependências

- utilizar versões explícitas quando estabilidade e reprodutibilidade forem importantes;
- revisar novas dependências antes da instalação;
- evitar bibliotecas para problemas simples que possam ser resolvidos com APIs da plataforma;
- executar scripts de instalação somente para pacotes revisados;
- manter o lockfile versionado;
- avaliar alertas de vulnerabilidade antes de atualizar automaticamente;
- executar testes e build após mudanças de dependências.

Uma atualização não será considerada segura apenas porque é a versão mais recente.

## Ambientes e entrega

```text
local
   -> preview
      -> produção
```

- produção não será usada para testes exploratórios;
- previews não usarão dados ou credenciais de produção;
- previews deverão permanecer fora da indexação de buscadores;
- mudanças chegarão à produção por código versionado;
- não haverá edição manual de arquivos publicados;
- deploys deverão permitir identificação da revisão implantada;
- a estratégia de reversão documentada deverá ser mantida e testada proporcionalmente ao risco de cada mudança.

## E-mail e domínio

O domínio utiliza:

- SPF;
- DKIM;
- DMARC com implantação gradual e monitorada;
- DNSSEC ativo, com DS publicado no Registro.br e respostas autenticadas em resolvedores públicos.

A MFA das plataformas administrativas continua pendente e não deve ser tratada como ativa antes de validação verificável.

O site não deve enviar e-mail fingindo usar um domínio ainda não autorizado pelos registros correspondentes.

## Resposta a incidentes

Ao identificar possível exposição ou comprometimento:

1. interromper o componente afetado quando isso reduzir o dano;
2. preservar evidências sem copiar dados pessoais desnecessariamente;
3. revogar e rotacionar credenciais possivelmente expostas;
4. identificar ambientes, dados e período afetados;
5. corrigir a causa e validar a correção;
6. avaliar obrigações de comunicação e LGPD com responsáveis competentes;
7. registrar o incidente e as medidas preventivas.

Não se deve apagar evidências ou publicar detalhes do incidente sem coordenação responsável.

## Comunicação de vulnerabilidades

O endpoint padronizado `https://bsveritas.com.br/.well-known/security.txt` publica o canal geral como
ponto de descoberta temporário para relatos de vulnerabilidade. Ele não substitui a criação futura de
um endereço específico de segurança. O primeiro contato não deve incluir credenciais, dados pessoais
de terceiros ou detalhes exploráveis.

Dados de vulnerabilidade não devem ser enviados para formulários comerciais comuns quando o canal oficial estiver disponível.

## Checklist operacional do formulário e da coleta

- [x] schemas de entrada e testes de casos inválidos;
- [x] honeypot verificado na camada local de validação;
- [x] rate limiting definido e coberto por testes do Worker;
- [x] Turnstile integrado no cliente e validado no servidor;
- [x] permissões mínimas do banco verificadas;
- [x] política de retenção de cinco anos aprovada;
- [x] backup lógico e restauração testados operacionalmente;
- [x] produção com segredo próprio e preview sem segredo ou integração de dados;
- [x] áreas administrativas protegidas pelo Access e por validação de JWT no Worker;
- [x] APIs administrativas sem cache público e com privilégios mínimos no R2 e PostgreSQL;
- [x] headers HTTP avaliados no domínio final;
- [x] logs e respostas revisados contra exposição de dados pessoais;
- [x] previews fora dos buscadores;
- [x] SPF, DKIM e DMARC do provedor de e-mail;
- [ ] MFA nas plataformas administrativas;
- [x] dependências e scripts de instalação revisados;
- [x] testes, lint e build aprovados;
- [x] estratégia de rollback documentada;
- [x] endpoint público `security.txt` com contato, validade e URL canônica;
- [ ] alerta da DLQ dentro da retenção de 24 horas — implementação local validada; publicação e
      execução real pendentes;
- [ ] canal de incidente e vulnerabilidade definido.

Nenhum item deve ser marcado como concluído sem evidência verificável.
