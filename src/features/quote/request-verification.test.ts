/** @vitest-environment node */

import { describe, expect, it, vi } from "vitest";
import { verifyQuoteRequest } from "./request-verification";

const requestUrl = "https://example.invalid/api/quote";

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

function createRequest(body: unknown, contentType = "application/json") {
  return new Request(requestUrl, {
    method: "POST",
    headers: { "content-type": contentType },
    body: JSON.stringify(body),
  });
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

describe("verifyQuoteRequest", () => {
  it("entrega somente os dados comerciais após todas as validações", async () => {
    const fetcher = createAcceptedFetcher();

    await expect(
      verifyQuoteRequest(createRequest(validSubmission), validConfig, { fetcher }),
    ).resolves.toEqual({
      valid: true,
      quoteRequest: {
        fullName: "Pessoa Exemplo",
        phone: "11999990000",
        email: "pessoa@example.invalid",
        insuranceType: "auto",
        city: "Cidade Exemplo",
        message: "Mensagem inteiramente fictícia.",
      },
    });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("rejeita mídia não suportada antes da validação externa", async () => {
    const fetcher = createAcceptedFetcher();

    await expect(
      verifyQuoteRequest(createRequest(validSubmission, "text/plain"), validConfig, { fetcher }),
    ).resolves.toEqual({
      valid: false,
      stage: "request",
      reason: "unsupported-media-type",
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejeita corpo acima do limite antes da validação externa", async () => {
    const fetcher = createAcceptedFetcher();
    const request = createRequest({ ...validSubmission, message: "x".repeat(5000) });

    await expect(verifyQuoteRequest(request, validConfig, { fetcher })).resolves.toEqual({
      valid: false,
      stage: "request",
      reason: "payload-too-large",
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejeita campos inválidos antes da validação externa", async () => {
    const fetcher = createAcceptedFetcher();
    const request = createRequest({ ...validSubmission, website: "bot" });

    await expect(verifyQuoteRequest(request, validConfig, { fetcher })).resolves.toEqual({
      valid: false,
      stage: "submission",
      reason: "invalid-submission",
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("não libera dados quando o Turnstile rejeita a submissão", async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json({
        success: false,
        hostname: "example.invalid",
        action: "quote",
      }),
    );

    await expect(
      verifyQuoteRequest(createRequest(validSubmission), validConfig, { fetcher }),
    ).resolves.toEqual({
      valid: false,
      stage: "turnstile",
      reason: "rejected",
    });
  });
});
