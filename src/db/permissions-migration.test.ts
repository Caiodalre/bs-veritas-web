/** @vitest-environment node */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "drizzle", "0001_quote_request_permissions.sql"),
  "utf8",
);

describe("quote request permissions migration", () => {
  it("cria um papel sem login e sem privilégios administrativos", () => {
    expect(migration).toMatch(/CREATE ROLE bs_veritas_quote_writer\s+NOLOGIN/i);
    expect(migration).toContain("NOSUPERUSER");
    expect(migration).toContain("NOCREATEDB");
    expect(migration).toContain("NOCREATEROLE");
    expect(migration).toContain("NOBYPASSRLS");
    expect(migration).not.toMatch(/PASSWORD/i);
  });

  it("remove acesso público e concede somente o necessário ao adaptador", () => {
    expect(migration).toContain("REVOKE ALL ON TABLE public.quote_requests FROM PUBLIC");
    expect(migration).toContain("REVOKE ALL ON TYPE public.quote_request_status FROM PUBLIC");
    expect(migration).toContain("GRANT USAGE ON SCHEMA public TO bs_veritas_quote_writer");
    expect(migration).toContain(
      "GRANT USAGE ON TYPE public.quote_request_status TO bs_veritas_quote_writer",
    );
    expect(migration).toContain(
      "GRANT INSERT ON TABLE public.quote_requests TO bs_veritas_quote_writer",
    );
    expect(migration).toContain(
      "GRANT SELECT (id) ON TABLE public.quote_requests TO bs_veritas_quote_writer",
    );
    expect(migration).not.toMatch(/GRANT\s+(ALL|UPDATE|DELETE|TRUNCATE)/i);
  });
});
