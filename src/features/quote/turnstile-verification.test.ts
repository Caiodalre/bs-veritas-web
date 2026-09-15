import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstileToken, type TurnstileVerificationInput } from "./turnstile-verification";

const validInput: TurnstileVerificationInput = {
  token: "test-token",
  secretKey: "test-secret",
  expectedHostname: "example.invalid",
  expectedAction: "quote",
};

afterEach(() => {
  vi.useRealTimers();
});

describe("verifyTurnstileToken", () => {
  it("valida o token no Siteverify sem expor o segredo na URL", async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json({
        success: true,
        hostname: "example.invalid",
        action: "quote",
        "error-codes": [],
      }),
    );

    await expect(verifyTurnstileToken(validInput, { fetcher })).resolves.toEqual({ valid: true });
    expect(fetcher).toHaveBeenCalledOnce();

    const [url, init] = fetcher.mock.calls[0] ?? [];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "content-type": "application/x-www-form-urlencoded" });
    expect(String(url)).not.toContain(validInput.secretKey);

    if (!(init?.body instanceof URLSearchParams)) {
      throw new Error("Expected URLSearchParams body.");
    }

    expect(init.body.get("secret")).toBe(validInput.secretKey);
    expect(init.body.get("response")).toBe(validInput.token);
  });

  it.each(["", " ", "x".repeat(2049)])(
    "rejeita token ausente ou acima do limite",
    async (token) => {
      const fetcher = vi.fn<typeof fetch>();

      await expect(verifyTurnstileToken({ ...validInput, token }, { fetcher })).resolves.toEqual({
        valid: false,
        reason: "invalid-token",
      });
      expect(fetcher).not.toHaveBeenCalled();
    },
  );

  it("falha de modo seguro quando a configuração obrigatória está ausente", async () => {
    const fetcher = vi.fn<typeof fetch>();

    await expect(
      verifyTurnstileToken({ ...validInput, secretKey: "" }, { fetcher }),
    ).resolves.toEqual({ valid: false, reason: "unavailable" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([
    { success: false, hostname: "example.invalid", action: "quote" },
    { success: true, hostname: "other.invalid", action: "quote" },
    { success: true, hostname: "example.invalid", action: "other" },
  ])("rejeita falha, hostname ou action incompatíveis", async (payload) => {
    const fetcher = vi.fn<typeof fetch>(async () => Response.json(payload));

    await expect(verifyTurnstileToken(validInput, { fetcher })).resolves.toEqual({
      valid: false,
      reason: "rejected",
    });
  });

  it.each([
    new Response(null, { status: 503 }),
    Response.json({ hostname: "example.invalid", action: "quote" }),
  ])(
    "não libera a cotação quando o Siteverify responde de forma indisponível",
    async (response) => {
      const fetcher = vi.fn<typeof fetch>(async () => response);

      await expect(verifyTurnstileToken(validInput, { fetcher })).resolves.toEqual({
        valid: false,
        reason: "unavailable",
      });
    },
  );

  it("não libera a cotação quando ocorre falha de rede", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => {
      throw new Error("Network unavailable.");
    });

    await expect(verifyTurnstileToken(validInput, { fetcher })).resolves.toEqual({
      valid: false,
      reason: "unavailable",
    });
  });

  it("interrompe uma validação que excede o tempo limite", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>(
      async (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        }),
    );

    const result = verifyTurnstileToken({ ...validInput, timeoutMs: 50 }, { fetcher });
    await vi.advanceTimersByTimeAsync(50);

    await expect(result).resolves.toEqual({ valid: false, reason: "unavailable" });
  });
});
