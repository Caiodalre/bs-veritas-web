import type { QuoteRequestInput } from "./validation";

export interface QuoteRequestToPersist extends QuoteRequestInput {
  privacyPolicyVersion: string;
  retentionExpiresAt: Date;
}

export interface RegisteredQuoteRequest {
  id: string;
}

export interface QuoteRequestRepository {
  create(request: QuoteRequestToPersist): Promise<RegisteredQuoteRequest>;
}

export interface RegisterQuoteRequestDependencies {
  repository: QuoteRequestRepository;
  now?: () => Date;
}

export interface QuoteRequestPolicy {
  privacyPolicyVersion: string;
  retentionExpiresAt: Date;
}

export async function registerQuoteRequest(
  input: QuoteRequestInput,
  policy: QuoteRequestPolicy,
  { repository, now = () => new Date() }: RegisterQuoteRequestDependencies,
) {
  const privacyPolicyVersion = policy.privacyPolicyVersion.trim();
  const retentionExpiresAt = new Date(policy.retentionExpiresAt);

  if (!privacyPolicyVersion || privacyPolicyVersion.length > 32) {
    throw new Error("Invalid privacy policy version.");
  }

  if (
    !Number.isFinite(retentionExpiresAt.getTime()) ||
    retentionExpiresAt.getTime() <= now().getTime()
  ) {
    throw new Error("Invalid retention expiration.");
  }

  return repository.create({
    ...input,
    privacyPolicyVersion,
    retentionExpiresAt,
  });
}
