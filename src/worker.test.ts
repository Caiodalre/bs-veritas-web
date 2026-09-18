/** @vitest-environment node */

import { describe, expect, it, vi } from "vitest";
import { createRscAssetRequest, handleWorkerRequest } from "../worker/index";
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

function createHyperdriveBinding(): Env["HYPERDRIVE"] {
  return {
    connect: vi.fn<Env["HYPERDRIVE"]["connect"]>(() => {
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

function createWorkerEnv(assets = createAssetsBinding()): Env {
  return {
    ASSETS: assets,
    HYPERDRIVE: createHyperdriveBinding(),
    QUOTE_EXPECTED_HOSTNAME: "bsveritas.com.br",
    TURNSTILE_SECRET_KEY: "test-secret",
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
