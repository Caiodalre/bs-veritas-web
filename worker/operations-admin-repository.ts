import postgres from "postgres";
import type {
  CreateStaffMemberInput,
  InsuranceSale,
  InsuranceSaleInput,
  OperationsActor,
  OperationsIdentity,
  OperationsSummary,
  StaffMember,
  StaffRole,
  UpdateStaffMemberInput,
} from "../src/features/operations-admin/model";

export type SalesCursor = {
  soldAt: string;
  id: string;
};

export type OperationsSessionResult = {
  actor?: OperationsActor;
  bootstrapAvailable: boolean;
};

export type OperationsAdminRepository = {
  getSession(identity: OperationsIdentity): Promise<OperationsSessionResult>;
  bootstrapMaster(identity: OperationsIdentity, name: string): Promise<StaffMember | undefined>;
  listStaff(identity: OperationsIdentity): Promise<readonly StaffMember[]>;
  createStaff(identity: OperationsIdentity, input: CreateStaffMemberInput): Promise<StaffMember>;
  updateStaff(
    identity: OperationsIdentity,
    id: string,
    input: UpdateStaffMemberInput,
  ): Promise<StaffMember | undefined>;
  listSales(input: {
    identity: OperationsIdentity;
    cursor?: SalesCursor;
    limit: number;
  }): Promise<readonly InsuranceSale[]>;
  createSale(identity: OperationsIdentity, input: InsuranceSaleInput): Promise<InsuranceSale>;
  updateSale(
    identity: OperationsIdentity,
    id: string,
    input: InsuranceSaleInput,
  ): Promise<InsuranceSale | undefined>;
  getSummary(identity: OperationsIdentity): Promise<OperationsSummary>;
};

type StaffRow = {
  id: string;
  created_at: Date | string;
  updated_at: Date | string;
  name: string;
  email: string;
  access_subject: string | null;
  role: StaffRole;
  is_master: boolean;
  active: boolean;
};

type SessionRow = {
  staff_member_id: string | null;
  staff_name: string | null;
  staff_role: StaffRole | null;
  staff_is_master: boolean | null;
  bootstrap_available: boolean;
};

type SaleRow = {
  id: string;
  created_at: Date | string;
  updated_at: Date | string;
  sold_at: Date | string;
  staff_member_id: string;
  staff_member_name: string;
  customer_name: string;
  insurer: string;
  insurance_type: string;
  policy_number: string | null;
  premium_amount: string;
  brokerage_commission_amount: string;
  employee_payout_amount: string;
  payout_status: "pending" | "paid";
  payout_paid_at: Date | string | null;
  notes: string | null;
};

type SummaryRow = {
  sale_count: number | string;
  premium_amount: string;
  brokerage_commission_amount: string;
  employee_payout_amount: string;
  pending_payout_amount: string;
};

function toIsoString(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Database returned an invalid timestamp.");
  return date.toISOString();
}

function toDateString(value: Date | string) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/u.test(value)) return value;
  return toIsoString(value).slice(0, 10);
}

function mapStaff(row: StaffRow): StaffMember {
  return {
    id: row.id,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    name: row.name,
    email: row.email,
    role: row.role,
    isMaster: row.is_master,
    accessBound: Boolean(row.access_subject),
    active: row.active,
  };
}

function mapSale(row: SaleRow): InsuranceSale {
  return {
    id: row.id,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    soldAt: toDateString(row.sold_at),
    staffMemberId: row.staff_member_id,
    staffMemberName: row.staff_member_name,
    customerName: row.customer_name,
    insurer: row.insurer,
    insuranceType: row.insurance_type,
    ...(row.policy_number ? { policyNumber: row.policy_number } : {}),
    premiumAmount: row.premium_amount,
    brokerageCommissionAmount: row.brokerage_commission_amount,
    employeePayoutAmount: row.employee_payout_amount,
    payoutStatus: row.payout_status,
    ...(row.payout_paid_at ? { payoutPaidAt: toIsoString(row.payout_paid_at) } : {}),
    ...(row.notes ? { notes: row.notes } : {}),
  };
}

