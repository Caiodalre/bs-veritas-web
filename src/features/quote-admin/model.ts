export const quoteAdminStatuses = ["new", "contacted", "closed"] as const;

export type QuoteAdminStatus = (typeof quoteAdminStatuses)[number];

export const quoteAdminStatusLabels = {
  new: "Novo",
  contacted: "Em atendimento",
  closed: "Encerrado",
} satisfies Record<QuoteAdminStatus, string>;

export type QuoteAdminItem = {
  id: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email: string;
  insuranceType: string;
  city?: string;
  message?: string;
  retentionExpiresAt: string;
  status: QuoteAdminStatus;
};
