import { createQuoteRequestPolicy } from "./policy";
import {
  verifyQuoteRequest,
  type QuoteRequestVerificationConfig,
  type QuoteRequestVerificationResult,
} from "./request-verification";
import { registerQuoteRequest, type QuoteRequestRepository } from "./service";
import type { TurnstileVerificationDependencies } from "./turnstile-verification";

export type QuoteRequestProcessingConfig = QuoteRequestVerificationConfig;

export interface QuoteRequestProcessingDependencies extends TurnstileVerificationDependencies {
  repository: QuoteRequestRepository;
  now?: () => Date;
}

type QuoteRequestVerificationFailure = Exclude<QuoteRequestVerificationResult, { valid: true }>;

export type QuoteRequestProcessingResult =
  | { accepted: true; id: string }
  | ({ accepted: false } & Omit<QuoteRequestVerificationFailure, "valid">);

export async function processQuoteRequest(
  request: Request,
  config: QuoteRequestProcessingConfig,
  { repository, fetcher, now = () => new Date() }: QuoteRequestProcessingDependencies,
): Promise<QuoteRequestProcessingResult> {
  const receivedAt = new Date(now());
  const verification = await verifyQuoteRequest(request, config, { fetcher });

  if (!verification.valid) {
    return {
      accepted: false,
      stage: verification.stage,
      reason: verification.reason,
    };
  }

  const registered = await registerQuoteRequest(
    verification.quoteRequest,
    createQuoteRequestPolicy(receivedAt),
    { repository, now: () => receivedAt },
  );

  return { accepted: true, id: registered.id };
}
