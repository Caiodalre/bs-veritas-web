# ADR 0005 — Fila de notificação da cotação

- Status: aprovado para publicação
- Data: 2026-09-19

## Contexto

O registro da cotação já é confirmado no PostgreSQL antes da tentativa de e-mail. Entretanto, uma
falha temporária no serviço de e-mail encerrava a tentativa sem recuperação automática. Repetir a
requisição pelo navegador não é seguro porque poderia criar um segundo lead.

## Decisão

- publicar o UUID da cotação em uma Cloudflare Queue depois da persistência;
- não colocar nome, e-mail, telefone, mensagem ou outro dado pessoal na fila;
- consumir a fila no mesmo Worker e enviar uma notificação que contém somente o UUID;
- confirmar a mensagem após o envio do e-mail;
- tentar novamente falhas temporárias com espera progressiva entre 60 segundos e uma hora;
- limitar a oito as novas tentativas e encaminhar mensagens esgotadas para uma fila de mensagens
  mortas;
- manter os bindings da fila e do e-mail somente em produção;
- consultar somente as métricas da fila de mensagens mortas a cada seis horas, sem consumir ou
  remover mensagens, e enviar um alerta técnico quando o backlog for maior que zero;
- incluir no alerta apenas contagem, tamanho total e horário da mensagem mais antiga, sem UUID,
  corpo da mensagem ou dado pessoal;
- responder sucesso ao navegador quando o lead já foi gravado, mesmo se o enfileiramento falhar,
  evitando que uma nova tentativa do usuário duplique o lead;
- registrar somente eventos técnicos e tipos de erro, sem UUID ou dados pessoais nos logs.

## Consequências

- falhas temporárias de e-mail deixam de exigir nova submissão do visitante;
- a indisponibilidade da fila não remove um lead já persistido;
- a entrega da fila é pelo menos uma vez, portanto uma notificação duplicada pode ocorrer;
- a equipe consegue reconhecer duplicatas pelo mesmo UUID presente no e-mail;
- a configuração publicada retém mensagens não consumidas por 24 horas; a fila de mensagens mortas
  exige acompanhamento dentro desse período;
- uma futura garantia forte de idempotência exigirá estado próprio de notificação no banco e uma
  migration separada.

## Evidências exigidas antes da publicação

- testes unitários do produtor e do consumidor;
- tipos, lint, formatação, build e testes de navegador aprovados;
- dry-run de produção listando fila, e-mail e Hyperdrive;
- dry-run de preview sem fila, e-mail, Hyperdrive, rate limiter ou segredo Turnstile;
- criação das filas principal e de mensagens mortas antes do deploy de produção.

## Evidência operacional — 2026-09-20

- fila principal vinculada ao Worker `bs-veritas-web` como produtor e consumidor;
- consumidor publicado com lote 5, espera máxima de 5 segundos, oito novas tentativas, atraso de
  60 segundos e encaminhamento para `bs-veritas-quote-notifications-dlq`;
- fila principal e fila de mensagens mortas com backlog em tempo real de 0 mensagens e 0 bytes;
- nenhuma pausa de entrega indicada pela API;
- fila de mensagens mortas sem consumidor, com retenção de 24 horas; alerta ou inspeção operacional
  dentro desse período permanece pendente em produção;
- monitor da DLQ implementado localmente para o cron `47 */6 * * *`, com e-mail somente quando o
  backlog é maior que zero e logs limitados a métricas técnicas;
- testes, tipos, lint, formatação, build e dry-runs de produção e preview aprovados; publicação e
  primeira execução real do alerta permanecem pendentes.

## Referências

- [Cloudflare Queues — configuração](https://developers.cloudflare.com/queues/configuration/configure-queues/)
- [Cloudflare Queues — batching e retries](https://developers.cloudflare.com/queues/configuration/batching-retries/)
- [Cloudflare Queues — preços](https://developers.cloudflare.com/queues/platform/pricing/)
