import { describe, expect, it } from "vitest";
import { parseQuoteRequest, parseQuoteSubmission } from "./validation";

const validInput = {
  fullName: "  Pessoa   Exemplo  ",
  phone: "(11) 99999-0000",
  email: "PESSOA@EXAMPLE.INVALID",
  insuranceType: "auto",
  city: "  Cidade   Exemplo  ",
  message: "  Mensagem inteiramente fictícia.  ",
  website: "",
};

describe("parseQuoteRequest", () => {
  it("valida e normaliza os campos permitidos", () => {
    const result = parseQuoteRequest(validInput);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toEqual({
      fullName: "Pessoa Exemplo",
      phone: "11999990000",
      email: "pessoa@example.invalid",
      insuranceType: "auto",
      city: "Cidade Exemplo",
      message: "Mensagem inteiramente fictícia.",
    });
  });

  it("converte campos opcionais vazios em ausência de valor", () => {
    const result = parseQuoteRequest({ ...validInput, city: " ", message: "" });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.city).toBeUndefined();
    expect(result.data.message).toBeUndefined();
  });

  it("rejeita modalidade inexistente", () => {
    const result = parseQuoteRequest({ ...validInput, insuranceType: "inexistente" });

    expect(result.success).toBe(false);
  });

  it("rejeita o honeypot preenchido", () => {
    const result = parseQuoteRequest({ ...validInput, website: "bot" });

    expect(result.success).toBe(false);
  });

  it("rejeita campos que não pertencem ao formulário", () => {
    const result = parseQuoteRequest({ ...validInput, cpf: "não coletar" });

    expect(result.success).toBe(false);
  });

  it("rejeita contato e mensagem fora dos limites", () => {
    expect(parseQuoteRequest({ ...validInput, phone: "123" }).success).toBe(false);
    expect(parseQuoteRequest({ ...validInput, email: "email-inválido" }).success).toBe(false);
    expect(parseQuoteRequest({ ...validInput, message: "x".repeat(1001) }).success).toBe(false);
  });
});

describe("parseQuoteSubmission", () => {
  it("separa o token antiabuso dos dados comerciais normalizados", () => {
    const result = parseQuoteSubmission({ ...validInput, turnstileToken: "  test-token  " });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toEqual({
      quoteRequest: {
        fullName: "Pessoa Exemplo",
        phone: "11999990000",
        email: "pessoa@example.invalid",
        insuranceType: "auto",
        city: "Cidade Exemplo",
        message: "Mensagem inteiramente fictícia.",
      },
      turnstileToken: "test-token",
    });
    expect(result.data.quoteRequest).not.toHaveProperty("website");
    expect(result.data.quoteRequest).not.toHaveProperty("turnstileToken");
  });

  it.each([undefined, "", " ", "x".repeat(2049)])(
    "rejeita token antiabuso ausente, vazio ou acima do limite",
    (turnstileToken) => {
      expect(parseQuoteSubmission({ ...validInput, turnstileToken }).success).toBe(false);
    },
  );

  it("rejeita campos adicionais na submissão", () => {
    const result = parseQuoteSubmission({
      ...validInput,
      turnstileToken: "test-token",
      unexpected: "não aceitar",
    });

    expect(result.success).toBe(false);
  });
});
