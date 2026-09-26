/** @vitest-environment node */

import { describe, expect, it, vi } from "vitest";
import { createRscAssetRequest, handleScheduledWorker, handleWorkerRequest } from "../worker/index";
import {
  handleQuoteNotificationBatch,
  type QuoteNotificationQueueMessage,
} from "../worker/quote-notification";
import type { QuoteEndpointDependencies } from "../worker/quote-endpoint";
import type { QuoteRequestRepository } from "@/features/quote/service";

const createdQuoteId = "00000000-0000-4000-8000-000000000000";
const receivedAt = new Date("2030-01-15T14:30:45.123Z");

const validSubmission = {
  fullName: "Pessoa Exemplo",
  phone: "(11) 99999-0000",
  email: "pessoa@example.invalid",
  insuranceType: "auto",
  city: "Cidade Exemplo",
  message: "Mensagem inteiramente fictícia.",
  website: "",
  turnstileToken: "test-token",
};

function createAssetsBinding() {
  const fetch = vi.fn<Env["ASSETS"]["fetch"]>(async (input) => {
    void input;
    return new Response("asset", { status: 200 });
  });
  const connect = vi.fn<Env["ASSETS"]["connect"]>(() => {
    throw new Error("Socket connections are not available in this test.");
  });

  return { fetch, connect } satisfies Env["ASSETS"];
}

type TestEnv = Env & {
  HYPERDRIVE: Hyperdrive;
  QUOTE_NOTIFICATION_EMAIL: SendEmail;
  QUOTE_NOTIFICATION_QUEUE: Queue<QuoteNotificationQueueMessage>;
  QUOTE_RATE_LIMITER: RateLimit;
  TURNSTILE_SECRET_KEY: string;
};

function createHyperdriveBinding(): Hyperdrive {
  return {
    connect: vi.fn<Hyperdrive["connect"]>(() => {
      throw new Error("Hyperdrive sockets are not available in this test.");
    }),
    connectionString: "postgres://hyperdrive.invalid/database",
    host: "hyperdrive.invalid",
    ip: "240.0.0.1",
    port: 5432,
    user: "test-user",
    password: "test-password",
    database: "database",
  };
}

function createRateLimitBinding(success = true): RateLimit {
  return {
    limit: vi.fn<RateLimit["limit"]>(async () => ({ success })),
  };
}

function createNotificationQueue(): Queue<QuoteNotificationQueueMessage> {
  const metrics = {
    backlogCount: 0,
    backlogBytes: 0,
  };

  return {
    metrics: vi.fn<Queue<QuoteNotificationQueueMessage>["metrics"]>(async () => metrics),
    send: vi.fn<Queue<QuoteNotificationQueueMessage>["send"]>(async () => ({
      metadata: { metrics },
    })),
    sendBatch: vi.fn<Queue<QuoteNotificationQueueMessage>["sendBatch"]>(async () => ({
      metadata: { metrics },
    })),
  };
}

class TestSendEmail implements SendEmail {
  readonly messages: EmailMessageBuilder[] = [];
  failure?: Error;

  send(message: EmailMessage): Promise<EmailSendResult>;
  send(message: EmailMessageBuilder): Promise<EmailSendResult>;
  async send(message: EmailMessage | EmailMessageBuilder): Promise<EmailSendResult> {
    if (this.failure) {
      throw this.failure;
    }

    if ("subject" in message) {
      this.messages.push(message);
    }

    return { messageId: "test-message-id" };
  }
}

function createWorkerEnv(
  assets = createAssetsBinding(),
  emailBinding: SendEmail = new TestSendEmail(),
  notificationQueue = createNotificationQueue(),
): TestEnv {
  return {
    ASSETS: assets,
    CAMPAIGN_ADMIN_ENABLED: "false",
    HYPERDRIVE: createHyperdriveBinding(),
    QUOTE_ADMIN_ENABLED: "false",
    QUOTE_DLQ_MONITOR_ENABLED: "false",
    QUOTE_NOTIFICATION_EMAIL: emailBinding,
    QUOTE_NOTIFICATION_ENABLED: "false",
    QUOTE_NOTIFICATION_QUEUE: notificationQueue,
    QUOTE_RETENTION_CLEANUP_ENABLED: "false",
    QUOTE_SUBMISSION_ENABLED: "true",
    QUOTE_RATE_LIMITER: createRateLimitBinding(),
    QUOTE_EXPECTED_HOSTNAME: "bsveritas.com.br",
    TURNSTILE_SECRET_KEY: "test-secret",
  };
}

