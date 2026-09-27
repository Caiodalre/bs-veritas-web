import { z } from "zod";
import { parseLimitedJsonRequest } from "../src/features/quote/json-request";
import {
  payoutStatuses,
  staffRoles,
  type InsuranceSale,
} from "../src/features/operations-admin/model";
import { jsonApiResponse } from "./api-response";
import {
  getCampaignAccessIdentity,
  type CampaignAccessEnvironment,
  type CampaignAccessIdentity,
} from "./campaign-access";
import {
  createPostgresOperationsAdminRepository,
  type OperationsAdminRepository,
  type SalesCursor,
} from "./operations-admin-repository";

const basePath = "/api/admin/campaigns/operations";
const pageSize = 20;
const maximumBodyBytes = 16_384;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const moneyPattern = /^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/u;
const datePattern = /^\d{4}-\d{2}-\d{2}$/u;

const staffSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    email: z.string().trim().toLowerCase().max(254).email(),
    role: z.enum(staffRoles),
  })
  .strict();

const updateStaffSchema = staffSchema.extend({ active: z.boolean() }).strict();
const bootstrapSchema = z.object({ name: z.string().trim().min(2).max(150) }).strict();

const saleSchema = z
  .object({
    soldAt: z.string().regex(datePattern),
    staffMemberId: z.string().regex(uuidPattern),
    customerName: z.string().trim().min(2).max(150),
    insurer: z.string().trim().min(2).max(120),
    insuranceType: z.string().trim().min(2).max(64),
    policyNumber: z.string().trim().min(1).max(80).optional(),
    premiumAmount: z.string().regex(moneyPattern),
    brokerageCommissionAmount: z.string().regex(moneyPattern),
    employeePayoutAmount: z.string().regex(moneyPattern),
    payoutStatus: z.enum(payoutStatuses),
    notes: z.string().trim().min(1).max(2_000).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const premium = toCents(value.premiumAmount);
    const commission = toCents(value.brokerageCommissionAmount);
    const payout = toCents(value.employeePayoutAmount);

    if (commission > premium) {
      context.addIssue({
        code: "custom",
        path: ["brokerageCommissionAmount"],
        message: "A comissão não pode superar o prêmio.",
      });
    }
    if (payout > commission) {
      context.addIssue({
        code: "custom",
        path: ["employeePayoutAmount"],
        message: "O repasse não pode superar a comissão.",
      });
    }
  });

type OperationsAdminEnvironment = CampaignAccessEnvironment & {
  HYPERDRIVE?: Pick<Hyperdrive, "connectionString">;
  OPERATIONS_ADMIN_ENABLED?: string;
};

export type OperationsAdminEndpointDependencies = {
  authorize?: (
    request: Request,
    env: CampaignAccessEnvironment,
  ) => Promise<CampaignAccessIdentity | undefined>;
  createRepository?: (connectionString: string) => OperationsAdminRepository;
  logger?: Pick<Console, "error">;
};

function apiError(code: string, message: string, status: number, headers?: HeadersInit) {
  return jsonApiResponse({ error: { code, message } }, status, headers);
}

function toCents(value: string) {
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

function encodeCursor(item: Pick<InsuranceSale, "soldAt" | "id">) {
  return btoa(`${item.soldAt}|${item.id}`)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function decodeCursor(value: string): SalesCursor | undefined {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) return undefined;

  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const separatorIndex = decoded.lastIndexOf("|");
    const soldAt = decoded.slice(0, separatorIndex);
    const id = decoded.slice(separatorIndex + 1);
    if (separatorIndex < 1 || !datePattern.test(soldAt) || !uuidPattern.test(id)) return undefined;
    return { soldAt, id };
  } catch {
    return undefined;
  }
}

async function parseBody(request: Request) {
  const parsed = await parseLimitedJsonRequest(request, maximumBodyBytes);
  if (!parsed.success) {
    if (parsed.reason === "unsupported-media-type") {
      return {
        response: apiError("unsupported_media_type", "Envie os dados em formato JSON.", 415),
      };
    }
    if (parsed.reason === "payload-too-large") {
      return {
        response: apiError("payload_too_large", "Os dados excedem o tamanho permitido.", 413),
      };
    }
    return { response: apiError("invalid_json", "Conteúdo inválido.", 400) };
  }
  return { data: parsed.data };
}

