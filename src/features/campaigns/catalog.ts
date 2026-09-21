import type { PartnerSlug } from "@/features/campaigns/model";

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
