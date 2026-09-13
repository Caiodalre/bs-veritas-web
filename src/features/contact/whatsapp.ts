import { siteConfig } from "@/config/site";

export const whatsappMessages = {
  generalQuote: "Olá! Gostaria de receber orientação para uma cotação de seguro.",
  claimsSupport:
    "Olá! Preciso de orientação inicial sobre um sinistro. Pode me indicar o canal adequado?",
} as const;

export function createWhatsAppHref(message: string) {
  return `${siteConfig.contact.whatsappHref}?text=${encodeURIComponent(message)}`;
}
