const notificationRecipient = "bsveritascorretora@gmail.com";
const notificationSender = {
  email: "contato@bsveritas.com.br",
  name: "B&S Veritas",
} satisfies EmailAddress;

const quoteIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const minimumRetryDelaySeconds = 60;
const maximumRetryDelaySeconds = 3_600;

export type QuoteNotificationQueueMessage = {
  quoteId: string;
};

type QuoteNotificationConsumerEnvironment = {
  QUOTE_NOTIFICATION_EMAIL?: SendEmail;
  QUOTE_NOTIFICATION_ENABLED: string;
};

type QuoteNotificationDependencies = {
  logger?: Pick<Console, "error" | "log" | "warn">;
  sendNotification?: typeof sendQuoteNotification;
};

function isQuoteNotificationQueueMessage(body: unknown): body is QuoteNotificationQueueMessage {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }

  const record = body as Record<string, unknown>;
  return (
    Object.keys(record).length === 1 &&
    typeof record.quoteId === "string" &&
    quoteIdPattern.test(record.quoteId)
  );
}

function getRetryDelaySeconds(attempts: number) {
  const exponent = Math.max(0, Math.min(attempts - 1, 6));
  return Math.min(minimumRetryDelaySeconds * 2 ** exponent, maximumRetryDelaySeconds);
}

export function createQuoteNotificationMessage(quoteId: string): EmailMessageBuilder {
  return {
    to: notificationRecipient,
    from: notificationSender,
    subject: "Nova solicitação de cotação — B&S Veritas",
    text: [
      "Uma nova solicitação de cotação foi registrada com sucesso.",
      "",
      `Identificador: ${quoteId}`,
      "",
      "Consulte o banco seguro da B&S Veritas para acessar os detalhes.",
      "Esta é uma notificação automática. Não responda a este e-mail.",
    ].join("\n"),
  };
}

export async function sendQuoteNotification(
  emailBinding: SendEmail,
  quoteId: string,
): Promise<void> {
  await emailBinding.send(createQuoteNotificationMessage(quoteId));
}

export async function enqueueQuoteNotification(
  queue: Pick<Queue<QuoteNotificationQueueMessage>, "send">,
  quoteId: string,
): Promise<void> {
  await queue.send({ quoteId }, { contentType: "json" });
}

export async function handleQuoteNotificationBatch(
  batch: MessageBatch<unknown>,
  env: QuoteNotificationConsumerEnvironment,
  dependencies: QuoteNotificationDependencies = {},
): Promise<void> {
  const logger = dependencies.logger ?? console;
  const sendNotification = dependencies.sendNotification ?? sendQuoteNotification;

  for (const message of batch.messages) {
    if (!isQuoteNotificationQueueMessage(message.body)) {
      logger.warn(JSON.stringify({ event: "quote_notification_invalid_message" }));
      message.ack();
      continue;
    }

    if (env.QUOTE_NOTIFICATION_ENABLED !== "true") {
      logger.warn(JSON.stringify({ event: "quote_notification_disabled" }));
      message.ack();
      continue;
    }

    if (!env.QUOTE_NOTIFICATION_EMAIL) {
      logger.error(
        JSON.stringify({
          event: "quote_notification_binding_missing",
          attempts: message.attempts,
        }),
      );
      message.retry({ delaySeconds: getRetryDelaySeconds(message.attempts) });
      continue;
    }

    try {
      await sendNotification(env.QUOTE_NOTIFICATION_EMAIL, message.body.quoteId);
      message.ack();
      logger.log(
        JSON.stringify({
          event: "quote_notification_sent",
          attempts: message.attempts,
        }),
      );
    } catch (error) {
      logger.error(
        JSON.stringify({
          event: "quote_notification_failed",
          errorType: error instanceof Error ? error.name : "UnknownError",
          attempts: message.attempts,
        }),
      );
      message.retry({ delaySeconds: getRetryDelaySeconds(message.attempts) });
    }
  }
}
