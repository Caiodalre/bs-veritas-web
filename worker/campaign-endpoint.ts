import {
  campaignFormSchema,
  type CampaignStatus,
  type StoredCampaign,
} from "../src/features/campaigns/model";
import type { PartnerCampaign } from "../src/features/campaigns/catalog";
import { jsonApiResponse } from "./api-response";
import { verifyCampaignAccess, type CampaignAccessEnvironment } from "./campaign-access";
import {
  CampaignManifestConflictError,
  isCampaignVisible,
  readCampaignManifest,
  sortCampaigns,
  writeCampaignManifest,
} from "./campaign-repository";

const maxImageBytes = 8 * 1024 * 1024;
const maxRequestBytes = maxImageBytes + 512 * 1024;
const publicCacheControl = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";
const imageCacheControl = "public, max-age=31536000, immutable";

type CampaignEnvironment = CampaignAccessEnvironment & {
  CAMPAIGN_ADMIN_ENABLED?: string;
  CAMPAIGN_ASSETS?: R2Bucket;
};

export type CampaignEndpointDependencies = {
  authorize?: (request: Request, env: CampaignAccessEnvironment) => Promise<boolean>;
  now?: () => Date;
  randomUUID?: () => string;
};

function campaignToPublic(campaign: StoredCampaign): PartnerCampaign {
  return {
    id: campaign.id,
    partnerSlug: campaign.partnerSlug,
    title: campaign.title,
    summary: campaign.summary,
    imageSrc: `/api/campaign-images/${campaign.id}`,
    imageAlt: campaign.imageAlt,
    ctaLabel: campaign.ctaLabel,
    href: campaign.href,
    ...(campaign.conditions ? { conditions: campaign.conditions } : {}),
  };
}

function campaignToAdmin(campaign: StoredCampaign) {
  return {
    ...campaign,
    imageSrc: `/api/admin/campaign-images/${campaign.id}`,
  };
}

function detectImageType(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { contentType: "image/jpeg" as const, extension: "jpg" as const };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { contentType: "image/png" as const, extension: "png" as const };
  }

  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.slice(start, start + length));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    return { contentType: "image/webp" as const, extension: "webp" as const };
  }

  return undefined;
}

function getText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

async function parseCampaignUpload(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || "0");

  if (contentLength > maxRequestBytes) {
    return { error: "image_too_large" as const };
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return { error: "invalid_form" as const };
  }

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return { error: "image_required" as const };
  }

  if (image.size > maxImageBytes) {
    return { error: "image_too_large" as const };
  }

  const bytes = new Uint8Array(await image.arrayBuffer());
  const detectedImage = detectImageType(bytes);

  if (!detectedImage) {
    return { error: "invalid_image_type" as const };
  }

  const parsed = campaignFormSchema.safeParse({
    partnerSlug: getText(formData, "partnerSlug"),
    title: getText(formData, "title"),
    summary: getText(formData, "summary"),
    imageAlt: getText(formData, "imageAlt"),
    ctaLabel: getText(formData, "ctaLabel"),
    href: getText(formData, "href"),
    conditions: getText(formData, "conditions"),
    startsAt: getText(formData, "startsAt"),
    endsAt: getText(formData, "endsAt"),
    status: getText(formData, "status"),
  });

  if (!parsed.success) {
    return { error: "invalid_campaign" as const };
  }

  return { bytes, detectedImage, input: parsed.data };
}

function apiError(code: string, message: string, status: number) {
  return jsonApiResponse({ error: { code, message } }, status);
}

