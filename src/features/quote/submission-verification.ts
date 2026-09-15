import { parseQuoteSubmission, type QuoteRequestInput } from "./validation";
import {
  verifyTurnstileToken,
  type TurnstileVerificationDependencies,
  type TurnstileVerificationResult,
} from "./turnstile-verification";

const quoteTurnstileAction = "quote";

export interface QuoteSubmissionVerificationConfig {
  secretKey: string;
  expectedHostname: string;
  timeoutMs?: number;
}

type TurnstileFailureReason = Extract<TurnstileVerificationResult, { valid: false }>["reason"];

export type QuoteSubmissionVerificationResult =
  | { valid: true; quoteRequest: QuoteRequestInput }
  | { valid: false; stage: "submission"; reason: "invalid-submission" }
  | { valid: false; stage: "turnstile"; reason: TurnstileFailureReason };

export async function verifyQuoteSubmission(
  input: unknown,
  config: QuoteSubmissionVerificationConfig,
  dependencies: TurnstileVerificationDependencies = {},
): Promise<QuoteSubmissionVerificationResult> {
  const submission = parseQuoteSubmission(input);

  if (!submission.success) {
    return { valid: false, stage: "submission", reason: "invalid-submission" };
  }

  const turnstile = await verifyTurnstileToken(
    {
      token: submission.data.turnstileToken,
      secretKey: config.secretKey,
      expectedHostname: config.expectedHostname,
      expectedAction: quoteTurnstileAction,
      timeoutMs: config.timeoutMs,
    },
    dependencies,
  );

  if (!turnstile.valid) {
    return { valid: false, stage: "turnstile", reason: turnstile.reason };
  }

  return { valid: true, quoteRequest: submission.data.quoteRequest };
}
