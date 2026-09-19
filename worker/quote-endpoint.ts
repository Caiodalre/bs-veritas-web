import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import {
  createDrizzleQuoteRequestRepository,
  type QuoteDatabase,
} from "@/db/quote-request-repository";
import {
  processQuoteRequest,
  type QuoteRequestProcessingResult,
} from "@/features/quote/processing";
import type { QuoteRequestRepository } from "@/features/quote/service";
import { jsonApiResponse } from "./api-response";
import { sendQuoteNotification } from "./quote-notification";

const maximumRequestBodyBytes = 16_384;
const turnstileTimeoutMs = 3_000;
const retryAfterSeconds = "60";

export type QuoteEndpointEnvironment = {
  HYPERDRIVE: Pick<Hyperdrive, "connectionString">;
  QUOTE_EXPECTED_HOSTNAME: string;
  QUOTE_NOTIFICATION_EMAIL?: SendEmail;
  QUOTE_NOTIFICATION_ENABLED: string;
  TURNSTILE_SECRET_KEY: string;
};

export interface QuoteEndpointDependencies {
  createRepository?: (connectionString: string) => QuoteRequestRepository;
  fetcher?: typeof fetch;
  logger?: Pick<Console, "error">;
  now?: () => Date;
  schedule?: (promise: Promise<unknown>) => void;
}

function createHyperdriveRepository(connectionString: string) {
  const client = postgres(connectionString, {
    max: 5,
    fetch_types: false,
    prepare: true,
  });
  const database: QuoteDatabase = drizzle(client, { schema });

  return createDrizzleQuoteRequestRepository(database);
}

function createLazyRepository(
  connectionString: string,
  createRepository: (connectionString: string) => QuoteRequestRepository,
): QuoteRequestRepository {
  let repository: QuoteRequestRepository | undefined;

  return {
    async create(request) {
      repository ??= createRepository(connectionString);
      return repository.create(request);
    },
  };
}

function failureResponse(result: Exclude<QuoteRequestProcessingResult, { accepted: true }>) {
  if (result.stage === "request") {
    if (result.reason === "unsupported-media-type") {
      return jsonApiResponse(
        {
          error: {
            code: "unsupported_media_type",
            message: "Envie a solicitação em formato JSON.",
          },
        },
        415,
      );
    }

    if (result.reason === "payload-too-large") {
      return jsonApiResponse(
        {
          error: {
            code: "payload_too_large",
            message: "A solicitação excede o tamanho permitido.",
          },
        },
        413,
      );
    }

    return jsonApiResponse(
      {
        error: {
          code: "invalid_request",
          message: "Não foi possível ler a solicitação.",
        },
      },
      400,
    );
  }

  if (result.stage === "submission") {
    return jsonApiResponse(
      {
        error: {
          code: "invalid_submission",
          message: "Revise os dados informados e tente novamente.",
        },
      },
      422,
    );
  }

  if (result.reason === "unavailable") {
    return jsonApiResponse(
      {
        error: {
          code: "verification_unavailable",
          message: "A verificação está temporariamente indisponível. Tente novamente.",
        },
      },
      503,
      { "retry-after": retryAfterSeconds },
    );
  }

  return jsonApiResponse(
    {
      error: {
        code: "verification_failed",
        message: "Não foi possível validar a solicitação. Tente novamente.",
      },
    },
    400,
  );
}

export async function handleQuoteRequest(
  request: Request,
  env: QuoteEndpointEnvironment,
  dependencies: QuoteEndpointDependencies = {},
) {
  const createRepository = dependencies.createRepository ?? createHyperdriveRepository;
  const repository = createLazyRepository(env.HYPERDRIVE.connectionString, createRepository);
  const logger = dependencies.logger ?? console;

  try {
    const result = await processQuoteRequest(
      request,
      {
        maxBodyBytes: maximumRequestBodyBytes,
        secretKey: env.TURNSTILE_SECRET_KEY,
        expectedHostname: env.QUOTE_EXPECTED_HOSTNAME,
        timeoutMs: turnstileTimeoutMs,
      },
      {
        repository,
        fetcher: dependencies.fetcher,
        now: dependencies.now,
      },
    );

    if (!result.accepted) {
      return failureResponse(result);
    }

    if (env.QUOTE_NOTIFICATION_ENABLED === "true" && env.QUOTE_NOTIFICATION_EMAIL) {
      const notificationPromise = sendQuoteNotification(
        env.QUOTE_NOTIFICATION_EMAIL,
        result.id,
      ).catch((error) => {
        logger.error(
          JSON.stringify({
            event: "quote_notification_failed",
            errorType: error instanceof Error ? error.name : "UnknownError",
          }),
        );
      });

      if (dependencies.schedule) {
        dependencies.schedule(notificationPromise);
      } else {
        await notificationPromise;
      }
    }

    return jsonApiResponse({ data: { id: result.id } }, 201);
  } catch (error) {
    logger.error(
      JSON.stringify({
        event: "quote_request_failed",
        errorType: error instanceof Error ? error.name : "UnknownError",
      }),
    );

    return jsonApiResponse(
      {
        error: {
          code: "quote_unavailable",
          message: "Não foi possível registrar a solicitação agora. Tente novamente.",
        },
      },
      503,
      { "retry-after": retryAfterSeconds },
    );
  }
}
