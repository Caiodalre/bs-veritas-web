import { jsonApiResponse } from "./api-response";
import { handleQuoteRequest, type QuoteEndpointDependencies } from "./quote-endpoint";

const quoteEndpoint = "/api/quote";
const rscPagePayloadSuffix = ".__PAGE__.txt";
const rscPagePayloadMarker = "/__next.";
const rateLimitRetryAfterSeconds = "10";
const configurationRetryAfterSeconds = "60";

type EnabledQuoteEnvironment = Env & {
  HYPERDRIVE: Hyperdrive;
  QUOTE_RATE_LIMITER: RateLimit;
  TURNSTILE_SECRET_KEY: string;
};

function hasEnabledQuoteBindings(env: Env): env is EnabledQuoteEnvironment {
  return Boolean(env.HYPERDRIVE && env.QUOTE_RATE_LIMITER && env.TURNSTILE_SECRET_KEY);
}

function getRateLimitKey(request: Request) {
  return request.headers.get("cf-connecting-ip")?.trim() || "unknown-origin";
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

export async function handleWorkerRequest(
  request: Request,
  env: Env,
  quoteDependencies?: QuoteEndpointDependencies,
  executionContext?: Pick<ExecutionContext, "waitUntil">,
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

  if (env.QUOTE_SUBMISSION_ENABLED !== "true") {
    return jsonApiResponse(
      {
        error: {
          code: "quote_submission_disabled",
          message: "Solicitações de cotação não estão disponíveis neste ambiente.",
        },
      },
      503,
    );
  }

  if (!hasEnabledQuoteBindings(env)) {
    return jsonApiResponse(
      {
        error: {
          code: "quote_unavailable",
          message: "Não foi possível registrar a solicitação agora. Tente novamente.",
        },
      },
      503,
      { "retry-after": configurationRetryAfterSeconds },
    );
  }

  let rateLimitOutcome: RateLimitOutcome;

  try {
    rateLimitOutcome = await env.QUOTE_RATE_LIMITER.limit({
      key: getRateLimitKey(request),
    });
  } catch {
    return jsonApiResponse(
      {
        error: {
          code: "rate_limit_unavailable",
          message: "O serviço está temporariamente indisponível. Tente novamente.",
        },
      },
      503,
      { "retry-after": rateLimitRetryAfterSeconds },
    );
  }

  if (!rateLimitOutcome.success) {
    return jsonApiResponse(
      {
        error: {
          code: "rate_limit_exceeded",
          message: "Muitas solicitações em sequência. Aguarde e tente novamente.",
        },
      },
      429,
      { "retry-after": rateLimitRetryAfterSeconds },
    );
  }

  const dependencies = executionContext
    ? {
        ...quoteDependencies,
        schedule:
          quoteDependencies?.schedule ??
          ((promise: Promise<unknown>) => executionContext.waitUntil(promise)),
      }
    : quoteDependencies;

  return handleQuoteRequest(request, env, dependencies);
}

export const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handleWorkerRequest(request, env, undefined, ctx);
  },
} satisfies ExportedHandler<Env>;

export default worker;
