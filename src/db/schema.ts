import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const quoteRequestStatus = pgEnum("quote_request_status", ["new", "contacted", "closed"]);
export const staffRole = pgEnum("staff_role", ["administrator", "employee"]);
export const payoutStatus = pgEnum("payout_status", ["pending", "paid"]);
export const saleAuditAction = pgEnum("sale_audit_action", ["created", "updated"]);

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

export const staffMembers = pgTable(
  "staff_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    accessSubject: varchar("access_subject", { length: 255 }),
    role: staffRole("role").default("employee").notNull(),
    isMaster: boolean("is_master").default(false).notNull(),
    active: boolean("active").default(true).notNull(),
  },
  (table) => [
    check(
      "staff_members_name_check",
      sql`char_length(btrim(${table.name})) between 2 and 150 and ${table.name} = btrim(${table.name})`,
    ),
    check(
      "staff_members_email_check",
      sql`${table.email} = lower(btrim(${table.email})) and position('@' in ${table.email}) > 1`,
    ),
    check(
      "staff_members_access_subject_check",
      sql`${table.accessSubject} is null or (char_length(btrim(${table.accessSubject})) between 1 and 255 and ${table.accessSubject} = btrim(${table.accessSubject}))`,
    ),
    check(
      "staff_members_master_role_check",
      sql`not ${table.isMaster} or ${table.role} = 'administrator'`,
    ),
    uniqueIndex("staff_members_email_unique_idx").on(table.email),
    uniqueIndex("staff_members_access_subject_unique_idx")
      .on(table.accessSubject)
      .where(sql`${table.accessSubject} is not null`),
    index("staff_members_active_role_name_idx").on(table.active, table.role, table.name),
  ],
);

export const insuranceSales = pgTable(
  "insurance_sales",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    soldAt: date("sold_at", { mode: "string" }).notNull(),
    staffMemberId: uuid("staff_member_id")
      .notNull()
      .references(() => staffMembers.id, { onDelete: "restrict" }),
    customerName: varchar("customer_name", { length: 150 }).notNull(),
    insurer: varchar("insurer", { length: 120 }).notNull(),
    insuranceType: varchar("insurance_type", { length: 64 }).notNull(),
    policyNumber: varchar("policy_number", { length: 80 }),
    premiumAmount: numeric("premium_amount", { precision: 14, scale: 2 }).notNull(),
    brokerageCommissionAmount: numeric("brokerage_commission_amount", {
      precision: 14,
      scale: 2,
    }).notNull(),
    employeePayoutAmount: numeric("employee_payout_amount", {
      precision: 14,
      scale: 2,
    }).notNull(),
    payoutStatus: payoutStatus("payout_status").default("pending").notNull(),
    payoutPaidAt: timestamp("payout_paid_at", { withTimezone: true }),
    notes: text("notes"),
  },
  (table) => [
    check(
      "insurance_sales_customer_name_check",
      sql`char_length(btrim(${table.customerName})) between 2 and 150 and ${table.customerName} = btrim(${table.customerName})`,
    ),
    check(
      "insurance_sales_insurer_check",
      sql`char_length(btrim(${table.insurer})) between 2 and 120 and ${table.insurer} = btrim(${table.insurer})`,
    ),
    check(
      "insurance_sales_insurance_type_check",
      sql`char_length(btrim(${table.insuranceType})) between 2 and 64 and ${table.insuranceType} = btrim(${table.insuranceType})`,
    ),
    check(
      "insurance_sales_policy_number_check",
      sql`${table.policyNumber} is null or (char_length(btrim(${table.policyNumber})) between 1 and 80 and ${table.policyNumber} = btrim(${table.policyNumber}))`,
    ),
    check("insurance_sales_premium_amount_check", sql`${table.premiumAmount} >= 0`),
    check(
      "insurance_sales_commission_amount_check",
      sql`${table.brokerageCommissionAmount} >= 0 and ${table.brokerageCommissionAmount} <= ${table.premiumAmount}`,
    ),
    check(
      "insurance_sales_employee_payout_amount_check",
      sql`${table.employeePayoutAmount} >= 0 and ${table.employeePayoutAmount} <= ${table.brokerageCommissionAmount}`,
    ),
    check(
      "insurance_sales_payout_paid_at_check",
      sql`(${table.payoutStatus} = 'paid' and ${table.payoutPaidAt} is not null) or (${table.payoutStatus} = 'pending' and ${table.payoutPaidAt} is null)`,
    ),
    check(
      "insurance_sales_notes_check",
      sql`${table.notes} is null or (char_length(btrim(${table.notes})) between 1 and 2000 and ${table.notes} = btrim(${table.notes}))`,
    ),
    index("insurance_sales_staff_sold_at_id_idx").on(table.staffMemberId, table.soldAt, table.id),
    index("insurance_sales_payout_sold_at_id_idx").on(table.payoutStatus, table.soldAt, table.id),
    index("insurance_sales_sold_at_id_idx").on(table.soldAt, table.id),
  ],
);

export const insuranceSaleAuditEvents = pgTable(
  "insurance_sale_audit_events",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    saleId: uuid("sale_id")
      .notNull()
      .references(() => insuranceSales.id, { onDelete: "restrict" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    actorEmail: varchar("actor_email", { length: 254 }).notNull(),
    action: saleAuditAction("action").notNull(),
    previousSnapshot: jsonb("previous_snapshot"),
    newSnapshot: jsonb("new_snapshot").notNull(),
  },
  (table) => [
    check(
      "insurance_sale_audit_actor_email_check",
      sql`${table.actorEmail} = lower(btrim(${table.actorEmail})) and position('@' in ${table.actorEmail}) > 1`,
    ),
    index("insurance_sale_audit_sale_occurred_idx").on(table.saleId, table.occurredAt, table.id),
  ],
);
