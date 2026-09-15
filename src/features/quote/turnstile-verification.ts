const siteverifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const maximumTokenLength = 2048;
const defaultTimeoutMs = 3000;
const maximumTimeoutMs = 10_000;

interface SiteverifyResponse {
  success: boolean;
  hostname?: string;
  action?: string;
}

export interface TurnstileVerificationInput {
  token: string;
  secretKey: string;
  expectedHostname: string;
  expectedAction: string;
  timeoutMs?: number;
}

export type TurnstileVerificationResult =
  { valid: true } | { valid: false; reason: "invalid-token" | "rejected" | "unavailable" };

export interface TurnstileVerificationDependencies {
  fetcher?: typeof fetch;
}

function isSiteverifyResponse(value: unknown): value is SiteverifyResponse {
  if (value === null || typeof value !== "object" || !("success" in value)) {
    return false;
  }

  if (typeof value.success !== "boolean") {
    return false;
  }

  if ("hostname" in value && value.hostname !== undefined && typeof value.hostname !== "string") {
    return false;
  }

  return !("action" in value && value.action !== undefined && typeof value.action !== "string");
}

function getTimeoutMs(timeoutMs: number | undefined) {
  if (timeoutMs === undefined) {
    return defaultTimeoutMs;
  }

  return Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= maximumTimeoutMs
    ? timeoutMs
    : defaultTimeoutMs;
}

export async function verifyTurnstileToken(
  input: TurnstileVerificationInput,
  { fetcher = fetch }: TurnstileVerificationDependencies = {},
): Promise<TurnstileVerificationResult> {
  const token = input.token.trim();

  if (!token || token.length > maximumTokenLength) {
    return { valid: false, reason: "invalid-token" };
  }

  if (!input.secretKey || !input.expectedHostname || !input.expectedAction) {
    return { valid: false, reason: "unavailable" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getTimeoutMs(input.timeoutMs));

  try {
    const body = new URLSearchParams({
      secret: input.secretKey,
      response: token,
    });
    const response = await fetcher(siteverifyUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      return { valid: false, reason: "unavailable" };
    }

    const payload: unknown = await response.json();

    if (!isSiteverifyResponse(payload)) {
      return { valid: false, reason: "unavailable" };
    }

    if (
      !payload.success ||
      payload.hostname !== input.expectedHostname ||
      payload.action !== input.expectedAction
    ) {
      return { valid: false, reason: "rejected" };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "unavailable" };
  } finally {
    clearTimeout(timeoutId);
  }
}
