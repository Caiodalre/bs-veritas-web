import { describe, expect, it } from "vitest";
import { insuranceCatalog } from "@/features/insurance/catalog";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("lista todas as rotas públicas atuais sem duplicidade", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain("https://bsveritas.com.br/");
    expect(urls).toContain("https://bsveritas.com.br/sobre");
    expect(urls).toContain("https://bsveritas.com.br/seguros");
    expect(urls).toContain("https://bsveritas.com.br/sinistros");
    expect(urls).toContain("https://bsveritas.com.br/contato");
    expect(urls).toContain("https://bsveritas.com.br/politica-de-privacidade");
    expect(urls).toContain("https://bsveritas.com.br/termos-de-uso");

    for (const insurance of insuranceCatalog) {
      expect(urls).toContain("https://bsveritas.com.br/seguros/" + insurance.slug);
    }
  });
});
