import { sql } from "drizzle-orm";
import { check, index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const quoteRequestStatus = pgEnum("quote_request_status", ["new", "contacted", "closed"]);

export const quoteRequests = pgTable(
  "quote_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    fullName: varchar("full_name", { length: 150 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    insuranceType: varchar("insurance_type", { length: 64 }).notNull(),
    city: varchar("city", { length: 120 }),
    message: text("message"),
    privacyPolicyVersion: varchar("privacy_policy_version", { length: 32 }).notNull(),
    retentionExpiresAt: timestamp("retention_expires_at", { withTimezone: true }).notNull(),
    status: quoteRequestStatus("status").default("new").notNull(),
  },
  (table) => [
    check(
      "quote_requests_full_name_check",
      sql`char_length(btrim(${table.fullName})) between 2 and 150`,
    ),
    check("quote_requests_phone_check", sql`${table.phone} ~ '^[0-9]{10,15}$'`),
    check(
      "quote_requests_email_check",
      sql`${table.email} = lower(btrim(${table.email})) and position('@' in ${table.email}) > 1`,
    ),
    check(
      "quote_requests_insurance_type_check",
      sql`${table.insuranceType} in ('auto', 'residencial', 'empresarial', 'vida', 'viagem', 'outras-solucoes')`,
    ),
    check(
      "quote_requests_city_check",
      sql`${table.city} is null or (char_length(btrim(${table.city})) between 1 and 120 and ${table.city} = btrim(${table.city}))`,
    ),
    check(
      "quote_requests_message_check",
      sql`${table.message} is null or (char_length(btrim(${table.message})) between 1 and 1000 and ${table.message} = btrim(${table.message}))`,
    ),
    check(
      "quote_requests_privacy_policy_version_check",
      sql`char_length(btrim(${table.privacyPolicyVersion})) between 1 and 32 and ${table.privacyPolicyVersion} = btrim(${table.privacyPolicyVersion})`,
    ),
    check(
      "quote_requests_retention_window_check",
      sql`${table.retentionExpiresAt} > ${table.createdAt}`,
    ),
    index("quote_requests_created_at_idx").on(table.createdAt),
    index("quote_requests_created_at_id_idx").on(table.createdAt, table.id),
    index("quote_requests_status_idx").on(table.status),
    index("quote_requests_status_created_at_id_idx").on(table.status, table.createdAt, table.id),
    index("quote_requests_retention_expires_at_idx").on(table.retentionExpiresAt),
  ],
);
