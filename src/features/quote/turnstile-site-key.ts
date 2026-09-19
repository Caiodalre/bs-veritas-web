const productionHostname = "bsveritas.com.br";
const previewHostname = "quote-preview-bs-veritas-web-preview.caio-dalre.workers.dev";
const localHostnames = new Set(["localhost", "127.0.0.1", "[::1]"]);

function normalizeHostname(hostname: string) {
  return hostname.trim().toLowerCase().replace(/\.$/, "");
}

export const turnstileSiteKeys = {
  local: "1x00000000000000000000AA",
  preview: "0x4AAAAAAE8ahZ39UpXeN_qt",
  production: "0x4AAAAAAE8eE4rdt9NsY1gL",
} as const;

export function resolveTurnstileSiteKey(hostname: string) {
  const normalizedHostname = normalizeHostname(hostname);

  if (localHostnames.has(normalizedHostname)) {
    return turnstileSiteKeys.local;
  }

  if (
    normalizedHostname === productionHostname ||
    normalizedHostname === `www.${productionHostname}`
  ) {
    return turnstileSiteKeys.production;
  }

  if (normalizedHostname === previewHostname) {
    return turnstileSiteKeys.preview;
  }

  return undefined;
}

export function isQuoteSubmissionEnabled(hostname: string) {
  const normalizedHostname = normalizeHostname(hostname);

  return (
    localHostnames.has(normalizedHostname) ||
    normalizedHostname === productionHostname ||
    normalizedHostname === `www.${productionHostname}`
  );
}
