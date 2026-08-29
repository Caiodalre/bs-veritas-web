# Segurança do B&S Veritas Web

Este documento define os princípios, limites e controles de segurança do site da **B&S VERITAS CORRETORA DE SEGUROS LTDA**.

Ele não declara que todos os controles descritos já estão ativos. Cada seção distingue regras obrigatórias de mecanismos que ainda serão implementados e verificados antes da produção.

## Escopo

Esta política cobre:

- aplicação Next.js;
- formulários de cotação e contato;
- banco de leads;
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
- fundação do Drizzle ORM sem credenciais reais;
- `.gitignore` gerado para evitar o versionamento normal de arquivos locais de ambiente;
- regras de desenvolvimento em `AGENTS.md`;
- preview estático na Cloudflare Workers sem dados reais;
- HTTPS, proteção contra framing, `nosniff`, política de referência e política de permissões;
- cabeçalho `X-Robots-Tag: noindex` no endereço `workers.dev`.

Ainda não estão configurados:

- banco de produção;
- formulários públicos funcionais;
- Zod e schemas de entrada;
- rate limiting;
- honeypot;
- Cloudflare Turnstile;
- Content Security Policy e HSTS finais para o domínio de produção;
- provedor de notificação;
- analytics;
- monitoramento e alertas de produção.

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

O contato inicial poderá coletar somente:

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

O campo de mensagem deverá orientar o visitante a não enviar dados sensíveis. A política de retenção dos leads precisa ser definida antes da produção.

## Formulários públicos

O fluxo planejado terá as seguintes camadas:

```text
requisição
   -> limite de tamanho e formato
      -> schema de validação no servidor
         -> honeypot
            -> rate limiting
               -> verificação Turnstile
                  -> normalização
                     -> serviço de aplicação
```

Regras:

- ignorar campos não definidos pelo schema;
- aplicar limites de tamanho a textos livres;
- normalizar telefone antes da persistência;
- impedir envios múltiplos acidentais na interface;
- não confiar em cabeçalhos de origem como único controle;
- não revelar qual camada de proteção rejeitou uma requisição;
- definir timeouts para serviços externos.

Os limites numéricos serão estabelecidos com base no ambiente real e testados antes do lançamento.

## Banco de dados

- o navegador nunca terá credencial administrativa do PostgreSQL;
- gravações de leads passarão pelo backend;
- o usuário do banco terá apenas as permissões necessárias;
- ambientes não compartilharão credenciais;
- migrations serão versionadas e revisadas;
- backups e restauração serão validados antes da produção;
- consultas deverão ser feitas por APIs seguras do ORM, sem concatenação manual de entrada externa;
- dados reais não serão copiados para testes locais ou previews.

O schema atual está vazio e não existe conexão de produção configurada.

## Segredos e variáveis de ambiente

Segredos incluem senhas, tokens, chaves privadas, URLs de banco com credenciais e chaves administrativas.

Regras:

- armazenar segredos locais somente em arquivos ignorados pelo Git;
- armazenar segredos de preview e produção na plataforma correspondente;
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

Antes da produção serão definidos e testados:

- `Content-Security-Policy`;
- `Strict-Transport-Security`;
- `X-Content-Type-Options`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- política de framing;
- comportamento de cache para respostas sensíveis.

A Content Security Policy será construída a partir dos recursos realmente utilizados. Não serão liberadas origens por conveniência sem justificativa.

## Autenticação administrativa

Embora o V1 não tenha painel administrativo público, as plataformas de infraestrutura deverão seguir estas regras:

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
- uma estratégia de reversão será documentada antes do lançamento.

## E-mail e domínio

Quando o provedor for definido, o domínio deverá utilizar:

- SPF;
- DKIM;
- DMARC com implantação gradual e monitorada;
- DNSSEC quando compatível com a configuração final;
- acesso administrativo protegido por MFA.

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

O canal público de segurança ainda não foi definido. Antes do lançamento, deverá existir um endereço corporativo apropriado e um procedimento interno para receber, classificar e responder relatos.

Dados de vulnerabilidade não devem ser enviados para formulários comerciais comuns quando o canal oficial estiver disponível.

## Checklist mínimo antes da produção

- [ ] schemas de entrada e testes de casos inválidos;
- [ ] honeypot, rate limiting e Turnstile verificados;
- [ ] permissões mínimas do banco;
- [ ] política de retenção aprovada;
- [ ] backups e restauração testados;
- [ ] secrets separados por ambiente;
- [ ] headers HTTP avaliados no domínio final;
- [ ] logs revisados contra exposição de dados pessoais;
- [ ] previews fora dos buscadores;
- [ ] SPF, DKIM e DMARC do provedor de e-mail;
- [ ] MFA nas plataformas administrativas;
- [ ] dependências e scripts de instalação revisados;
- [ ] testes, lint e build aprovados;
- [ ] estratégia de rollback documentada;
- [ ] canal de incidente e vulnerabilidade definido.

Nenhum item deve ser marcado como concluído sem evidência verificável.
