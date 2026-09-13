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

  it.each(insuranceCatalog)("mantém orientação prática e fonte pública para $name", (insurance) => {
    expect(insurance.practicalQuestions).toHaveLength(3);
    expect(insurance.faqs).toHaveLength(3);
    expect(insurance.referenceUrl).toMatch(/^https:\/\/www\.gov\.br\/susep\//);
    expect(insurance.whatsappMessage).toContain("Olá!");
  });

  it("não retorna modalidade para slug desconhecido", () => {
    expect(getInsuranceBySlug("modalidade-inexistente")).toBeUndefined();
  });
});