async function streamCampaignImage(
  campaignId: string,
  bucket: R2Bucket,
  allowDrafts: boolean,
  now: Date,
) {
  const { manifest } = await readCampaignManifest(bucket);
  const campaign = manifest.campaigns.find(({ id }) => id === campaignId);

  if (!campaign || (!allowDrafts && !isCampaignVisible(campaign, now))) {
    return apiError("campaign_image_not_found", "Imagem não encontrada.", 404);
  }

  const object = await bucket.get(campaign.imageKey);

  if (!object) {
    return apiError("campaign_image_not_found", "Imagem não encontrada.", 404);
  }

  return new Response(object.body, {
    headers: {
      "cache-control": allowDrafts ? "private, no-store" : imageCacheControl,
      "content-length": String(object.size),
      "content-type": campaign.imageContentType,
      etag: object.httpEtag,
      "x-content-type-options": "nosniff",
    },
  });
}

async function handlePublicCampaigns(bucket: R2Bucket | undefined, now: Date) {
  if (!bucket) {
    return jsonApiResponse({ campaigns: [] }, 200, { "cache-control": publicCacheControl });
  }

  const { manifest } = await readCampaignManifest(bucket);
  const campaigns = sortCampaigns(manifest.campaigns)
    .filter((campaign) => isCampaignVisible(campaign, now))
    .map(campaignToPublic);

  return jsonApiResponse({ campaigns }, 200, { "cache-control": publicCacheControl });
}

async function handleAdminCollection(
  request: Request,
  bucket: R2Bucket,
  dependencies: Required<Pick<CampaignEndpointDependencies, "now" | "randomUUID">>,
) {
  if (request.method === "GET") {
    const { manifest } = await readCampaignManifest(bucket);
    return jsonApiResponse(
      { campaigns: sortCampaigns(manifest.campaigns).map(campaignToAdmin) },
      200,
    );
  }

  if (request.method !== "POST") {
    return apiError("method_not_allowed", "Método não permitido.", 405);
  }

  const parsed = await parseCampaignUpload(request);

  if ("error" in parsed && parsed.error) {
    const messages = {
      image_required: "Selecione uma imagem.",
      image_too_large: "A imagem deve ter no máximo 8 MB.",
      invalid_image_type: "Envie uma imagem JPG, PNG ou WebP válida.",
      invalid_campaign: "Revise os campos da campanha.",
      invalid_form: "Não foi possível ler o formulário.",
    } as const;
    const errorCode = parsed.error;
    return apiError(errorCode, messages[errorCode], errorCode === "image_too_large" ? 413 : 422);
  }

  const loaded = await readCampaignManifest(bucket);
  const id = dependencies.randomUUID();
  const timestamp = dependencies.now().toISOString();
  const imageKey = `campaigns/assets/${id}.${parsed.detectedImage.extension}`;
  const sortOrder =
    loaded.manifest.campaigns.reduce(
      (maximum, campaign) => Math.max(maximum, campaign.sortOrder),
      -1,
    ) + 1;
  const campaign: StoredCampaign = {
    ...parsed.input,
    id,
    imageKey,
    imageContentType: parsed.detectedImage.contentType,
    sortOrder,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await bucket.put(imageKey, parsed.bytes, {
    httpMetadata: {
      cacheControl: imageCacheControl,
      contentType: parsed.detectedImage.contentType,
    },
  });

  try {
    await writeCampaignManifest(
      bucket,
      { version: 1, campaigns: [...loaded.manifest.campaigns, campaign] },
      loaded.etag,
    );
  } catch (error) {
    await bucket.delete(imageKey);
    throw error;
  }

  return jsonApiResponse({ campaign: campaignToAdmin(campaign) }, 201);
}

async function handleAdminItem(request: Request, campaignId: string, bucket: R2Bucket, now: Date) {
  const loaded = await readCampaignManifest(bucket);
  const campaignIndex = loaded.manifest.campaigns.findIndex(({ id }) => id === campaignId);

  if (campaignIndex < 0) {
    return apiError("campaign_not_found", "Campanha não encontrada.", 404);
  }

  const campaign = loaded.manifest.campaigns[campaignIndex];

  if (request.method === "PATCH") {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return apiError("invalid_json", "Conteúdo inválido.", 400);
    }

    const status =
      typeof payload === "object" && payload !== null && "status" in payload
        ? (payload as { status?: unknown }).status
        : undefined;

    if (status !== "draft" && status !== "published") {
      return apiError("invalid_status", "Status inválido.", 422);
    }

    const updatedStatus: CampaignStatus = status;
    const updatedCampaign: StoredCampaign = {
      ...campaign,
      status: updatedStatus,
      updatedAt: now.toISOString(),
    };
    const campaigns = [...loaded.manifest.campaigns];
    campaigns[campaignIndex] = updatedCampaign;
    await writeCampaignManifest(bucket, { version: 1, campaigns }, loaded.etag);
    return jsonApiResponse({ campaign: campaignToAdmin(updatedCampaign) }, 200);
  }

  if (request.method === "DELETE") {
    const campaigns = loaded.manifest.campaigns.filter(({ id }) => id !== campaignId);
    await writeCampaignManifest(bucket, { version: 1, campaigns }, loaded.etag);
    await bucket.delete(campaign.imageKey);
    return new Response(null, { status: 204 });
  }

  return apiError("method_not_allowed", "Método não permitido.", 405);
}

