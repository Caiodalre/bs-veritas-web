/** @vitest-environment node */

import { describe, expect, it, vi } from "vitest";
import { handleCampaignRequest } from "../worker/campaign-endpoint";

type StoredObject = {
  bytes: Uint8Array;
  etag: string;
  httpMetadata?: R2HTTPMetadata;
};

function createBucket() {
  const objects = new Map<string, StoredObject>();
  let version = 0;

  const bucket = {
    async get(key: string) {
      const stored = objects.get(key);
      if (!stored) return null;
      const bytes = stored.bytes;
      return {
        key,
        version: stored.etag,
        size: bytes.byteLength,
        etag: stored.etag,
        httpEtag: `"${stored.etag}"`,
        uploaded: new Date("2026-09-20T12:00:00.000Z"),
        checksums: {},
        httpMetadata: stored.httpMetadata,
        customMetadata: {},
        range: undefined,
        storageClass: "Standard",
        body: new Blob([bytes.slice().buffer as ArrayBuffer]).stream(),
        bodyUsed: false,
        arrayBuffer: async () => bytes.buffer,
        bytes: async () => bytes,
        blob: async () => new Blob([bytes.slice().buffer as ArrayBuffer]),
        json: async () => JSON.parse(new TextDecoder().decode(bytes)),
        text: async () => new TextDecoder().decode(bytes),
        writeHttpMetadata() {},
      } as unknown as R2ObjectBody;
    },
    async put(key: string, value: string | Uint8Array, options?: R2PutOptions) {
      const current = objects.get(key);
      const expectedEtag =
        options?.onlyIf && "etagMatches" in options.onlyIf ? options.onlyIf.etagMatches : undefined;
      if (expectedEtag && current?.etag !== expectedEtag) return null;
      if (
        options?.onlyIf &&
        "etagDoesNotMatch" in options.onlyIf &&
        options.onlyIf.etagDoesNotMatch === "*" &&
        current
      ) {
        return null;
      }
      const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
      const etag = `etag-${++version}`;
      objects.set(key, {
        bytes,
        etag,
        httpMetadata: options?.httpMetadata as R2HTTPMetadata | undefined,
      });
      return { key, etag } as R2Object;
    },
    async delete(key: string) {
      objects.delete(key);
    },
  } as unknown as R2Bucket;

  return { bucket, objects };
}

const now = () => new Date("2026-09-20T12:00:00.000Z");
const campaignId = "11111111-1111-4111-8111-111111111111";
const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function createAdminEnv(bucket: R2Bucket) {
  return {
    CAMPAIGN_ADMIN_ENABLED: "true",
    CAMPAIGN_ASSETS: bucket,
  };
}

function createUploadRequest(
  status: "draft" | "published" = "draft",
  partnerSlug = "porto-seguro",
) {
  const formData = new FormData();
  formData.set("partnerSlug", partnerSlug);
  formData.set("title", "Campanha oficial de teste");
  formData.set("summary", "Resumo oficial usado somente no teste automatizado.");
  formData.set("imageAlt", "Peça vertical da campanha oficial");
  formData.set("ctaLabel", "Saiba mais");
  formData.set("href", "/contato");
  formData.set("conditions", "Consulte as condições vigentes.");
  formData.set("status", status);
  formData.set("image", new File([pngHeader], "campanha.png", { type: "image/png" }));
  return new Request("https://bsveritas.com.br/api/admin/campaigns", {
    method: "POST",
    body: formData,
  });
}

