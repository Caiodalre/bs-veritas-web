import { describe, expect, it } from "vitest";
import { createQuoteRequestPolicy, quotePrivacyPolicyVersion, quoteRetentionYears } from "./policy";

describe("createQuoteRequestPolicy", () => {
  it("define cinco anos corridos a partir do recebimento", () => {
    const receivedAt = new Date("2030-01-15T14:30:45.123Z");

    expect(createQuoteRequestPolicy(receivedAt)).toEqual({
      privacyPolicyVersion: "1.1",
      retentionExpiresAt: new Date("2035-01-15T14:30:45.123Z"),
    });
    expect(quoteRetentionYears).toBe(5);
    expect(quotePrivacyPolicyVersion).toBe("1.1");
  });

  it("ajusta 29 de fevereiro para o último dia de fevereiro", () => {
    const receivedAt = new Date("2028-02-29T12:00:00.000Z");

    expect(createQuoteRequestPolicy(receivedAt).retentionExpiresAt).toEqual(
      new Date("2033-02-28T12:00:00.000Z"),
    );
  });

  it("não altera a data de recebimento fornecida", () => {
    const receivedAt = new Date("2030-06-01T00:00:00.000Z");

    createQuoteRequestPolicy(receivedAt);

    expect(receivedAt).toEqual(new Date("2030-06-01T00:00:00.000Z"));
  });

  it("rejeita uma data de recebimento inválida", () => {
    expect(() => createQuoteRequestPolicy(new Date("invalid"))).toThrow(
      "Invalid quote receipt date.",
    );
  });
});
