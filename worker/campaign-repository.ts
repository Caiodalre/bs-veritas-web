import { campaignManifestSchema, type StoredCampaign } from "../src/features/campaigns/model";

const manifestKey = "campaigns/index.json";

type CampaignManifest = {
  version: 1;
  campaigns: StoredCampaign[];
};

export type LoadedCampaignManifest = {
  etag?: string;
  manifest: CampaignManifest;
};

export class CampaignManifestConflictError extends Error {
  constructor() {
    super("campaign_manifest_conflict");
    this.name = "CampaignManifestConflictError";
  }
}

export async function readCampaignManifest(bucket: R2Bucket): Promise<LoadedCampaignManifest> {
  const object = await bucket.get(manifestKey);

  if (!object) {
    return { manifest: { version: 1, campaigns: [] } };
  }

  const parsed = campaignManifestSchema.safeParse(await object.json());

  if (!parsed.success) {
    throw new Error("campaign_manifest_invalid");
  }

  return {
    etag: object.etag,
    manifest: parsed.data,
  };
}

export async function writeCampaignManifest(
  bucket: R2Bucket,
  manifest: CampaignManifest,
  etag?: string,
) {
  const validated = campaignManifestSchema.parse(manifest);
  const result = await bucket.put(manifestKey, JSON.stringify(validated), {
    onlyIf: etag ? { etagMatches: etag } : { etagDoesNotMatch: "*" },
    httpMetadata: {
      cacheControl: "no-store",
      contentType: "application/json; charset=utf-8",
    },
  });

  if (!result) {
    throw new CampaignManifestConflictError();
  }
}

export function sortCampaigns(campaigns: readonly StoredCampaign[]) {
  return [...campaigns].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
}

export function isCampaignVisible(campaign: StoredCampaign, now = new Date()) {
  const timestamp = now.getTime();
  return (
    campaign.status === "published" &&
    (!campaign.startsAt || Date.parse(campaign.startsAt) <= timestamp) &&
    (!campaign.endsAt || Date.parse(campaign.endsAt) > timestamp)
  );
}