export function createPostgresOperationsAdminRepository(
  connectionString: string,
): OperationsAdminRepository {
  const client = postgres(connectionString, {
    max: 1,
    fetch_types: false,
    prepare: true,
  });

  return {
    async getSession(identity) {
      const rows = await client<SessionRow[]>`
        select * from public.get_operations_session(
          ${identity.email}::text,
          ${identity.subject}::text
        )
      `;
      const row = rows[0];
      if (!row) return { bootstrapAvailable: false };

      return {
        bootstrapAvailable: row.bootstrap_available,
        ...(row.staff_member_id && row.staff_name && row.staff_role
          ? {
              actor: {
                email: identity.email,
                staffMemberId: row.staff_member_id,
                name: row.staff_name,
                role: row.staff_role,
                isMaster: Boolean(row.staff_is_master),
              },
            }
          : {}),
      };
    },

    async bootstrapMaster(identity, name) {
      const rows = await client<StaffRow[]>`
        select * from public.bootstrap_operations_master(
          ${identity.email}::text,
          ${identity.subject}::text,
          ${name}::text
        )
      `;
      return rows[0] ? mapStaff(rows[0]) : undefined;
    },

    async listStaff(identity) {
      const rows = await client<StaffRow[]>`
        select * from public.list_staff_members(
          ${identity.email}::text,
          ${identity.subject}::text
        )
      `;
      return rows.map(mapStaff);
    },

    async createStaff(identity, input) {
      const rows = await client<StaffRow[]>`
        select * from public.create_staff_member(
          ${identity.email}::text,
          ${identity.subject}::text,
          ${input.name}::text,
          ${input.email}::text,
          ${input.role}::public.staff_role,
          ${input.isMaster}::boolean
        )
      `;
      const row = rows[0];
      if (!row) throw new Error("Staff member was not created.");
      return mapStaff(row);
    },

    async updateStaff(identity, id, input) {
      const rows = await client<StaffRow[]>`
        select * from public.update_staff_member(
          ${identity.email}::text,
          ${identity.subject}::text,
          ${id}::uuid,
          ${input.name}::text,
          ${input.email}::text,
          ${input.role}::public.staff_role,
          ${input.isMaster}::boolean,
          ${input.active}::boolean
        )
      `;
      return rows[0] ? mapStaff(rows[0]) : undefined;
    },

    async listSales(input) {
      const rows = await client<SaleRow[]>`
        select * from public.list_insurance_sales(
          ${input.identity.email}::text,
          ${input.identity.subject}::text,
          ${input.cursor?.soldAt ?? null}::date,
          ${input.cursor?.id ?? null}::uuid,
          ${input.limit}::integer
        )
      `;
      return rows.map(mapSale);
    },

    async createSale(identity, input) {
      const rows = await client<SaleRow[]>`
        select * from public.create_insurance_sale(
          ${identity.email}::text,
          ${identity.subject}::text,
          ${input.soldAt}::date,
          ${input.staffMemberId}::uuid,
          ${input.customerName}::text,
          ${input.insurer}::text,
          ${input.insuranceType}::text,
          ${input.policyNumber ?? null}::text,
          ${input.premiumAmount}::numeric,
          ${input.brokerageCommissionAmount}::numeric,
          ${input.employeePayoutAmount}::numeric,
          ${input.payoutStatus}::public.payout_status,
          ${input.notes ?? null}::text
        )
      `;
      const row = rows[0];
      if (!row) throw new Error("Insurance sale was not created.");
      return mapSale(row);
    },

    async updateSale(identity, id, input) {
      const rows = await client<SaleRow[]>`
        select * from public.update_insurance_sale(
          ${identity.email}::text,
          ${identity.subject}::text,
          ${id}::uuid,
          ${input.soldAt}::date,
          ${input.staffMemberId}::uuid,
          ${input.customerName}::text,
          ${input.insurer}::text,
          ${input.insuranceType}::text,
          ${input.policyNumber ?? null}::text,
          ${input.premiumAmount}::numeric,
          ${input.brokerageCommissionAmount}::numeric,
          ${input.employeePayoutAmount}::numeric,
          ${input.payoutStatus}::public.payout_status,
          ${input.notes ?? null}::text
        )
      `;
      return rows[0] ? mapSale(rows[0]) : undefined;
    },

    async getSummary(identity) {
      const rows = await client<SummaryRow[]>`
        select * from public.get_operations_summary(
          ${identity.email}::text,
          ${identity.subject}::text
        )
      `;
      const row = rows[0];
      if (!row) throw new Error("Operations summary was not returned.");

      return {
        saleCount: Number(row.sale_count),
        premiumAmount: row.premium_amount,
        brokerageCommissionAmount: row.brokerage_commission_amount,
        employeePayoutAmount: row.employee_payout_amount,
        pendingPayoutAmount: row.pending_payout_amount,
      };
    },
  };
}
