import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import robots from "./robots";

describe("robots", () => {
  it("permite o rastreamento do domínio oficial e referencia o sitemap", () => {
    const metadata = robots();

    expect(metadata.rules).toEqual({
      userAgent: "*",
      allow: "/",
    });
    expect(metadata.sitemap).toBe(new URL("/sitemap.xml", siteConfig.url).toString());
  });
});
