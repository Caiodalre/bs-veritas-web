import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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
    index("quote_requests_created_at_idx").on(table.createdAt),
    index("quote_requests_status_idx").on(table.status),
    index("quote_requests_retention_expires_at_idx").on(table.retentionExpiresAt),
  ],
);
