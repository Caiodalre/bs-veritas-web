import postgres from "postgres";
import type { QuoteAdminItem, QuoteAdminStatus } from "../src/features/quote-admin/model";

type QuoteAdminCursor = {
  createdAt: Date;
  id: string;
};

export type QuoteAdminListInput = {
  status?: QuoteAdminStatus;
  cursor?: QuoteAdminCursor;
  limit: number;
};

export type QuoteAdminRepository = {
  list(input: QuoteAdminListInput): Promise<readonly QuoteAdminItem[]>;
  updateStatus(
    id: string,
    status: QuoteAdminStatus,
  ): Promise<{ id: string; status: QuoteAdminStatus } | undefined>;
};

type QuoteAdminDatabaseRow = {
  id: string;
  created_at: Date | string;
  full_name: string;
  phone: string;
  email: string;
  insurance_type: string;
  city: string | null;
  message: string | null;
  retention_expires_at: Date | string;
  status: QuoteAdminStatus;
};

function toIsoString(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Quote request returned an invalid timestamp.");
  }

  return date.toISOString();
}

function mapQuoteRequest(row: QuoteAdminDatabaseRow): QuoteAdminItem {
  return {
    id: row.id,
    createdAt: toIsoString(row.created_at),
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    insuranceType: row.insurance_type,
    ...(row.city ? { city: row.city } : {}),
    ...(row.message ? { message: row.message } : {}),
    retentionExpiresAt: toIsoString(row.retention_expires_at),
    status: row.status,
  };
}

export function createPostgresQuoteAdminRepository(connectionString: string): QuoteAdminRepository {
  const client = postgres(connectionString, {
    max: 1,
    fetch_types: false,
    prepare: true,
  });

  return {
    async list(input) {
      const rows = await client<QuoteAdminDatabaseRow[]>`
        select *
        from public.list_quote_requests(
          ${input.status ?? null}::public.quote_request_status,
          ${input.cursor?.createdAt ?? null}::timestamp with time zone,
          ${input.cursor?.id ?? null}::uuid,
          ${input.limit}::integer
        )
      `;

      return rows.map(mapQuoteRequest);
    },

    async updateStatus(id, status) {
      const rows = await client<Array<{ id: string; status: QuoteAdminStatus }>>`
        select *
        from public.set_quote_request_status(
          ${id}::uuid,
          ${status}::public.quote_request_status
        )
      `;

      return rows[0];
    },
  };
}
