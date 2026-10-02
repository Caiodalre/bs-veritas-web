import { notificationRecipient, notificationSender } from "./quote-notification";

type QuoteNotificationDlqMonitorEnvironment = {
  QUOTE_DLQ_MONITOR_ENABLED: string;
  QUOTE_NOTIFICATION_DLQ?: Queue;
  QUOTE_NOTIFICATION_EMAIL?: SendEmail;
};

type QuoteNotificationDlqMonitorDependencies = {
  getMetrics?: (queue: Pick<Queue, "metrics">) => Promise<QueueMetrics>;
  logger?: Pick<Console, "error" | "log">;
  sendAlert?: (emailBinding: SendEmail, metrics: QueueMetrics) => Promise<void>;
};

function formatOldestMessageTimestamp(timestamp: Date | undefined) {
  if (!timestamp || !Number.isFinite(timestamp.getTime())) {
    return "indisponível";
  }

  return timestamp.toISOString();
}

function validateMetrics(metrics: QueueMetrics) {
  if (
    !Number.isInteger(metrics.backlogCount) ||
    metrics.backlogCount < 0 ||
    !Number.isInteger(metrics.backlogBytes) ||
    metrics.backlogBytes < 0 ||
    (metrics.oldestMessageTimestamp !== undefined &&
      !Number.isFinite(metrics.oldestMessageTimestamp.getTime()))
  ) {
    throw new Error("Quote notification DLQ returned invalid metrics.");
  }
}

export function createQuoteNotificationDlqAlertMessage(metrics: QueueMetrics): EmailMessageBuilder {
  return {
    to: notificationRecipient,
    from: notificationSender,
    subject: "Alerta operacional: notificações pendentes — B&S Veritas",
    text: [
      "A fila de falhas de notificações contém mensagens não processadas.",
      "",
      `Quantidade pendente: ${metrics.backlogCount}`,
      `Tamanho total: ${metrics.backlogBytes} bytes`,
      `Mensagem mais antiga: ${formatOldestMessageTimestamp(metrics.oldestMessageTimestamp)}`,
      "",
      "Verifique a fila bs-veritas-quote-notifications-dlq no painel da Cloudflare.",
      "O conteúdo das mensagens não foi incluído neste alerta.",
    ].join("\n"),
  };
}

export async function sendQuoteNotificationDlqAlert(
  emailBinding: SendEmail,
  metrics: QueueMetrics,
): Promise<void> {
  await emailBinding.send(createQuoteNotificationDlqAlertMessage(metrics));
}

export async function handleQuoteNotificationDlqMonitor(
  env: QuoteNotificationDlqMonitorEnvironment,
  dependencies: QuoteNotificationDlqMonitorDependencies = {},
): Promise<void> {
  if (env.QUOTE_DLQ_MONITOR_ENABLED !== "true") {
    return;
  }

  const logger = dependencies.logger ?? console;

  if (!env.QUOTE_NOTIFICATION_DLQ || !env.QUOTE_NOTIFICATION_EMAIL) {
    logger.error(JSON.stringify({ event: "quote_notification_dlq_monitor_binding_missing" }));
    throw new Error("Quote notification DLQ monitor binding is missing.");
  }

  const getMetrics = dependencies.getMetrics ?? ((queue) => queue.metrics());
  const sendAlert = dependencies.sendAlert ?? sendQuoteNotificationDlqAlert;

  try {
    const metrics = await getMetrics(env.QUOTE_NOTIFICATION_DLQ);
    validateMetrics(metrics);

    if (metrics.backlogCount === 0) {
      logger.log(
        JSON.stringify({
          event: "quote_notification_dlq_monitor_completed",
          backlogCount: 0,
          backlogBytes: metrics.backlogBytes,
        }),
      );
      return;
    }

    await sendAlert(env.QUOTE_NOTIFICATION_EMAIL, metrics);
    logger.log(
      JSON.stringify({
        event: "quote_notification_dlq_alert_sent",
        backlogCount: metrics.backlogCount,
        backlogBytes: metrics.backlogBytes,
      }),
    );
  } catch (error) {
    logger.error(
      JSON.stringify({
        event: "quote_notification_dlq_monitor_failed",
        errorType: error instanceof Error ? error.name : "UnknownError",
      }),
    );
    // The runtime also records uncaught exceptions. Do not forward provider details or a cause.
    throw new Error("Quote notification DLQ monitor failed.");
  }
}
