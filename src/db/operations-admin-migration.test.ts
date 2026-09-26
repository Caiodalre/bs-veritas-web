/** @vitest-environment node */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(join(process.cwd(), "drizzle", "0005_operations_admin.sql"), "utf8");

describe("operations admin migration", () => {
  it("modela funcionários, seguros e auditoria com valores exatos", () => {
    expect(migration).toContain('CREATE TABLE "staff_members"');
    expect(migration).toContain('CREATE TABLE "insurance_sales"');
    expect(migration).toContain('CREATE TABLE "insurance_sale_audit_events"');
    expect(migration).toMatch(/numeric\(14, 2\)/u);
    expect(migration).toContain("insurance_sales_employee_payout_amount_check");
    expect(migration).toContain("insurance_sales_payout_paid_at_check");
    expect(migration).toContain("insurance_sales_staff_member_id_staff_members_id_fk");
    expect(migration).toContain("insurance_sale_audit_events_sale_id_insurance_sales_id_fk");
  });

  it("usa paginação por cursor e índices nas chaves de consulta", () => {
    expect(migration).toContain("insurance_sales_staff_sold_at_id_idx");
    expect(migration).toContain("insurance_sales_payout_sold_at_id_idx");
    expect(migration).toContain("insurance_sales_sold_at_id_idx");
    expect(migration).toContain("insurance_sale_audit_sale_occurred_idx");
    expect(migration).toContain("(sale.sold_at, sale.id) < (cursor_sold_at, cursor_id)");
    expect(migration).toContain("ORDER BY sale.sold_at DESC, sale.id DESC");
  });

  it("restringe o acesso a funções com autorização e trilha de auditoria", () => {
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION public\.is_operations_admin/u);
    expect(migration).toMatch(/SECURITY DEFINER/gu);
    expect(migration).toContain("SET search_path = pg_catalog");
    expect(migration).toContain("SET statement_timeout = '5s'");
    expect(migration).toContain("SET lock_timeout = '1s'");
    expect(migration).toContain("pg_catalog.to_jsonb(previous_sale)");
    expect(migration).toContain("pg_catalog.to_jsonb(updated_sale)");
    expect(migration).toMatch(/REVOKE ALL ON TABLE public\.staff_members/iu);
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.create_insurance_sale/iu);
    expect(migration).not.toMatch(/GRANT\s+(ALL|SELECT|INSERT|UPDATE|DELETE)\s+ON\s+TABLE/iu);
  });

  it("impede que o último administrador remova o próprio acesso", () => {
    expect(migration).toContain("an administrator cannot remove their own access");
    expect(migration).toContain("at least one active administrator is required");
  });
});