async function handleSession(
  request: Request,
  identity: CampaignAccessIdentity,
  repository: OperationsAdminRepository,
) {
  if (request.method !== "GET") {
    return apiError("method_not_allowed", "Método não permitido.", 405, { allow: "GET" });
  }
  const session = await repository.getSession(identity.email);
  return jsonApiResponse(
    session.actor
      ? { authenticated: true, authorized: true, actor: session.actor }
      : {
          authenticated: true,
          authorized: false,
          bootstrapAvailable: session.bootstrapAvailable,
        },
    200,
    { "cache-control": "private, no-store" },
  );
}

async function handleBootstrap(
  request: Request,
  identity: CampaignAccessIdentity,
  repository: OperationsAdminRepository,
) {
  if (request.method !== "POST") {
    return apiError("method_not_allowed", "Método não permitido.", 405, { allow: "POST" });
  }
  const parsedBody = await parseBody(request);
  if (parsedBody.response) return parsedBody.response;
  const input = bootstrapSchema.safeParse(parsedBody.data);
  if (!input.success) return apiError("invalid_staff_member", "Nome inválido.", 422);

  const item = await repository.bootstrapAdmin(identity.email, input.data.name);
  if (!item) {
    return apiError("bootstrap_unavailable", "O administrador inicial já foi definido.", 409);
  }
  return jsonApiResponse({ item }, 201, { "cache-control": "private, no-store" });
}

async function requireAdministrator(
  identity: CampaignAccessIdentity,
  repository: OperationsAdminRepository,
) {
  const session = await repository.getSession(identity.email);
  return session.actor?.role === "administrator" ? session.actor : undefined;
}

async function handleStaffCollection(
  request: Request,
  actorEmail: string,
  repository: OperationsAdminRepository,
) {
  if (request.method === "GET") {
    const items = await repository.listStaff(actorEmail);
    return jsonApiResponse({ items }, 200, { "cache-control": "private, no-store" });
  }
  if (request.method !== "POST") {
    return apiError("method_not_allowed", "Método não permitido.", 405, {
      allow: "GET, POST",
    });
  }

  const parsedBody = await parseBody(request);
  if (parsedBody.response) return parsedBody.response;
  const input = staffSchema.safeParse(parsedBody.data);
  if (!input.success)
    return apiError("invalid_staff_member", "Dados do funcionário inválidos.", 422);
  const item = await repository.createStaff(actorEmail, input.data);
  return jsonApiResponse({ item }, 201, { "cache-control": "private, no-store" });
}

async function handleStaffItem(
  request: Request,
  actorEmail: string,
  id: string,
  repository: OperationsAdminRepository,
) {
  if (request.method !== "PATCH") {
    return apiError("method_not_allowed", "Método não permitido.", 405, { allow: "PATCH" });
  }
  const parsedBody = await parseBody(request);
  if (parsedBody.response) return parsedBody.response;
  const input = updateStaffSchema.safeParse(parsedBody.data);
  if (!input.success)
    return apiError("invalid_staff_member", "Dados do funcionário inválidos.", 422);
  const item = await repository.updateStaff(actorEmail, id, input.data);
  if (!item) return apiError("staff_member_not_found", "Funcionário não encontrado.", 404);
  return jsonApiResponse({ item }, 200, { "cache-control": "private, no-store" });
}

async function handleSalesCollection(
  request: Request,
  actorEmail: string,
  repository: OperationsAdminRepository,
) {
  if (request.method === "GET") {
    const cursorValue = new URL(request.url).searchParams.get("cursor");
    const cursor = cursorValue ? decodeCursor(cursorValue) : undefined;
    if (cursorValue && !cursor) return apiError("invalid_cursor", "Paginação inválida.", 400);
    const rows = await repository.listSales({
      actorEmail,
      ...(cursor ? { cursor } : {}),
      limit: pageSize + 1,
    });
    const items = rows.slice(0, pageSize);
    const nextCursor =
      rows.length > pageSize && items.length > 0 ? encodeCursor(items.at(-1)!) : null;
    return jsonApiResponse({ items, nextCursor }, 200, {
      "cache-control": "private, no-store",
    });
  }
  if (request.method !== "POST") {
    return apiError("method_not_allowed", "Método não permitido.", 405, {
      allow: "GET, POST",
    });
  }

  const parsedBody = await parseBody(request);
  if (parsedBody.response) return parsedBody.response;
  const input = saleSchema.safeParse(parsedBody.data);
  if (!input.success) return apiError("invalid_sale", "Dados do seguro inválidos.", 422);
  const item = await repository.createSale(actorEmail, input.data);
  return jsonApiResponse({ item }, 201, { "cache-control": "private, no-store" });
}

