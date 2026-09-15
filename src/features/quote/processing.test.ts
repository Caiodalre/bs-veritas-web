/** @vitest-environment node */

import { describe, expect, it, vi } from "vitest";
import { processQuoteRequest } from "./processing";
import type { QuoteRequestRepository } from "./service";

const requestUrl = "https://example.invalid/api/quote";
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

const validConfig = {
  maxBodyBytes: 4096,
  secretKey: "test-secret",
  expectedHostname: "example.invalid",
};

function createRequest(body: unknown) {
  return new Request(requestUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createRepository() {
  const create = vi.fn<QuoteRequestRepository["create"]>(async () => ({
    id: "00000000-0000-4000-8000-000000000000",
  }));

  return { repository: { create } satisfies QuoteRequestRepository, create };
}

function createAcceptedFetcher() {
  return vi.fn<typeof fetch>(async () =>
    Response.json({
      success: true,
      hostname: "example.invalid",
      action: "quote",
    }),
  );
}

describe("processQuoteRequest", () => {
  it("registra somente dados validados com a política de cinco anos", async () => {
    const { repository, create } = createRepository();
    const fetcher = createAcceptedFetcher();
    const now = vi.fn(() => receivedAt);

    await expect(
      processQuoteRequest(createRequest(validSubmission), validConfig, {
        repository,
        fetcher,
        now,
      }),
    ).resolves.toEqual({
      accepted: true,
      id: "00000000-0000-4000-8000-000000000000",
    });
    expect(now).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledOnce();
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
  });

  it("não consulta o Turnstile nem o repositório quando os dados são inválidos", async () => {
    const { repository, create } = createRepository();
    const fetcher = createAcceptedFetcher();

    await expect(
      processQuoteRequest(createRequest({ ...validSubmission, website: "bot" }), validConfig, {
        repository,
        fetcher,
        now: () => receivedAt,
      }),
    ).resolves.toEqual({
      accepted: false,
      stage: "submission",
      reason: "invalid-submission",
    });
    expect(fetcher).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("não persiste quando o Turnstile rejeita a solicitação", async () => {
    const { repository, create } = createRepository();
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json({
        success: false,
        hostname: "example.invalid",
        action: "quote",
      }),
    );

    await expect(
      processQuoteRequest(createRequest(validSubmission), validConfig, {
        repository,
        fetcher,
        now: () => receivedAt,
      }),
    ).resolves.toEqual({
      accepted: false,
      stage: "turnstile",
      reason: "rejected",
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("não informa sucesso quando a persistência falha", async () => {
    const repository: QuoteRequestRepository = {
      create: vi.fn(async () => {
        throw new Error("Repository unavailable.");
      }),
    };

    await expect(
      processQuoteRequest(createRequest(validSubmission), validConfig, {
        repository,
        fetcher: createAcceptedFetcher(),
        now: () => receivedAt,
      }),
    ).rejects.toThrow("Repository unavailable.");
  });
});
