import { createRemoteJWKSet, jwtVerify } from "jose";

export type CampaignAccessEnvironment = {
  CAMPAIGN_ACCESS_AUD?: string;
  CAMPAIGN_ACCESS_TEAM_DOMAIN?: string;
};

const remoteKeySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function normalizeTeamDomain(value: string) {
  const url = new URL(value.includes("://") ? value : `https://${value}`);

  if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("campaign_access_configuration_invalid");
  }

  return url.origin;
}

export async function verifyCampaignAccess(
  request: Request,
  env: CampaignAccessEnvironment,
): Promise<boolean> {
  const token = request.headers.get("cf-access-jwt-assertion")?.trim();
  const audience = env.CAMPAIGN_ACCESS_AUD?.trim();
  const configuredTeamDomain = env.CAMPAIGN_ACCESS_TEAM_DOMAIN?.trim();

  if (!token || !audience || !configuredTeamDomain) {
    return false;
  }

  try {
    const issuer = normalizeTeamDomain(configuredTeamDomain);
    const certsUrl = `${issuer}/cdn-cgi/access/certs`;
    let keySet = remoteKeySets.get(certsUrl);

    if (!keySet) {
      keySet = createRemoteJWKSet(new URL(certsUrl));
      remoteKeySets.set(certsUrl, keySet);
    }

    await jwtVerify(token, keySet, {
      audience,
      issuer,
    });
    return true;
  } catch {
    return false;
  }
}
