import { parseLimitedJsonRequest, type JsonRequestFailureReason } from "./json-request";
import {
  verifyQuoteSubmission,
  type QuoteSubmissionVerificationConfig,
  type QuoteSubmissionVerificationResult,
} from "./submission-verification";
import type { TurnstileVerificationDependencies } from "./turnstile-verification";
import type { QuoteRequestInput } from "./validation";

export interface QuoteRequestVerificationConfig extends QuoteSubmissionVerificationConfig {
  maxBodyBytes: number;
}

type QuoteSubmissionFailure = Exclude<QuoteSubmissionVerificationResult, { valid: true }>;

export type QuoteRequestVerificationResult =
  | { valid: true; quoteRequest: QuoteRequestInput }
  | { valid: false; stage: "request"; reason: JsonRequestFailureReason }
  | QuoteSubmissionFailure;

export async function verifyQuoteRequest(
  request: Request,
  config: QuoteRequestVerificationConfig,
  dependencies: TurnstileVerificationDependencies = {},
): Promise<QuoteRequestVerificationResult> {
  const body = await parseLimitedJsonRequest(request, config.maxBodyBytes);

  if (!body.success) {
    return { valid: false, stage: "request", reason: body.reason };
  }

  return verifyQuoteSubmission(body.data, config, dependencies);
}
