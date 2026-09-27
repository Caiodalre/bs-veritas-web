# ADR 0006 — Controle comercial interno

- **Status:** base operacional publicada; evolução do portal implementada localmente e ainda não
  publicada
- **Data:** 2026-09-27

## Contexto

A corretora precisa registrar quais funcionários fecharam seguros, os valores do prêmio e da comissão
e o repasse atribuído a cada funcionário. O recurso contém dados comerciais e pessoais e, portanto,
não pode depender apenas de uma página estática ou de controles no navegador.

## Decisão

- oferecer a entrada principal em `/painel`, preservando `/admin/campanhas/gestao` durante a
  transição;
- usar o Cloudflare Access como tela de entrada e provedor de identidade, sem criar ou armazenar
  senhas no site;
- validar novamente o JWT do Access no Worker e vincular o `sub` verificado ao cadastro previamente
  autorizado pelo e-mail, impedindo que uma mesma identidade seja vinculada a duas pessoas;
- adotar três níveis funcionais: `ADM master` (`administrator` com `is_master`), administrador e
  funcionário;
- permitir que o ADM master cadastre, altere, desative e delegue perfis; permitir que o administrador
  consulte a equipe e gerencie vendas; limitar o funcionário às próprias vendas e repasses;
- aplicar as mesmas regras de autorização no endpoint e nas funções PostgreSQL, sem depender de
  controles visuais do navegador;
- permitir a ativação do primeiro ADM master somente enquanto a tabela de funcionários estiver vazia
  e somente para uma identidade já aprovada pelo Access;
- persistir funcionários, seguros fechados e eventos de auditoria no PostgreSQL/Aiven;
- usar `numeric(14, 2)` para valores monetários e validações que impedem comissão maior que prêmio e
  repasse maior que comissão;
- registrar, na mesma transação, os retratos anterior e posterior de cada alteração financeira;
- não permitir exclusão de funcionários ou vendas no V1; funcionários são desativados para preservar
  o vínculo histórico;
- manter funcionários, vendas, repasses e eventos de auditoria sem exclusão automática no V1;
- exigir uma nova decisão formal, migration ou rotina específica, backup recuperável e validação
  antes de qualquer descarte ou anonimização futura desses registros;
- conceder ao papel da aplicação somente `EXECUTE` em funções `SECURITY DEFINER`, sem acesso direto
  às novas tabelas;
- manter o módulo desativado no preview e não integrar pagamentos ou sistemas bancários.

## Consequências

- a migration `0005_operations_admin.sql` foi aplicada e validada em produção em 2026-09-27;
- a migration `0006_staff_portal_access.sql` foi aplicada e validada em produção em 2026-09-27;
- a adoção operacional e a expansão dos perfis do portal permanecem em standby até nova aprovação;
- a aplicação Cloudflare Access deve proteger `/painel*` e a API operacional, admitindo somente os
  e-mails da equipe; o cadastro no PostgreSQL continua sendo uma segunda autorização obrigatória;
- remover ou desativar um funcionário no banco bloqueia os dados do painel mesmo que ainda exista
  uma sessão do Access;
- alterar o e-mail de um funcionário remove o vínculo anterior e exige nova autenticação da
  identidade correspondente;
- o histórico de auditoria aumenta o volume armazenado e contém os mesmos dados do registro
  comercial; a política inicial aprovada em 2026-09-26 é mantê-lo sem exclusão automática, junto
  aos registros comerciais correspondentes;
- a retenção de cinco anos dos pedidos de cotação não se aplica automaticamente ao controle
  comercial;
- uma futura integração de pagamento exigirá uma decisão separada, novos controles e aprovação
  explícita.
