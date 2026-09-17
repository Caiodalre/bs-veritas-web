/** @vitest-environment node */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "drizzle", "0002_quote_request_constraints.sql"),
  "utf8",
);

describe("quote request constraints migration", () => {
  it("cria todas as proteções declaradas no schema", () => {
    const constraintNames = Array.from(
      migration.matchAll(/ADD CONSTRAINT "([^"]+_check)"/g),
      ([, name]) => name,
    );

    expect(constraintNames).toEqual([
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

  it("limita telefone, mensagem e janela de retenção no próprio banco", () => {
    expect(migration).toContain("^[0-9]{10,15}$");
    expect(migration).toContain(
      'char_length(btrim("quote_requests"."message")) between 1 and 1000',
    );
    expect(migration).toContain(
      '"quote_requests"."retention_expires_at" > "quote_requests"."created_at"',
    );
  });
});
