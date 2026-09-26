/** @vitest-environment node */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "drizzle", "0004_quote_request_admin.sql"),
  "utf8",
);

describe("quote request admin migration", () => {
  it("usa paginação por cursor apoiada por índices compostos", () => {
    expect(migration).toContain("quote_requests_created_at_id_idx");
    expect(migration).toContain("quote_requests_status_created_at_id_idx");
    expect(migration).toContain(
      "(quote_request.created_at, quote_request.id) < (cursor_created_at, cursor_id)",
    );
    expect(migration).toContain("ORDER BY quote_request.created_at DESC, quote_request.id DESC");
    expect(migration).toMatch(/result_limit > 51/i);
  });

  it("expõe somente funções restritas ao papel da aplicação", () => {
    expect(migration).toMatch(/SECURITY DEFINER/gi);
    expect(migration).toContain("SET search_path = pg_catalog");
    expect(migration).toContain("SET statement_timeout = '5s'");
    expect(migration).toContain("SET lock_timeout = '1s'");
    expect(migration).toMatch(/REVOKE ALL ON FUNCTION public\.list_quote_requests/i);
    expect(migration).toMatch(/REVOKE ALL ON FUNCTION public\.set_quote_request_status/i);
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.list_quote_requests/i);
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.set_quote_request_status/i);
    expect(migration).not.toMatch(/GRANT\s+(ALL|SELECT|UPDATE|DELETE|TRUNCATE)\s+ON\s+TABLE/i);
  });
});
