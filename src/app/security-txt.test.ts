import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const securityTxtPath = resolve(process.cwd(), "public/.well-known/security.txt");

describe("security.txt", () => {
  it("publica os campos obrigatórios e a localização canônica", async () => {
    const content = await readFile(securityTxtPath, "utf8");

    expect(content).toContain("Contact: mailto:contato@bsveritas.com.br");
    expect(content).toContain("Canonical: https://bsveritas.com.br/.well-known/security.txt");
    expect(content).toContain("Preferred-Languages: pt-BR");
  });

  it("mantém uma validade futura inferior a um ano", async () => {
    const content = await readFile(securityTxtPath, "utf8");
    const expiresLine = content.split(/\r?\n/).find((line) => line.startsWith("Expires: "));
    const expiresAt = Date.parse(expiresLine?.slice("Expires: ".length) ?? "");
    const remaining = expiresAt - Date.now();

    expect(expiresLine).toBeDefined();
    expect(Number.isNaN(expiresAt)).toBe(false);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThan(366 * 24 * 60 * 60 * 1000);
  });
});