function createQueueMessage(body: unknown, attempts = 1) {
  const ack = vi.fn<Message<unknown>["ack"]>();
  const retry = vi.fn<Message<unknown>["retry"]>();
  const message = {
    id: "queue-message-id",
    timestamp: new Date("2030-01-15T14:31:00.000Z"),
    body,
    attempts,
    ack,
    retry,
  } satisfies Message<unknown>;

  return { ack, message, retry };
}

function createScheduledController(cron: string): ScheduledController {
  return {
    cron,
    noRetry: vi.fn(),
    scheduledTime: Date.parse("2026-09-20T06:17:00.000Z"),
  };
}

function createQueueBatch(messages: readonly Message<unknown>[]): MessageBatch<unknown> {
  return {
    messages,
    queue: "bs-veritas-quote-notifications",
    metadata: {
      metrics: {
        backlogCount: messages.length,
        backlogBytes: 128,
      },
    },
    ackAll: vi.fn(),
    retryAll: vi.fn(),
  };
}

function createQuoteRequest(body: unknown = validSubmission) {
  return new Request("https://bsveritas.com.br/api/quote", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createQuoteDependencies() {
  const create = vi.fn<QuoteRequestRepository["create"]>(async () => ({
    id: createdQuoteId,
  }));
  const createRepository = vi.fn(() => ({ create }) satisfies QuoteRequestRepository);
  const fetcher = vi.fn<typeof fetch>(async () =>
    Response.json({
      success: true,
      hostname: "bsveritas.com.br",
      action: "quote",
    }),
  );
  const logger = { error: vi.fn() };

  return {
    dependencies: {
      createRepository,
      fetcher,
      logger,
      now: () => receivedAt,
    } satisfies QuoteEndpointDependencies,
    create,
    createRepository,
    fetcher,
    logger,
  };
}

function expectApiSecurityHeaders(response: Response) {
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("content-security-policy")).toBe(
    "default-src 'none'; frame-ancestors 'none'",
  );
  expect(response.headers.get("permissions-policy")).toBe(
    "camera=(), geolocation=(), microphone=()",
  );
  expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  expect(response.headers.get("x-frame-options")).toBe("DENY");
}

describe("quote worker", () => {
  it("encaminha rotas públicas para os assets estáticos", async () => {
    const assets = createAssetsBinding();
    const request = new Request("https://example.test/seguros");

    const response = await handleWorkerRequest(request, createWorkerEnv(assets));

    expect(response.status).toBe(200);
    expect(assets.fetch).toHaveBeenCalledWith(request);
  });

  it("mapeia payloads RSC estáticos para a estrutura gerada pelo Next.js", async () => {
    const assets = createAssetsBinding();
    const request = new Request(
      "https://example.test/seguros/auto/__next.seguros.$d$slug.__PAGE__.txt?_rsc=teste",
    );

    await handleWorkerRequest(request, createWorkerEnv(assets));

    const forwardedRequest = assets.fetch.mock.calls[0]?.[0];
    expect(forwardedRequest).toBeInstanceOf(Request);
    expect((forwardedRequest as Request).url).toBe(
      "https://example.test/seguros/auto/__next.seguros/$d$slug/__PAGE__.txt?_rsc=teste",
    );
  });

  it("não reescreve caminhos que não sejam payloads RSC conhecidos", () => {
    const request = new Request("https://example.test/seguros/auto");

    expect(createRscAssetRequest(request)).toBe(request);
  });

  it("rejeita métodos diferentes de POST", async () => {
    const assets = createAssetsBinding();

    const response = await handleWorkerRequest(
      new Request("https://example.test/api/quote"),
      createWorkerEnv(assets),
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
    expectApiSecurityHeaders(response);
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it("não acessa proteção, banco ou notificação quando a coleta está desativada", async () => {
    const assets = createAssetsBinding();
    const env = createWorkerEnv(assets);
    env.QUOTE_SUBMISSION_ENABLED = "false";
    const { dependencies, createRepository, fetcher } = createQuoteDependencies();

    const response = await handleWorkerRequest(createQuoteRequest(), env, dependencies);

    expect(response.status).toBe(503);
    expectApiSecurityHeaders(response);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "quote_submission_disabled",
        message: "Solicitações de cotação não estão disponíveis neste ambiente.",
      },
    });
    expect(env.QUOTE_RATE_LIMITER.limit).not.toHaveBeenCalled();
    expect(createRepository).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it("falha de forma fechada quando a coleta está ativa sem bindings obrigatórios", async () => {
    const assets = createAssetsBinding();
    const env: Env = {
      ASSETS: assets,
      CAMPAIGN_ADMIN_ENABLED: "false",
      QUOTE_ADMIN_ENABLED: "false",
      QUOTE_EXPECTED_HOSTNAME: "bsveritas.com.br",
      QUOTE_DLQ_MONITOR_ENABLED: "false",
      QUOTE_NOTIFICATION_ENABLED: "false",
      QUOTE_RETENTION_CLEANUP_ENABLED: "false",
      QUOTE_SUBMISSION_ENABLED: "true",
    };

    const response = await handleWorkerRequest(createQuoteRequest(), env);

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("60");
    expectApiSecurityHeaders(response);
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it("falha antes do banco quando a notificação está ativa sem fila", async () => {
    const assets = createAssetsBinding();
    const completeEnv = createWorkerEnv(assets);
    const env: Env = {
      ...completeEnv,
      QUOTE_NOTIFICATION_ENABLED: "true",
      QUOTE_NOTIFICATION_QUEUE: undefined,
    };
    const { dependencies, createRepository, fetcher } = createQuoteDependencies();

    const response = await handleWorkerRequest(createQuoteRequest(), env, dependencies);

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(createRepository).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it("registra uma solicitação validada pelo Turnstile usando o Hyperdrive", async () => {
    const assets = createAssetsBinding();
    const { dependencies, create, createRepository, fetcher } = createQuoteDependencies();

    const response = await handleWorkerRequest(
      createQuoteRequest(),
      createWorkerEnv(assets),
      dependencies,
    );

    expect(response.status).toBe(201);
    expectApiSecurityHeaders(response);
    await expect(response.json()).resolves.toEqual({
      data: { id: createdQuoteId },
    });
    expect(createRepository).toHaveBeenCalledWith("postgres://hyperdrive.invalid/database");
    expect(fetcher).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({
      fullName: "Pessoa Exemplo",
      phone: "11999990000",
      email: "pessoa@example.invalid",
      insuranceType: "auto",
      city: "Cidade Exemplo",
      message: "Mensagem inteiramente fictícia.",
      privacyPolicyVersion: "1.1",
      retentionExpiresAt: new Date("2035-01-15T14:30:45.123Z"),
    });
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it("enfileira somente o identificador da cotação", async () => {
    const assets = createAssetsBinding();
    const emailBinding = new TestSendEmail();
    const notificationQueue = createNotificationQueue();
    const env = createWorkerEnv(assets, emailBinding, notificationQueue);
    env.QUOTE_NOTIFICATION_ENABLED = "true";
    const { dependencies } = createQuoteDependencies();

    const response = await handleWorkerRequest(createQuoteRequest(), env, dependencies);

    expect(response.status).toBe(201);
    expect(notificationQueue.send).toHaveBeenCalledWith(
      { quoteId: createdQuoteId },
      { contentType: "json" },
    );
    expect(emailBinding.messages).toHaveLength(0);
  });

  it("mantém a cotação aceita quando o enfileiramento falha", async () => {
    const notificationQueue = createNotificationQueue();
    vi.mocked(notificationQueue.send).mockRejectedValueOnce(
      new Error("Sensitive queue provider detail."),
    );
    const env = createWorkerEnv(createAssetsBinding(), new TestSendEmail(), notificationQueue);
    env.QUOTE_NOTIFICATION_ENABLED = "true";
    const { dependencies, logger } = createQuoteDependencies();

    const response = await handleWorkerRequest(createQuoteRequest(), env, dependencies);

    expect(response.status).toBe(201);
    expect(logger.error).toHaveBeenCalledWith(
      JSON.stringify({ event: "quote_notification_enqueue_failed", errorType: "Error" }),
    );
    expect(String(logger.error.mock.calls[0]?.[0])).not.toContain(
      "Sensitive queue provider detail.",
    );
  });

  it("envia a notificação consumida e confirma a mensagem", async () => {
    const emailBinding = new TestSendEmail();
    const { ack, message, retry } = createQueueMessage({ quoteId: createdQuoteId });
    const logger = {
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
    };

    await handleQuoteNotificationBatch(
      createQueueBatch([message]),
      {
        QUOTE_NOTIFICATION_EMAIL: emailBinding,
        QUOTE_NOTIFICATION_ENABLED: "true",
      },
      { logger },
    );

    expect(ack).toHaveBeenCalledOnce();
    expect(retry).not.toHaveBeenCalled();
    expect(emailBinding.messages).toEqual([
      {
        to: "bsveritascorretora@gmail.com",
        from: { email: "contato@bsveritas.com.br", name: "B&S Veritas" },
        subject: "Nova solicitação de cotação — B&S Veritas",
        text: expect.stringContaining(createdQuoteId),
      },
    ]);
    expect(logger.log).toHaveBeenCalledWith(
      JSON.stringify({ event: "quote_notification_sent", attempts: 1 }),
    );

    const notification = JSON.stringify(emailBinding.messages[0]);
    expect(notification).not.toContain(validSubmission.fullName);
    expect(notification).not.toContain(validSubmission.phone);
    expect(notification).not.toContain(validSubmission.email);
    expect(notification).not.toContain(validSubmission.city);
    expect(notification).not.toContain(validSubmission.message);
  });

  it("reagenda a mensagem com atraso crescente quando o e-mail falha", async () => {
    const emailBinding = new TestSendEmail();
    emailBinding.failure = new Error("Sensitive email provider detail.");
    const { ack, message, retry } = createQueueMessage({ quoteId: createdQuoteId }, 2);
    const logger = {
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
    };

    await handleQuoteNotificationBatch(
      createQueueBatch([message]),
      {
        QUOTE_NOTIFICATION_EMAIL: emailBinding,
        QUOTE_NOTIFICATION_ENABLED: "true",
      },
      { logger },
    );

    expect(ack).not.toHaveBeenCalled();
    expect(retry).toHaveBeenCalledWith({ delaySeconds: 120 });
    expect(logger.error).toHaveBeenCalledWith(
      JSON.stringify({
        event: "quote_notification_failed",
        errorType: "Error",
        attempts: 2,
      }),
    );
    expect(String(logger.error.mock.calls[0]?.[0])).not.toContain(
      "Sensitive email provider detail.",
    );
  });

  it("reagenda a mensagem quando o binding de e-mail está ausente", async () => {
    const { ack, message, retry } = createQueueMessage({ quoteId: createdQuoteId });
    const logger = {
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
    };

    await handleQuoteNotificationBatch(
      createQueueBatch([message]),
      {
        QUOTE_NOTIFICATION_ENABLED: "true",
      },
      { logger },
    );

    expect(ack).not.toHaveBeenCalled();
    expect(retry).toHaveBeenCalledWith({ delaySeconds: 60 });
    expect(logger.error).toHaveBeenCalledWith(
      JSON.stringify({
        event: "quote_notification_binding_missing",
        attempts: 1,
      }),
    );
  });

  it("descarta mensagens inválidas sem chamar o e-mail", async () => {
    const emailBinding = new TestSendEmail();
    const { ack, message, retry } = createQueueMessage({
      quoteId: "identificador-inválido",
      email: "dado-que-nao-deveria-estar-na-fila@example.invalid",
    });
    const logger = {
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
    };

    await handleQuoteNotificationBatch(
      createQueueBatch([message]),
      {
        QUOTE_NOTIFICATION_EMAIL: emailBinding,
        QUOTE_NOTIFICATION_ENABLED: "true",
      },
      { logger },
    );

    expect(ack).toHaveBeenCalledOnce();
    expect(retry).not.toHaveBeenCalled();
    expect(emailBinding.messages).toHaveLength(0);
    expect(logger.warn).toHaveBeenCalledWith(
      JSON.stringify({ event: "quote_notification_invalid_message" }),
    );
  });

  it("limita solicitações por origem antes de chamar Turnstile e banco", async () => {
    const assets = createAssetsBinding();
    const env = createWorkerEnv(assets);
    env.QUOTE_RATE_LIMITER = createRateLimitBinding(false);
    const { dependencies, createRepository, fetcher } = createQuoteDependencies();
    const request = createQuoteRequest();
    request.headers.set("cf-connecting-ip", "203.0.113.9");

    const response = await handleWorkerRequest(request, env, dependencies);

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("10");
    expectApiSecurityHeaders(response);
    expect(env.QUOTE_RATE_LIMITER.limit).toHaveBeenCalledWith({ key: "203.0.113.9" });
    expect(createRepository).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("falha de forma fechada quando o rate limiter está indisponível", async () => {
    const assets = createAssetsBinding();
    const env = createWorkerEnv(assets);
    vi.mocked(env.QUOTE_RATE_LIMITER.limit).mockRejectedValueOnce(
      new Error("Rate limiter unavailable."),
    );
    const { dependencies, createRepository, fetcher } = createQuoteDependencies();

    const response = await handleWorkerRequest(createQuoteRequest(), env, dependencies);

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("10");
    expectApiSecurityHeaders(response);
    expect(createRepository).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejeita mídia incompatível antes de chamar serviços externos", async () => {
    const assets = createAssetsBinding();
    const { dependencies, createRepository, fetcher } = createQuoteDependencies();
    const request = new Request("https://bsveritas.com.br/api/quote", {
      method: "POST",
      body: "not-json",
    });

    const response = await handleWorkerRequest(request, createWorkerEnv(assets), dependencies);

    expect(response.status).toBe(415);
    expectApiSecurityHeaders(response);
    expect(createRepository).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejeita dados inválidos antes do Turnstile e do banco", async () => {
    const assets = createAssetsBinding();
    const { dependencies, createRepository, fetcher } = createQuoteDependencies();

    const response = await handleWorkerRequest(
      createQuoteRequest({ ...validSubmission, website: "bot" }),
      createWorkerEnv(assets),
      dependencies,
    );

    expect(response.status).toBe(422);
    expectApiSecurityHeaders(response);
    expect(createRepository).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("não grava quando o Turnstile rejeita a solicitação", async () => {
    const assets = createAssetsBinding();
    const { dependencies, createRepository, fetcher } = createQuoteDependencies();
    fetcher.mockResolvedValueOnce(
      Response.json({
        success: false,
        hostname: "bsveritas.com.br",
        action: "quote",
      }),
    );

    const response = await handleWorkerRequest(
      createQuoteRequest(),
      createWorkerEnv(assets),
      dependencies,
    );

    expect(response.status).toBe(400);
    expectApiSecurityHeaders(response);
    expect(createRepository).not.toHaveBeenCalled();
  });

  it("falha de forma fechada quando a verificação está indisponível", async () => {
    const assets = createAssetsBinding();
    const { dependencies, createRepository, fetcher } = createQuoteDependencies();
    fetcher.mockRejectedValueOnce(new Error("Service unavailable."));

    const response = await handleWorkerRequest(
      createQuoteRequest(),
      createWorkerEnv(assets),
      dependencies,
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("60");
    expectApiSecurityHeaders(response);
    expect(createRepository).not.toHaveBeenCalled();
  });

  it("não expõe dados pessoais quando a persistência falha", async () => {
    const assets = createAssetsBinding();
    const { dependencies, create, logger } = createQuoteDependencies();
    create.mockRejectedValueOnce(new Error("Sensitive database detail."));

    const response = await handleWorkerRequest(
      createQuoteRequest(),
      createWorkerEnv(assets),
      dependencies,
    );
    const responseBody = JSON.stringify(await response.json());
    const loggedValue = String(logger.error.mock.calls[0]?.[0]);

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("60");
    expectApiSecurityHeaders(response);
    expect(responseBody).not.toContain(validSubmission.email);
    expect(responseBody).not.toContain("Sensitive database detail");
    expect(loggedValue).toBe(JSON.stringify({ event: "quote_request_failed", errorType: "Error" }));
    expect(loggedValue).not.toContain(validSubmission.email);
    expect(loggedValue).not.toContain("Sensitive database detail");
  });
});

describe("scheduled worker routing", () => {
  it("executa somente o monitor da DLQ no cron de seis horas", async () => {
    const env = createWorkerEnv();
    const handleDlqMonitor = vi.fn(async () => undefined);
    const handleRetentionCleanup = vi.fn(async () => undefined);

    await handleScheduledWorker(createScheduledController("47 */6 * * *"), env, {
      handleDlqMonitor,
      handleRetentionCleanup,
    });

    expect(handleDlqMonitor).toHaveBeenCalledOnce();
    expect(handleDlqMonitor).toHaveBeenCalledWith(env);
    expect(handleRetentionCleanup).not.toHaveBeenCalled();
  });

  it("executa somente a limpeza de retenção no cron diário", async () => {
    const controller = createScheduledController("17 6 * * *");
    const env = createWorkerEnv();
    const handleDlqMonitor = vi.fn(async () => undefined);
    const handleRetentionCleanup = vi.fn(async () => undefined);

    await handleScheduledWorker(controller, env, {
      handleDlqMonitor,
      handleRetentionCleanup,
    });

    expect(handleRetentionCleanup).toHaveBeenCalledOnce();
    expect(handleRetentionCleanup).toHaveBeenCalledWith(controller, env);
    expect(handleDlqMonitor).not.toHaveBeenCalled();
  });

  it("ignora cron desconhecido", async () => {
    const handleDlqMonitor = vi.fn(async () => undefined);
    const handleRetentionCleanup = vi.fn(async () => undefined);

    await handleScheduledWorker(createScheduledController("0 0 * * *"), createWorkerEnv(), {
      handleDlqMonitor,
      handleRetentionCleanup,
    });

    expect(handleDlqMonitor).not.toHaveBeenCalled();
    expect(handleRetentionCleanup).not.toHaveBeenCalled();
  });
});
