/** @vitest-environment node */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "drizzle", "0003_quote_retention_cleanup.sql"),
  "utf8",
);

describe("quote retention cleanup migration", () => {
  it("limita a exclusão e evita contenção entre execuções", () => {
    expect(migration).toMatch(/batch_limit integer DEFAULT 500/i);
    expect(migration).toMatch(/batch_limit > 500/i);
    expect(migration).toContain("WHERE retention_expires_at <= pg_catalog.clock_timestamp()");
    expect(migration).toContain("ORDER BY retention_expires_at, id");
    expect(migration).toContain("LIMIT batch_limit");
    expect(migration).toContain("FOR UPDATE SKIP LOCKED");
  });

  it("expõe somente a função protegida ao papel da aplicação", () => {
    expect(migration).toContain("SECURITY DEFINER");
    expect(migration).toContain("SET search_path = pg_catalog");
    expect(migration).toContain("SET statement_timeout = '5s'");
    expect(migration).toContain("SET lock_timeout = '1s'");
    expect(migration).toContain(
      "REVOKE ALL ON FUNCTION public.purge_expired_quote_requests(integer) FROM PUBLIC",
    );
    expect(migration).toContain(
      "GRANT EXECUTE ON FUNCTION public.purge_expired_quote_requests(integer) TO bs_veritas_quote_writer",
    );
    expect(migration).not.toMatch(/GRANT\s+DELETE/i);
  });
});
