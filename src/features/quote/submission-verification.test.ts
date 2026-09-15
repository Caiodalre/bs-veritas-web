import { describe, expect, it, vi } from "vitest";
import { verifyQuoteSubmission } from "./submission-verification";

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
  secretKey: "test-secret",
  expectedHostname: "example.invalid",
};

describe("verifyQuoteSubmission", () => {
  it("rejeita a submissão inválida antes de consultar o Siteverify", async () => {
    const fetcher = vi.fn<typeof fetch>();

    await expect(
      verifyQuoteSubmission({ ...validSubmission, website: "bot" }, validConfig, { fetcher }),
    ).resolves.toEqual({
      valid: false,
      stage: "submission",
      reason: "invalid-submission",
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("libera somente os dados comerciais após validar hostname e action", async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json({
        success: true,
        hostname: "example.invalid",
        action: "quote",
      }),
    );

    await expect(verifyQuoteSubmission(validSubmission, validConfig, { fetcher })).resolves.toEqual(
      {
        valid: true,
        quoteRequest: {
          fullName: "Pessoa Exemplo",
          phone: "11999990000",
          email: "pessoa@example.invalid",
          insuranceType: "auto",
          city: "Cidade Exemplo",
          message: "Mensagem inteiramente fictícia.",
        },
      },
    );
    expect(fetcher).toHaveBeenCalledOnce();

    const [, init] = fetcher.mock.calls[0] ?? [];
    if (!(init?.body instanceof URLSearchParams)) {
      throw new Error("Expected URLSearchParams body.");
    }

    expect(init.body.get("response")).toBe(validSubmission.turnstileToken);
    expect(init.body.get("secret")).toBe(validConfig.secretKey);
  });

  it.each([
    {
      payload: { success: false, hostname: "example.invalid", action: "quote" },
      reason: "rejected",
    },
    {
      payload: { success: true, hostname: "other.invalid", action: "quote" },
      reason: "rejected",
    },
  ] as const)(
    "não libera dados quando o Turnstile rejeita a submissão",
    async ({ payload, reason }) => {
      const fetcher = vi.fn<typeof fetch>(async () => Response.json(payload));

      await expect(
        verifyQuoteSubmission(validSubmission, validConfig, { fetcher }),
      ).resolves.toEqual({
        valid: false,
        stage: "turnstile",
        reason,
      });
    },
  );

  it("falha de modo seguro quando o Siteverify está indisponível", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => new Response(null, { status: 503 }));

    await expect(verifyQuoteSubmission(validSubmission, validConfig, { fetcher })).resolves.toEqual(
      {
        valid: false,
        stage: "turnstile",
        reason: "unavailable",
      },
    );
  });
});
