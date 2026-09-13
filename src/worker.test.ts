/** @vitest-environment node */

import { describe, expect, it, vi } from "vitest";
import { createRscAssetRequest, worker } from "../worker/index";

function createAssetsBinding() {
  return {
    fetch: vi.fn(async (input: Request) => {
      void input;
      return new Response("asset", { status: 200 });
    }),
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

    const response = await worker.fetch(request, { ASSETS: assets });

    expect(response.status).toBe(200);
    expect(assets.fetch).toHaveBeenCalledWith(request);
  });

  it("mapeia payloads RSC estáticos para a estrutura gerada pelo Next.js", async () => {
    const assets = createAssetsBinding();
    const request = new Request(
      "https://example.test/seguros/auto/__next.seguros.$d$slug.__PAGE__.txt?_rsc=teste",
    );

    await worker.fetch(request, { ASSETS: assets });

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

    const response = await worker.fetch(new Request("https://example.test/api/quote"), {
      ASSETS: assets,
    });

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
    expectApiSecurityHeaders(response);
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it("mantém a coleta desativada para requisições POST", async () => {
    const assets = createAssetsBinding();
    const request = new Request("https://example.test/api/quote", { method: "POST" });

    const response = await worker.fetch(request, { ASSETS: assets });

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("86400");
    expectApiSecurityHeaders(response);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "quote_unavailable",
        message: "A solicitação de cotação ainda não está disponível.",
      },
    });
    expect(assets.fetch).not.toHaveBeenCalled();
  });
});
