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
- responder sucesso ao navegador quando o lead já foi gravado, mesmo se o enfileiramento falhar,
  evitando que uma nova tentativa do usuário duplique o lead;
- registrar somente eventos técnicos e tipos de erro, sem UUID ou dados pessoais nos logs.

## Consequências

- falhas temporárias de e-mail deixam de exigir nova submissão do visitante;
- a indisponibilidade da fila não remove um lead já persistido;
- a entrega da fila é pelo menos uma vez, portanto uma notificação duplicada pode ocorrer;
- a equipe consegue reconhecer duplicatas pelo mesmo UUID presente no e-mail;
- mensagens na fila gratuita possuem retenção limitada e exigem acompanhamento da fila de mensagens
  mortas;
- uma futura garantia forte de idempotência exigirá estado próprio de notificação no banco e uma
  migration separada.

## Evidências exigidas antes da publicação

- testes unitários do produtor e do consumidor;
- tipos, lint, formatação, build e testes de navegador aprovados;
- dry-run de produção listando fila, e-mail e Hyperdrive;
- dry-run de preview sem fila, e-mail, Hyperdrive, rate limiter ou segredo Turnstile;
- criação das filas principal e de mensagens mortas antes do deploy de produção.

## Referências

- [Cloudflare Queues — configuração](https://developers.cloudflare.com/queues/configuration/configure-queues/)
- [Cloudflare Queues — batching e retries](https://developers.cloudflare.com/queues/configuration/batching-retries/)
- [Cloudflare Queues — preços](https://developers.cloudflare.com/queues/platform/pricing/)
