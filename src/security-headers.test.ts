/** @vitest-environment node */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const headersFile = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");

describe("security headers", () => {
  it("mantém uma CSP restritiva compatível com a exportação estática", () => {
    expect(headersFile).toContain("Content-Security-Policy: default-src 'self'");
    expect(headersFile).toContain("frame-ancestors 'none'");
    expect(headersFile).toContain("object-src 'none'");
  });

  it("autoriza somente os recursos necessários do Turnstile", () => {
    expect(headersFile).toContain("frame-src https://challenges.cloudflare.com");
    expect(headersFile).toContain(
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
    );
    expect(headersFile).not.toContain("https://*.cloudflare.com");
  });

  it("impede injeção automática sem perder o cache imutável dos assets", () => {
    expect(headersFile).toContain("Cache-Control: no-transform");
    expect(headersFile).toContain("Cache-Control: public, max-age=31536000, immutable");
  });

  it("não amplia HSTS para subdomínios não auditados", () => {
    expect(headersFile).toContain("Strict-Transport-Security: max-age=31536000");
    expect(headersFile).not.toContain("includeSubDomains");
    expect(headersFile).not.toContain("preload");
  });
});
