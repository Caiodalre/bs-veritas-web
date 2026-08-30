import { describe, expect, it, vi } from "vitest";
import {
  registerQuoteRequest,
  type QuoteRequestRepository,
  type QuoteRequestToPersist,
} from "./service";
import type { QuoteRequestInput } from "./validation";

const input: QuoteRequestInput = {
  fullName: "Pessoa Exemplo",
  phone: "11999990000",
  email: "pessoa@example.invalid",
  insuranceType: "auto",
  city: "Cidade Exemplo",
  message: "Mensagem inteiramente fictícia.",
};

const now = new Date("2030-01-01T00:00:00.000Z");
const retentionExpiresAt = new Date("2030-02-01T00:00:00.000Z");

function createRepository() {
  const create = vi.fn<QuoteRequestRepository["create"]>(async () => ({
    id: "00000000-0000-4000-8000-000000000000",
  }));

  return {
    repository: { create } satisfies QuoteRequestRepository,
    create,
  };
}

describe("registerQuoteRequest", () => {
  it("encaminha dados validados e a política ao repositório", async () => {
    const { repository, create } = createRepository();

    const result = await registerQuoteRequest(
      input,
      {
        privacyPolicyVersion: "  v1  ",
        retentionExpiresAt,
      },
      { repository, now: () => now },
    );

    expect(result).toEqual({ id: "00000000-0000-4000-8000-000000000000" });
    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({
      ...input,
      privacyPolicyVersion: "v1",
      retentionExpiresAt,
    } satisfies QuoteRequestToPersist);
  });

  it("rejeita uma versão de política ausente ou incompatível com o schema", async () => {
    const { repository, create } = createRepository();

    await expect(
      registerQuoteRequest(
        input,
        { privacyPolicyVersion: " ", retentionExpiresAt },
        { repository, now: () => now },
      ),
    ).rejects.toThrow("Invalid privacy policy version.");

    await expect(
      registerQuoteRequest(
        input,
        { privacyPolicyVersion: "x".repeat(33), retentionExpiresAt },
        { repository, now: () => now },
      ),
    ).rejects.toThrow("Invalid privacy policy version.");
    expect(create).not.toHaveBeenCalled();
  });

  it("rejeita retenção inválida ou já expirada", async () => {
    const { repository, create } = createRepository();

    await expect(
      registerQuoteRequest(
        input,
        { privacyPolicyVersion: "v1", retentionExpiresAt: new Date("invalid") },
        { repository, now: () => now },
      ),
    ).rejects.toThrow("Invalid retention expiration.");

    await expect(
      registerQuoteRequest(
        input,
        { privacyPolicyVersion: "v1", retentionExpiresAt: now },
        { repository, now: () => now },
      ),
    ).rejects.toThrow("Invalid retention expiration.");
    expect(create).not.toHaveBeenCalled();
  });

  it("propaga falhas do repositório sem registrar dados", async () => {
    const repository: QuoteRequestRepository = {
      create: vi.fn(async () => {
        throw new Error("Repository unavailable.");
      }),
    };

    await expect(
      registerQuoteRequest(
        input,
        { privacyPolicyVersion: "v1", retentionExpiresAt },
        { repository, now: () => now },
      ),
    ).rejects.toThrow("Repository unavailable.");
  });
});
