import type { QuoteRequestPolicy } from "./service";

export const quotePrivacyPolicyVersion = "1.1";
export const quoteRetentionYears = 5;

function addUtcCalendarYears(date: Date, years: number) {
  const result = new Date(date);
  const originalMonth = result.getUTCMonth();

  result.setUTCFullYear(result.getUTCFullYear() + years);

  if (result.getUTCMonth() !== originalMonth) {
    result.setUTCDate(0);
  }

  return result;
}

export function createQuoteRequestPolicy(receivedAt: Date): QuoteRequestPolicy {
  const normalizedReceivedAt = new Date(receivedAt);

  if (!Number.isFinite(normalizedReceivedAt.getTime())) {
    throw new Error("Invalid quote receipt date.");
  }

  return {
    privacyPolicyVersion: quotePrivacyPolicyVersion,
    retentionExpiresAt: addUtcCalendarYears(normalizedReceivedAt, quoteRetentionYears),
  };
}
