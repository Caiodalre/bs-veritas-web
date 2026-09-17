import { getTableColumns } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { quoteRequests, quoteRequestStatus } from "./schema";

describe("quoteRequests schema", () => {
  it("mantém os campos mínimos definidos para a cotação", () => {
    const columns = getTableColumns(quoteRequests);

    expect(Object.keys(columns)).toEqual([
      "id",
      "createdAt",
      "fullName",
      "phone",
      "email",
      "insuranceType",
      "city",
      "message",
      "privacyPolicyVersion",
      "retentionExpiresAt",
      "status",
    ]);
    expect(columns.id.hasDefault).toBe(true);
    expect(columns.privacyPolicyVersion.notNull).toBe(true);
    expect(columns.retentionExpiresAt.notNull).toBe(true);
  });

  it("limita o estado ao fluxo comercial inicial", () => {
    expect(quoteRequestStatus.enumValues).toEqual(["new", "contacted", "closed"]);
  });

  it("protege no banco as invariantes validadas pela aplicação", () => {
    const checkNames = getTableConfig(quoteRequests).checks.map(({ name }) => name);

    expect(checkNames).toEqual([
      "quote_requests_full_name_check",
      "quote_requests_phone_check",
      "quote_requests_email_check",
      "quote_requests_insurance_type_check",
      "quote_requests_city_check",
      "quote_requests_message_check",
      "quote_requests_privacy_policy_version_check",
      "quote_requests_retention_window_check",
    ]);
  });
});