export async function handleCampaignRequest(
  request: Request,
  env: CampaignEnvironment,
  dependencies: CampaignEndpointDependencies = {},
): Promise<Response> {
  const url = new URL(request.url);
  const now = (dependencies.now ?? (() => new Date()))();
  const publicImageMatch = url.pathname.match(/^\/api\/campaign-images\/([0-9a-f-]+)$/);

  try {
    if (url.pathname === "/api/campaigns") {
      if (request.method !== "GET") {
        return apiError("method_not_allowed", "Método não permitido.", 405);
      }
      return await handlePublicCampaigns(env.CAMPAIGN_ASSETS, now);
    }

    if (publicImageMatch) {
      if (request.method !== "GET" || !env.CAMPAIGN_ASSETS) {
        return apiError("campaign_image_not_found", "Imagem não encontrada.", 404);
      }
      return await streamCampaignImage(publicImageMatch[1], env.CAMPAIGN_ASSETS, false, now);
    }

    if (!url.pathname.startsWith("/api/admin/campaign")) {
      return apiError("not_found", "Recurso não encontrado.", 404);
    }

    if (String(env.CAMPAIGN_ADMIN_ENABLED) !== "true" || !env.CAMPAIGN_ASSETS) {
      return apiError(
        "campaign_admin_unavailable",
        "Administração indisponível neste ambiente.",
        503,
      );
    }

    const authorize = dependencies.authorize ?? verifyCampaignAccess;
    if (!(await authorize(request, env))) {
      return apiError("unauthorized", "Acesso não autorizado.", 401);
    }

    const adminImageMatch = url.pathname.match(/^\/api\/admin\/campaign-images\/([0-9a-f-]+)$/);
    if (adminImageMatch) {
      if (request.method !== "GET") {
        return apiError("method_not_allowed", "Método não permitido.", 405);
      }
      return await streamCampaignImage(adminImageMatch[1], env.CAMPAIGN_ASSETS, true, now);
    }

    if (url.pathname === "/api/admin/campaigns") {
      return await handleAdminCollection(request, env.CAMPAIGN_ASSETS, {
        now: dependencies.now ?? (() => new Date()),
        randomUUID: dependencies.randomUUID ?? (() => crypto.randomUUID()),
      });
    }

    const adminItemMatch = url.pathname.match(/^\/api\/admin\/campaigns\/([0-9a-f-]+)$/);
    if (adminItemMatch) {
      return await handleAdminItem(request, adminItemMatch[1], env.CAMPAIGN_ASSETS, now);
    }

    return apiError("not_found", "Recurso não encontrado.", 404);
  } catch (error) {
    if (error instanceof CampaignManifestConflictError) {
      return apiError(
        "campaign_conflict",
        "A lista foi atualizada por outra pessoa. Recarregue e tente novamente.",
        409,
      );
    }

    return apiError(
      "campaign_service_unavailable",
      "Não foi possível concluir a operação agora.",
      503,
    );
  }
}
