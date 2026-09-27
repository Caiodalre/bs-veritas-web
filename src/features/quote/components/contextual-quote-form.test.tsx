import { describe, expect, it } from "vitest";
import { resolveContextualInsuranceType } from "./contextual-quote-form";

describe("resolveContextualInsuranceType", () => {
  it("aceita somente modalidades publicadas no catálogo", () => {
    expect(resolveContextualInsuranceType("auto")).toBe("auto");
    expect(resolveContextualInsuranceType("outras-solucoes")).toBe("outras-solucoes");
  });

  it("ignora valores ausentes ou desconhecidos", () => {
    expect(resolveContextualInsuranceType(null)).toBeUndefined();
    expect(resolveContextualInsuranceType("inexistente")).toBeUndefined();
  });
});
