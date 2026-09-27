import { createRemoteJWKSet, jwtVerify } from "jose";

export type CampaignAccessEnvironment = {
  CAMPAIGN_ACCESS_AUD?: string;
  CAMPAIGN_ACCESS_TEAM_DOMAIN?: string;
};

export type CampaignAccessIdentity = {
  email: string;
  subject: string;
};

const remoteKeySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function normalizeTeamDomain(value: string) {
  const url = new URL(value.includes("://") ? value : `https://${value}`);

  if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("campaign_access_configuration_invalid");
  }

  return url.origin;
}

export async function getCampaignAccessIdentity(
  request: Request,
  env: CampaignAccessEnvironment,
): Promise<CampaignAccessIdentity | undefined> {
  const token = request.headers.get("cf-access-jwt-assertion")?.trim();
  const audience = env.CAMPAIGN_ACCESS_AUD?.trim();
  const configuredTeamDomain = env.CAMPAIGN_ACCESS_TEAM_DOMAIN?.trim();

  if (!token || !audience || !configuredTeamDomain) {
    return undefined;
  }

  try {
    const issuer = normalizeTeamDomain(configuredTeamDomain);
    const certsUrl = `${issuer}/cdn-cgi/access/certs`;
    let keySet = remoteKeySets.get(certsUrl);

    if (!keySet) {
      keySet = createRemoteJWKSet(new URL(certsUrl));
      remoteKeySets.set(certsUrl, keySet);
    }

    const { payload } = await jwtVerify(token, keySet, {
      audience,
      issuer,
    });
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const subject = typeof payload.sub === "string" ? payload.sub.trim() : "";

    if (!email || !subject || !email.includes("@")) {
      return undefined;
    }

    return { email, subject };
  } catch {
    return undefined;
  }
}

export async function verifyCampaignAccess(
  request: Request,
  env: CampaignAccessEnvironment,
): Promise<boolean> {
  return Boolean(await getCampaignAccessIdentity(request, env));
}
