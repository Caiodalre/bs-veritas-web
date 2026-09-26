import { z } from "zod";

export const partnerSlugSchema = z.enum(["porto-seguro", "petlove", "icatu", "bradesco-seguros"]);
export const campaignStatusSchema = z.enum(["draft", "published"]);

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => value || undefined)
    .optional();

export const campaignHrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((value) => {
    if (value.startsWith("/")) {
      return !value.startsWith("//");
    }

    try {
      const url = new URL(value);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Informe um caminho interno ou endereço HTTPS válido.");

export const campaignFormSchema = z
  .object({
    partnerSlug: partnerSlugSchema,
    title: z.string().trim().min(3).max(120),
    summary: z.string().trim().min(10).max(400),
    imageAlt: z.string().trim().min(5).max(180),
    ctaLabel: z.string().trim().min(2).max(40),
    href: campaignHrefSchema,
    conditions: optionalText(500),
    startsAt: optionalText(40),
    endsAt: optionalText(40),
    status: campaignStatusSchema,
  })
  .superRefine((value, context) => {
    const startsAt = value.startsAt ? Date.parse(value.startsAt) : undefined;
    const endsAt = value.endsAt ? Date.parse(value.endsAt) : undefined;

    if (value.startsAt && Number.isNaN(startsAt)) {
      context.addIssue({ code: "custom", path: ["startsAt"], message: "Data inicial inválida." });
    }

    if (value.endsAt && Number.isNaN(endsAt)) {
      context.addIssue({ code: "custom", path: ["endsAt"], message: "Data final inválida." });
    }

    if (startsAt !== undefined && endsAt !== undefined && startsAt >= endsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "A data final deve ser posterior à data inicial.",
      });
    }
  });

export const storedCampaignSchema = campaignFormSchema.safeExtend({
  id: z.string().uuid(),
  imageKey: z.string().regex(/^campaigns\/assets\/[0-9a-f-]+\.(?:jpg|png|webp)$/),
  imageContentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const campaignManifestSchema = z.object({
  version: z.literal(1),
  campaigns: z.array(storedCampaignSchema).max(250),
});

export type CampaignFormInput = z.infer<typeof campaignFormSchema>;
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;
export type PartnerSlug = z.infer<typeof partnerSlugSchema>;
export type StoredCampaign = z.infer<typeof storedCampaignSchema>;
