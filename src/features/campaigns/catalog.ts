import type { partnerCatalog } from "@/features/partners/catalog";

export type PartnerSlug = (typeof partnerCatalog)[number]["slug"];

export type PartnerCampaign = {
  id: string;
  partnerSlug: PartnerSlug;
  title: string;
  summary: string;
  imageSrc: string;
  imageAlt: string;
  ctaLabel: string;
  href: string;
  conditions?: string;
};

// Campanhas só devem ser adicionadas após o recebimento da peça, do texto,
// do destino e das condições oficiais fornecidas pela seguradora.
export const campaignCatalog: readonly PartnerCampaign[] = [];
