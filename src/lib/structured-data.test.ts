import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { homeStructuredData, serializeStructuredData } from "./structured-data";

describe("homeStructuredData", () => {
  it("descreve a empresa somente com os dados oficiais publicados", () => {
    expect(homeStructuredData["@graph"][0]).toMatchObject({
      "@type": "Organization",
      name: siteConfig.name,
      legalName: siteConfig.legalName,
      url: siteConfig.url,
      taxID: siteConfig.cnpj,
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phone,
      address: {
        addressLocality: "São Paulo",
        addressRegion: "SP",
        addressCountry: "BR",
      },
    });
  });

  it("associa o site à organização oficial", () => {
    expect(homeStructuredData["@graph"][1]).toMatchObject({
      "@type": "WebSite",
      url: siteConfig.url,
      name: siteConfig.name,
      publisher: {
        "@id": `${siteConfig.url}/#organization`,
      },
    });
  });
});

describe("serializeStructuredData", () => {
  it("neutraliza o caractere que poderia encerrar a tag script", () => {
    const serialized = serializeStructuredData({ value: "</script>" });

    expect(serialized).toContain("\\u003c/script>");
    expect(serialized).not.toContain("<");
  });
});