async function handleSaleItem(
  request: Request,
  actorEmail: string,
  id: string,
  repository: OperationsAdminRepository,
) {
  if (request.method !== "PATCH") {
    return apiError("method_not_allowed", "Método não permitido.", 405, { allow: "PATCH" });
  }
  const parsedBody = await parseBody(request);
  if (parsedBody.response) return parsedBody.response;
  const input = saleSchema.safeParse(parsedBody.data);
  if (!input.success) return apiError("invalid_sale", "Dados do seguro inválidos.", 422);
  const item = await repository.updateSale(actorEmail, id, input.data);
  if (!item) return apiError("sale_not_found", "Seguro fechado não encontrado.", 404);
  return jsonApiResponse({ item }, 200, { "cache-control": "private, no-store" });
}

function getDatabaseErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

export async function handleOperationsAdminRequest(
  request: Request,
  env: OperationsAdminEnvironment,
  dependencies: OperationsAdminEndpointDependencies = {},
): Promise<Response> {
  const logger = dependencies.logger ?? console;
  if (String(env.OPERATIONS_ADMIN_ENABLED) !== "true" || !env.HYPERDRIVE) {
    return apiError("operations_admin_unavailable", "Painel de controle indisponível.", 503);
  }

  const authorize = dependencies.authorize ?? getCampaignAccessIdentity;
  const identity = await authorize(request, env);
  if (!identity) return apiError("unauthorized", "Acesso não autorizado.", 401);

  const pathname = new URL(request.url).pathname;
  const createRepository = dependencies.createRepository ?? createPostgresOperationsAdminRepository;
  const repository = createRepository(env.HYPERDRIVE.connectionString);

  try {
    if (pathname === `${basePath}/session`) {
      return await handleSession(request, identity, repository);
    }
    if (pathname === `${basePath}/bootstrap`) {
      return await handleBootstrap(request, identity, repository);
    }

    const actor = await requireAdministrator(identity, repository);
    if (!actor) return apiError("forbidden", "Seu usuário não possui acesso administrativo.", 403);

    if (pathname === `${basePath}/staff`) {
      return await handleStaffCollection(request, actor.email, repository);
    }
    const staffMatch = pathname.match(new RegExp(`^${basePath}/staff/([0-9a-f-]+)$`, "iu"));
    if (staffMatch && uuidPattern.test(staffMatch[1])) {
      return await handleStaffItem(request, actor.email, staffMatch[1], repository);
    }
    if (pathname === `${basePath}/sales`) {
      return await handleSalesCollection(request, actor.email, repository);
    }
    const saleMatch = pathname.match(new RegExp(`^${basePath}/sales/([0-9a-f-]+)$`, "iu"));
    if (saleMatch && uuidPattern.test(saleMatch[1])) {
      return await handleSaleItem(request, actor.email, saleMatch[1], repository);
    }
    if (pathname === `${basePath}/summary`) {
      if (request.method !== "GET") {
        return apiError("method_not_allowed", "Método não permitido.", 405, { allow: "GET" });
      }
      const summary = await repository.getSummary(actor.email);
      return jsonApiResponse({ summary }, 200, { "cache-control": "private, no-store" });
    }

    return apiError("not_found", "Recurso não encontrado.", 404);
  } catch (error) {
    const databaseCode = getDatabaseErrorCode(error);
    logger.error(
      JSON.stringify({
        event: "operations_admin_request_failed",
        errorType: error instanceof Error ? error.name : "UnknownError",
        ...(databaseCode ? { databaseCode } : {}),
      }),
    );

    if (databaseCode === "42501")
      return apiError("forbidden", "Acesso administrativo negado.", 403);
    if (databaseCode === "23505")
      return apiError("duplicate_staff_email", "Este e-mail já está cadastrado.", 409);
    if (databaseCode === "23503" || databaseCode === "23514" || databaseCode === "22023") {
      return apiError("invalid_operation", "Os dados informados não puderam ser registrados.", 422);
    }
    return apiError(
      "operations_admin_unavailable",
      "Não foi possível concluir a operação agora.",
      503,
    );
  }
}
