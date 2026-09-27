export const staffRoles = ["administrator", "employee"] as const;
export type StaffRole = (typeof staffRoles)[number];

export const staffRoleLabels = {
  administrator: "Administrador",
  employee: "Funcionário",
} satisfies Record<StaffRole, string>;

export const payoutStatuses = ["pending", "paid"] as const;
export type PayoutStatus = (typeof payoutStatuses)[number];

export const payoutStatusLabels = {
  pending: "Pendente",
  paid: "Pago",
} satisfies Record<PayoutStatus, string>;

export type OperationsActor = {
  email: string;
  staffMemberId: string;
  name: string;
  role: StaffRole;
};

export type OperationsSession =
  | { authenticated: true; authorized: true; actor: OperationsActor }
  | { authenticated: true; authorized: false; bootstrapAvailable: boolean };

export type StaffMember = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
};

export type InsuranceSale = {
  id: string;
  createdAt: string;
  updatedAt: string;
  soldAt: string;
  staffMemberId: string;
  staffMemberName: string;
  customerName: string;
  insurer: string;
  insuranceType: string;
  policyNumber?: string;
  premiumAmount: string;
  brokerageCommissionAmount: string;
  employeePayoutAmount: string;
  payoutStatus: PayoutStatus;
  payoutPaidAt?: string;
  notes?: string;
};

export type OperationsSummary = {
  saleCount: number;
  premiumAmount: string;
  brokerageCommissionAmount: string;
  employeePayoutAmount: string;
  pendingPayoutAmount: string;
};

export type CreateStaffMemberInput = {
  name: string;
  email: string;
  role: StaffRole;
};

export type UpdateStaffMemberInput = CreateStaffMemberInput & {
  active: boolean;
};

export type InsuranceSaleInput = {
  soldAt: string;
  staffMemberId: string;
  customerName: string;
  insurer: string;
  insuranceType: string;
  policyNumber?: string;
  premiumAmount: string;
  brokerageCommissionAmount: string;
  employeePayoutAmount: string;
  payoutStatus: PayoutStatus;
  notes?: string;
};
