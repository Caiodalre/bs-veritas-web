/** @vitest-environment node */

import { describe, expect, it } from "vitest";
import { parseLimitedJsonRequest } from "./json-request";

const requestUrl = "https://example.invalid/api/quote";

function createJsonRequest(body: BodyInit | null, headers?: HeadersInit) {
  return new Request(requestUrl, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
    body,
  });
}

describe("parseLimitedJsonRequest", () => {
  it("lê JSON válido dentro do limite configurado", async () => {
    const request = createJsonRequest(JSON.stringify({ insuranceType: "auto" }));

    await expect(parseLimitedJsonRequest(request, 64)).resolves.toEqual({
      success: true,
      data: { insuranceType: "auto" },
    });
  });

  it("rejeita mídia não suportada antes de consumir o corpo", async () => {
    const request = createJsonRequest("{}", { "content-type": "text/plain" });

    await expect(parseLimitedJsonRequest(request, 64)).resolves.toEqual({
      success: false,
      reason: "unsupported-media-type",
    });
    expect(request.bodyUsed).toBe(false);
  });

  it.each(["-1", "1.5", "invalid", "9007199254740992"])(
    "rejeita Content-Length inválido",
    async (contentLength) => {
      const request = createJsonRequest("{}", { "content-length": contentLength });

      await expect(parseLimitedJsonRequest(request, 64)).resolves.toEqual({
        success: false,
        reason: "invalid-content-length",
      });
      expect(request.bodyUsed).toBe(false);
    },
  );

  it("rejeita o tamanho declarado acima do limite sem consumir o corpo", async () => {
    const request = createJsonRequest("{}", { "content-length": "65" });

    await expect(parseLimitedJsonRequest(request, 64)).resolves.toEqual({
      success: false,
      reason: "payload-too-large",
    });
    expect(request.bodyUsed).toBe(false);
  });

  it("aplica o limite real mesmo quando Content-Length está ausente ou incorreto", async () => {
    const request = createJsonRequest(JSON.stringify({ message: "x".repeat(80) }), {
      "content-length": "1",
    });

    await expect(parseLimitedJsonRequest(request, 64)).resolves.toEqual({
      success: false,
      reason: "payload-too-large",
    });
  });

  it.each(["", "{invalid", new Uint8Array([0xff])])(
    "rejeita corpo vazio, JSON inválido ou UTF-8 inválido",
    async (body) => {
      await expect(parseLimitedJsonRequest(createJsonRequest(body), 64)).resolves.toEqual({
        success: false,
        reason: "invalid-json",
      });
    },
  );

  it("trata falha durante a leitura sem liberar dados parciais", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("{"));
        controller.error(new Error("Read failed."));
      },
    });
    const init: RequestInit & { duplex: "half" } = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: stream,
      duplex: "half",
    };

    await expect(parseLimitedJsonRequest(new Request(requestUrl, init), 64)).resolves.toEqual({
      success: false,
      reason: "read-failed",
    });
  });

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejeita configuração de limite inválida",
    async (maxBytes) => {
      await expect(parseLimitedJsonRequest(createJsonRequest("{}"), maxBytes)).rejects.toThrow(
        RangeError,
      );
    },
  );
});
