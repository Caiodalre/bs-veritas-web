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

  it("não amplia HSTS para subdomínios não auditados", () => {
    expect(headersFile).toContain("Strict-Transport-Security: max-age=31536000");
    expect(headersFile).not.toContain("includeSubDomains");
    expect(headersFile).not.toContain("preload");
  });
});
