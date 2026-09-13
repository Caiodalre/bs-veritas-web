const quoteEndpoint = "/api/quote";
const rscPagePayloadSuffix = ".__PAGE__.txt";
const rscPagePayloadMarker = "/__next.";

export interface WorkerEnv {
  ASSETS: {
    fetch(input: Request): Promise<Response>;
  };
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

export function createRscAssetRequest(request: Request) {
  const url = new URL(request.url);
  const markerIndex = url.pathname.lastIndexOf(rscPagePayloadMarker);

  if (markerIndex < 0 || !url.pathname.endsWith(rscPagePayloadSuffix)) {
    return request;
  }

  const routeToken = url.pathname.slice(
    markerIndex + rscPagePayloadMarker.length,
    -rscPagePayloadSuffix.length,
  );
  const routeSegments = routeToken.split(".");

  if (
    routeSegments.length === 0 ||
    routeSegments.some((segment) => !/^[A-Za-z0-9_$-]+$/.test(segment))
  ) {
    return request;
  }

  url.pathname = `${url.pathname.slice(0, markerIndex)}${rscPagePayloadMarker}${routeSegments.join("/")}/__PAGE__.txt`;
  return new Request(url, request);
}

export const worker = {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname !== quoteEndpoint) {
      return env.ASSETS.fetch(createRscAssetRequest(request));
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
} satisfies ExportedHandler<Env>;

export default worker;