describe("campaign endpoint", () => {
  it("retorna lista vazia no ambiente sem R2", async () => {
    const response = await handleCampaignRequest(
      new Request("https://preview.example/api/campaigns"),
      {},
      { now },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ campaigns: [] });
  });

  it("falha de forma fechada quando o admin está desativado", async () => {
    const { bucket } = createBucket();
    const authorize = vi.fn(async () => true);
    const response = await handleCampaignRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns"),
      { CAMPAIGN_ADMIN_ENABLED: "false", CAMPAIGN_ASSETS: bucket },
      { authorize, now },
    );

    expect(response.status).toBe(503);
    expect(authorize).not.toHaveBeenCalled();
  });

  it("nega acesso sem um token validado", async () => {
    const { bucket } = createBucket();
    const response = await handleCampaignRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns"),
      createAdminEnv(bucket),
      { authorize: async () => false, now },
    );

    expect(response.status).toBe(401);
  });

  it("salva rascunho sem expor campanha ou imagem ao público", async () => {
    const { bucket, objects } = createBucket();
    const dependencies = {
      authorize: async () => true,
      now,
      randomUUID: () => campaignId,
    };
    const created = await handleCampaignRequest(
      createUploadRequest("draft"),
      createAdminEnv(bucket),
      dependencies,
    );

    expect(created.status).toBe(201);
    expect(objects.has(`campaigns/assets/${campaignId}.png`)).toBe(true);

    const publicList = await handleCampaignRequest(
      new Request("https://bsveritas.com.br/api/campaigns"),
      createAdminEnv(bucket),
      { now },
    );
    await expect(publicList.json()).resolves.toEqual({ campaigns: [] });

    const publicImage = await handleCampaignRequest(
      new Request(`https://bsveritas.com.br/api/campaign-images/${campaignId}`),
      createAdminEnv(bucket),
      { now },
    );
    expect(publicImage.status).toBe(404);
  });

  it("aceita Bradesco Seguros como parceiro de campanha", async () => {
    const { bucket } = createBucket();
    const created = await handleCampaignRequest(
      createUploadRequest("draft", "bradesco-seguros"),
      createAdminEnv(bucket),
      { authorize: async () => true, now, randomUUID: () => campaignId },
    );

    expect(created.status).toBe(201);
    await expect(created.json()).resolves.toMatchObject({
      campaign: { partnerSlug: "bradesco-seguros" },
    });
  });

  it("publica, entrega a imagem segura e exclui a campanha", async () => {
    const { bucket, objects } = createBucket();
    const env = createAdminEnv(bucket);
    const dependencies = {
      authorize: async () => true,
      now,
      randomUUID: () => campaignId,
    };
    await handleCampaignRequest(createUploadRequest("draft"), env, dependencies);

    const published = await handleCampaignRequest(
      new Request(`https://bsveritas.com.br/api/admin/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      }),
      env,
      dependencies,
    );
    expect(published.status).toBe(200);

    const publicList = await handleCampaignRequest(
      new Request("https://bsveritas.com.br/api/campaigns"),
      env,
      { now },
    );
    const payload = (await publicList.json()) as { campaigns: Array<{ id: string }> };
    expect(payload.campaigns.map(({ id }) => id)).toEqual([campaignId]);

    const image = await handleCampaignRequest(
      new Request(`https://bsveritas.com.br/api/campaign-images/${campaignId}`),
      env,
      { now },
    );
    expect(image.status).toBe(200);
    expect(image.headers.get("content-type")).toBe("image/png");
    expect(image.headers.get("x-content-type-options")).toBe("nosniff");

    const deleted = await handleCampaignRequest(
      new Request(`https://bsveritas.com.br/api/admin/campaigns/${campaignId}`, {
        method: "DELETE",
      }),
      env,
      dependencies,
    );
    expect(deleted.status).toBe(204);
    expect(objects.has(`campaigns/assets/${campaignId}.png`)).toBe(false);
  });

  it("rejeita conteúdo que apenas declara ser imagem", async () => {
    const { bucket } = createBucket();
    const formData = new FormData();
    formData.set("partnerSlug", "porto-seguro");
    formData.set("title", "Campanha inválida");
    formData.set("summary", "Resumo com tamanho suficiente para validação.");
    formData.set("imageAlt", "Descrição da imagem inválida");
    formData.set("ctaLabel", "Saiba mais");
    formData.set("href", "/contato");
    formData.set("status", "draft");
    formData.set("image", new File(["<svg></svg>"], "arquivo.png", { type: "image/png" }));

    const response = await handleCampaignRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns", {
        method: "POST",
        body: formData,
      }),
      createAdminEnv(bucket),
      { authorize: async () => true, now, randomUUID: () => campaignId },
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "invalid_image_type" },
    });
  });
});
