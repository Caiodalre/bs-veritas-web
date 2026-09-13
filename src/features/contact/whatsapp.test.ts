import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { createWhatsAppHref } from "./whatsapp";

describe("createWhatsAppHref", () => {
  it("cria um link oficial com mensagem preenchida sem ação de envio", () => {
    const message = "Olá, quero orientação.";
    const href = createWhatsAppHref(message);

    expect(href).toBe(`${siteConfig.contact.whatsappHref}?text=${encodeURIComponent(message)}`);
    expect(href).not.toContain("send=");
  });
});
