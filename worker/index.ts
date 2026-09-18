import { jsonApiResponse } from "./api-response";
import { handleQuoteRequest, type QuoteEndpointDependencies } from "./quote-endpoint";

const quoteEndpoint = "/api/quote";
const rscPagePayloadSuffix = ".__PAGE__.txt";
const rscPagePayloadMarker = "/__next.";

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

export async function handleWorkerRequest(
  request: Request,
  env: Env,
  quoteDependencies?: QuoteEndpointDependencies,
): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (pathname !== quoteEndpoint) {
    return env.ASSETS.fetch(createRscAssetRequest(request));
  }

  if (request.method !== "POST") {
    return jsonApiResponse(
      { error: { code: "method_not_allowed", message: "Método não permitido." } },
      405,
      { allow: "POST" },
    );
  }

  return handleQuoteRequest(request, env, quoteDependencies);
}

export const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleWorkerRequest(request, env);
  },
} satisfies ExportedHandler<Env>;

export default worker;
