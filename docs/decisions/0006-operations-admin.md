# ADR 0006 — Controle comercial interno

- **Status:** proposto e implementado localmente; ainda não publicado
- **Data:** 2026-09-26

## Contexto

A corretora precisa registrar quais funcionários fecharam seguros, os valores do prêmio e da comissão
e o repasse atribuído a cada funcionário. O recurso contém dados comerciais e pessoais e, portanto,
não pode depender apenas de uma página estática ou de controles no navegador.

## Decisão

- manter a interface em `/admin/campanhas/gestao`, dentro da aplicação já protegida pelo Cloudflare
  Access;
- validar novamente o JWT do Access no Worker e usar o e-mail confirmado como identidade do autor;
- exigir um funcionário ativo com função `administrator` para qualquer consulta ou alteração;
- permitir a ativação do primeiro administrador somente enquanto a tabela de funcionários estiver
  vazia e somente para uma identidade já aprovada pelo Access;
- persistir funcionários, seguros fechados e eventos de auditoria no PostgreSQL/Aiven;
- usar `numeric(14, 2)` para valores monetários e validações que impedem comissão maior que prêmio e
  repasse maior que comissão;
- registrar, na mesma transação, os retratos anterior e posterior de cada alteração financeira;
- não permitir exclusão de funcionários ou vendas no V1; funcionários são desativados para preservar
  o vínculo histórico;
- conceder ao papel da aplicação somente `EXECUTE` em funções `SECURITY DEFINER`, sem acesso direto
  às novas tabelas;
- manter o módulo desativado no preview e não integrar pagamentos ou sistemas bancários.

## Consequências

- adicionar um administrador no painel não substitui a inclusão do e-mail na política do Cloudflare
  Access;
- a migration `0005_operations_admin.sql` deve ser aplicada antes do deploy que ativa
  `OPERATIONS_ADMIN_ENABLED`;
- o histórico de auditoria aumenta o volume armazenado e contém os mesmos dados do registro
  comercial; sua retenção deverá acompanhar a política aprovada para esses registros;
- uma futura integração de pagamento exigirá uma decisão separada, novos controles e aprovação
  explícita.
