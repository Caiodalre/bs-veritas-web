const quoteEndpoint = "/api/quote";

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

export interface WorkerEnv {
  ASSETS: AssetsBinding;
}

const apiSecurityHeaders = {
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
  "permissions-policy": "camera=(), geolocation=(), microphone=()",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
} as const;

function jsonResponse(body: unknown, status: number, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      ...apiSecurityHeaders,
      ...headers,
    },
  });
}

export const worker = {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname !== quoteEndpoint) {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { error: { code: "method_not_allowed", message: "Método não permitido." } },
        405,
        { allow: "POST" },
      );
    }

    return jsonResponse(
      {
        error: {
          code: "quote_unavailable",
          message: "A solicitação de cotação ainda não está disponível.",
        },
      },
      503,
      { "retry-after": "86400" },
    );
  },
};

export default worker;
