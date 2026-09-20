/** @vitest-environment node */

import { describe, expect, it, vi } from "vitest";
import {
  createQuoteNotificationDlqAlertMessage,
  handleQuoteNotificationDlqMonitor,
} from "../worker/quote-notification-dlq-monitor";

function createLogger() {
  return {
    error: vi.fn(),
    log: vi.fn(),
  };
}

function createQueue(metrics: QueueMetrics): Queue {
  return {
    metrics: vi.fn<Queue["metrics"]>(async () => metrics),
    send: vi.fn<Queue["send"]>(),
    sendBatch: vi.fn<Queue["sendBatch"]>(),
  };
}

class TestSendEmail implements SendEmail {
  send(message: EmailMessage): Promise<EmailSendResult>;
  send(message: EmailMessageBuilder): Promise<EmailSendResult>;
  async send(message: EmailMessage | EmailMessageBuilder): Promise<EmailSendResult> {
    void message;
    return { messageId: "test-message-id" };
  }
}

const emailBinding = new TestSendEmail();

describe("handleQuoteNotificationDlqMonitor", () => {
  it("não consulta a fila quando o monitor está desativado", async () => {
    const getMetrics = vi.fn();

    await handleQuoteNotificationDlqMonitor({ QUOTE_DLQ_MONITOR_ENABLED: "false" }, { getMetrics });

    expect(getMetrics).not.toHaveBeenCalled();
  });

  it("falha explicitamente quando um binding obrigatório está ausente", async () => {
    const logger = createLogger();

    await expect(
      handleQuoteNotificationDlqMonitor(
        {
          QUOTE_DLQ_MONITOR_ENABLED: "true",
          QUOTE_NOTIFICATION_DLQ: createQueue({ backlogCount: 0, backlogBytes: 0 }),
        },
        { logger },
      ),
    ).rejects.toThrow("Quote notification DLQ monitor binding is missing.");

    expect(logger.error).toHaveBeenCalledWith(
      JSON.stringify({ event: "quote_notification_dlq_monitor_binding_missing" }),
    );
  });

  it("registra backlog vazio sem enviar alerta", async () => {
    const logger = createLogger();
    const sendAlert = vi.fn();
    const queue = createQueue({ backlogCount: 0, backlogBytes: 0 });

    await handleQuoteNotificationDlqMonitor(
      {
        QUOTE_DLQ_MONITOR_ENABLED: "true",
        QUOTE_NOTIFICATION_DLQ: queue,
        QUOTE_NOTIFICATION_EMAIL: emailBinding,
      },
      { logger, sendAlert },
    );

    expect(queue.metrics).toHaveBeenCalledOnce();
    expect(sendAlert).not.toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(
      JSON.stringify({
        event: "quote_notification_dlq_monitor_completed",
        backlogCount: 0,
        backlogBytes: 0,
      }),
    );
  });

  it("envia alerta técnico quando há mensagens pendentes", async () => {
    const logger = createLogger();
    const sendAlert = vi.fn();
    const metrics = {
      backlogCount: 2,
      backlogBytes: 384,
      oldestMessageTimestamp: new Date("2026-09-20T03:00:00.000Z"),
    } satisfies QueueMetrics;

    await handleQuoteNotificationDlqMonitor(
      {
        QUOTE_DLQ_MONITOR_ENABLED: "true",
        QUOTE_NOTIFICATION_DLQ: createQueue(metrics),
        QUOTE_NOTIFICATION_EMAIL: emailBinding,
      },
      { logger, sendAlert },
    );

    expect(sendAlert).toHaveBeenCalledWith(emailBinding, metrics);
    expect(logger.log).toHaveBeenCalledWith(
      JSON.stringify({
        event: "quote_notification_dlq_alert_sent",
        backlogCount: 2,
        backlogBytes: 384,
      }),
    );
  });

  it("registra apenas o tipo de erro quando a consulta falha", async () => {
    const logger = createLogger();
    const getMetrics = vi.fn(async () => {
      throw new TypeError("Sensitive queue provider detail.");
    });

    await expect(
      handleQuoteNotificationDlqMonitor(
        {
          QUOTE_DLQ_MONITOR_ENABLED: "true",
          QUOTE_NOTIFICATION_DLQ: createQueue({ backlogCount: 0, backlogBytes: 0 }),
          QUOTE_NOTIFICATION_EMAIL: emailBinding,
        },
        { getMetrics, logger },
      ),
    ).rejects.toThrow(TypeError);

    const loggedValue = logger.error.mock.calls.flat().join(" ");
    expect(loggedValue).toContain("quote_notification_dlq_monitor_failed");
    expect(loggedValue).toContain("TypeError");
    expect(loggedValue).not.toContain("Sensitive queue provider detail.");
  });
});

describe("createQuoteNotificationDlqAlertMessage", () => {
  it("inclui somente métricas e orientação operacional", () => {
    const message = createQuoteNotificationDlqAlertMessage({
      backlogCount: 3,
      backlogBytes: 512,
      oldestMessageTimestamp: new Date("2026-09-20T03:00:00.000Z"),
    });

    expect(message).toEqual({
      to: "bsveritascorretora@gmail.com",
      from: { email: "contato@bsveritas.com.br", name: "B&S Veritas" },
      subject: "Alerta operacional: notificações pendentes — B&S Veritas",
      text: expect.stringContaining("Quantidade pendente: 3"),
    });
    expect(message.text).toContain("Tamanho total: 512 bytes");
    expect(message.text).toContain("2026-09-20T03:00:00.000Z");
    expect(message.text).not.toContain("quoteId");
  });
});
