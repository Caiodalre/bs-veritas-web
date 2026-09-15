import { z } from "zod";
import { insuranceCatalog, type InsuranceSlug } from "@/features/insurance/catalog";
import { turnstileTokenMaximumLength } from "@/features/quote/turnstile-verification";

const insuranceSlugs = new Set<string>(insuranceCatalog.map(({ slug }) => slug));

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ");
}

function optionalText(maxLength: number) {
  return z
    .preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().trim().max(maxLength).optional(),
    )
    .transform((value) => value || undefined);
}

const insuranceTypeSchema = z
  .string()
  .trim()
  .refine((value): value is InsuranceSlug => insuranceSlugs.has(value), {
    message: "Selecione uma modalidade de seguro válida.",
  });

const quoteRequestFieldsSchema = z
  .object({
    fullName: z.string().trim().min(2).max(150).transform(collapseWhitespace),
    phone: z
      .string()
      .trim()
      .max(32)
      .transform((value) => value.replace(/\D/g, ""))
      .pipe(z.string().regex(/^\d{10,15}$/)),
    email: z.string().trim().toLowerCase().max(254).email(),
    insuranceType: insuranceTypeSchema,
    city: optionalText(120).transform((value) => (value ? collapseWhitespace(value) : undefined)),
    message: optionalText(1000),
    website: z.string().max(0).optional().default(""),
  })
  .strict();

function toQuoteRequestInput(value: z.output<typeof quoteRequestFieldsSchema>) {
  return {
    fullName: value.fullName,
    phone: value.phone,
    email: value.email,
    insuranceType: value.insuranceType,
    city: value.city,
    message: value.message,
  };
}

export const quoteRequestInputSchema = quoteRequestFieldsSchema.transform(toQuoteRequestInput);

export const quoteSubmissionInputSchema = quoteRequestFieldsSchema
  .extend({
    turnstileToken: z.string().trim().min(1).max(turnstileTokenMaximumLength),
  })
  .strict()
  .transform((value) => ({
    quoteRequest: toQuoteRequestInput(value),
    turnstileToken: value.turnstileToken,
  }));

export type QuoteRequestInput = z.output<typeof quoteRequestInputSchema>;
export type QuoteSubmissionInput = z.output<typeof quoteSubmissionInputSchema>;

export function parseQuoteRequest(input: unknown) {
  return quoteRequestInputSchema.safeParse(input);
}

export function parseQuoteSubmission(input: unknown) {
  return quoteSubmissionInputSchema.safeParse(input);
}
