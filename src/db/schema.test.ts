import { getTableColumns } from "drizzle-orm";
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
});
