/** @vitest-environment node */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "drizzle", "0006_staff_portal_access.sql"),
  "utf8",
);

describe("staff portal access migration", () => {
  it("vincula uma identidade Access única e mantém master como administrador", () => {
    expect(migration).toContain('ADD COLUMN "access_subject" varchar(255)');
    expect(migration).toContain('ADD COLUMN "is_master" boolean DEFAULT false NOT NULL');
    expect(migration).toContain("staff_members_access_subject_unique_idx");
    expect(migration).toContain("staff_members_master_role_check");
    expect(migration).toContain("pg_advisory_xact_lock");
  });

  it("autoriza por e-mail e subject verificados sem armazenar senha", () => {
    expect(migration).toContain("staff_member.access_subject = btrim(actor_subject)");
    expect(migration).toContain("CREATE FUNCTION public.is_operations_master");
    expect(migration).not.toMatch(/password|senha/iu);
  });

  it("limita o funcionário aos próprios seguros e totais", () => {
    expect(migration).toContain(
      "actor.role = 'administrator'::public.staff_role OR sale.staff_member_id = actor.id",
    );
    expect(migration.match(/sale\.staff_member_id = actor\.id/gu)).toHaveLength(2);
  });

  it("reserva gestão de equipe ao master e preserva ao menos um master ativo", () => {
    expect(
      migration.match(/public\.is_operations_master\(actor_email, actor_subject\)/gu),
    ).toHaveLength(2);
    expect(migration).toContain("a master cannot remove their own access");
    expect(migration).toContain("at least one active master is required");
  });

  it("concede apenas execução das funções públicas à aplicação", () => {
    const grants = migration.match(/GRANT EXECUTE ON FUNCTION/gu) ?? [];
    expect(grants).toHaveLength(9);
    expect(migration).not.toMatch(
      /GRANT\s+(ALL|SELECT|INSERT|UPDATE|DELETE|TRUNCATE)\s+ON\s+TABLE/iu,
    );
    expect(migration).not.toMatch(/GRANT EXECUTE ON FUNCTION public\.is_operations_/iu);
  });
});
