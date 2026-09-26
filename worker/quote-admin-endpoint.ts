import { z } from "zod";
import { parseLimitedJsonRequest } from "../src/features/quote/json-request";
import {
  quoteAdminStatuses,
  type QuoteAdminItem,
  type QuoteAdminStatus,
} from "../src/features/quote-admin/model";
import { jsonApiResponse } from "./api-response";
import { verifyCampaignAccess, type CampaignAccessEnvironment } from "./campaign-access";
import {
  createPostgresQuoteAdminRepository,
  type QuoteAdminRepository,
} from "./quote-admin-repository";

const collectionPath = "/api/admin/campaigns/quote-requests";
const pageSize = 20;
const maximumStatusBodyBytes = 1_024;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const statusSchema = z.object({ status: z.enum(quoteAdminStatuses) }).strict();

type QuoteAdminEnvironment = CampaignAccessEnvironment & {
  HYPERDRIVE?: Pick<Hyperdrive, "connectionString">;
  QUOTE_ADMIN_ENABLED?: string;
};

export type QuoteAdminEndpointDependencies = {
  authorize?: (request: Request, env: CampaignAccessEnvironment) => Promise<boolean>;
  createRepository?: (connectionString: string) => QuoteAdminRepository;
  logger?: Pick<Console, "error">;
};

type QuoteAdminCursor = {
  createdAt: Date;
  id: string;
};

function apiError(code: string, message: string, status: number, headers?: HeadersInit) {
  return jsonApiResponse({ error: { code, message } }, status, headers);
}

function encodeCursor(item: Pick<QuoteAdminItem, "createdAt" | "id">) {
  return btoa(`${item.createdAt}|${item.id}`)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function decodeCursor(value: string): QuoteAdminCursor | undefined {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) return undefined;

  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const separatorIndex = decoded.lastIndexOf("|");

    if (separatorIndex < 1) return undefined;

    const createdAt = new Date(decoded.slice(0, separatorIndex));
    const id = decoded.slice(separatorIndex + 1);

    if (Number.isNaN(createdAt.getTime()) || !uuidPattern.test(id)) return undefined;

    return { createdAt, id };
  } catch {
    return undefined;
  }
}

function parseStatus(value: string | null): QuoteAdminStatus | undefined | "invalid" {
  if (value === null || value === "all") return undefined;
  return quoteAdminStatuses.includes(value as QuoteAdminStatus)
    ? (value as QuoteAdminStatus)
    : "invalid";
}

async function handleCollection(request: Request, repository: QuoteAdminRepository) {
  if (request.method !== "GET") {
    return apiError("method_not_allowed", "Método não permitido.", 405, { allow: "GET" });
  }

  const url = new URL(request.url);
  const status = parseStatus(url.searchParams.get("status"));
  if (status === "invalid") {
    return apiError("invalid_status", "Filtro de situação inválido.", 422);
  }

  const cursorValue = url.searchParams.get("cursor");
  const cursor = cursorValue ? decodeCursor(cursorValue) : undefined;
  if (cursorValue && !cursor) {
    return apiError("invalid_cursor", "Paginação inválida.", 400);
  }

  const rows = await repository.list({
    ...(status ? { status } : {}),
    ...(cursor ? { cursor } : {}),
    limit: pageSize + 1,
  });
  const items = rows.slice(0, pageSize);
  const nextCursor =
    rows.length > pageSize && items.length > 0 ? encodeCursor(items.at(-1)!) : null;

  return jsonApiResponse({ items, nextCursor }, 200, { "cache-control": "private, no-store" });
}

async function handleItem(request: Request, id: string, repository: QuoteAdminRepository) {
  if (request.method !== "PATCH") {
    return apiError("method_not_allowed", "Método não permitido.", 405, { allow: "PATCH" });
  }

  const parsedBody = await parseLimitedJsonRequest(request, maximumStatusBodyBytes);
  if (!parsedBody.success) {
    if (parsedBody.reason === "unsupported-media-type") {
      return apiError("unsupported_media_type", "Envie a atualização em formato JSON.", 415);
    }
    if (parsedBody.reason === "payload-too-large") {
      return apiError("payload_too_large", "A atualização excede o tamanho permitido.", 413);
    }
    return apiError("invalid_json", "Conteúdo inválido.", 400);
  }

  const parsedStatus = statusSchema.safeParse(parsedBody.data);
  if (!parsedStatus.success) {
    return apiError("invalid_status", "Situação inválida.", 422);
  }

  const updated = await repository.updateStatus(id, parsedStatus.data.status);
  if (!updated) {
    return apiError("quote_request_not_found", "Solicitação não encontrada.", 404);
  }

  return jsonApiResponse({ item: updated }, 200, { "cache-control": "private, no-store" });
}

export async function handleQuoteAdminRequest(
  request: Request,
  env: QuoteAdminEnvironment,
  dependencies: QuoteAdminEndpointDependencies = {},
): Promise<Response> {
  const logger = dependencies.logger ?? console;

  if (String(env.QUOTE_ADMIN_ENABLED) !== "true" || !env.HYPERDRIVE) {
    return apiError(
      "quote_admin_unavailable",
      "Administração de solicitações indisponível neste ambiente.",
      503,
    );
  }

  const authorize = dependencies.authorize ?? verifyCampaignAccess;
  if (!(await authorize(request, env))) {
    return apiError("unauthorized", "Acesso não autorizado.", 401);
  }

  const pathname = new URL(request.url).pathname;
  const createRepository = dependencies.createRepository ?? createPostgresQuoteAdminRepository;
  const repository = createRepository(env.HYPERDRIVE.connectionString);

  try {
    if (pathname === collectionPath) {
      return await handleCollection(request, repository);
    }

    const itemMatch = pathname.match(/^\/api\/admin\/campaigns\/quote-requests\/([0-9a-f-]+)$/iu);
    if (itemMatch && uuidPattern.test(itemMatch[1])) {
      return await handleItem(request, itemMatch[1], repository);
    }

    return apiError("not_found", "Recurso não encontrado.", 404);
  } catch (error) {
    logger.error(
      JSON.stringify({
        event: "quote_admin_request_failed",
        errorType: error instanceof Error ? error.name : "UnknownError",
      }),
    );
    return apiError(
      "quote_admin_unavailable",
      "Não foi possível consultar as solicitações agora.",
      503,
    );
  }
}
