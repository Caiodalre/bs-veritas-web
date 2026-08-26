import { describe, expect, it } from "vitest";
import { getInsuranceBySlug, insuranceCatalog } from "./catalog";

describe("insuranceCatalog", () => {
  it("mantém slugs únicos", () => {
    const slugs = insuranceCatalog.map((insurance) => insurance.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(insuranceCatalog)("localiza $name pelo slug", (insurance) => {
    expect(getInsuranceBySlug(insurance.slug)).toBe(insurance);
  });

  it("não retorna modalidade para slug desconhecido", () => {
    expect(getInsuranceBySlug("modalidade-inexistente")).toBeUndefined();
  });
});
