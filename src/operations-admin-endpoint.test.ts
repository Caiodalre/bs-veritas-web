/** @vitest-environment node */

import { describe, expect, it, vi } from "vitest";
import type {
  InsuranceSale,
  InsuranceSaleInput,
  OperationsActor,
  StaffMember,
} from "@/features/operations-admin/model";
import { handleOperationsAdminRequest } from "../worker/operations-admin-endpoint";
import type { OperationsAdminRepository } from "../worker/operations-admin-repository";

const actorEmail = "admin@example.invalid";
const identity = { email: actorEmail, subject: "subject-example" };
const actor: OperationsActor = {
  email: actorEmail,
  staffMemberId: "11111111-1111-4111-8111-111111111111",
  name: "Pessoa Administradora",
  role: "administrator",
  isMaster: true,
};
const regularAdministrator: OperationsActor = { ...actor, isMaster: false };
const employeeActor: OperationsActor = {
  ...actor,
  name: "Pessoa Funcionária",
  role: "employee",
  isMaster: false,
};
const staffMember: StaffMember = {
  id: actor.staffMemberId,
  createdAt: "2026-09-26T12:00:00.000Z",
  updatedAt: "2026-09-26T12:00:00.000Z",
  name: actor.name,
  email: actorEmail,
  role: "administrator",
  isMaster: true,
  accessBound: true,
  active: true,
};
const validSaleInput: InsuranceSaleInput = {
  soldAt: "2026-09-26",
  staffMemberId: staffMember.id,
  customerName: "Cliente Exemplo",
  insurer: "Seguradora Exemplo",
  insuranceType: "auto",
  policyNumber: "APOLICE-EXEMPLO",
  premiumAmount: "1000.00",
  brokerageCommissionAmount: "200.00",
  employeePayoutAmount: "75.00",
  payoutStatus: "pending",
  notes: "Registro fictício usado somente em teste.",
};

function createSale(index = 0): InsuranceSale {
  return {
    id: `22222222-2222-4222-8222-${String(index).padStart(12, "0")}`,
    createdAt: "2026-09-26T12:00:00.000Z",
    updatedAt: "2026-09-26T12:00:00.000Z",
    staffMemberName: staffMember.name,
    ...validSaleInput,
  };
}

function createRepository() {
  return {
    getSession: vi.fn<OperationsAdminRepository["getSession"]>(async () => ({
      actor,
      bootstrapAvailable: false,
    })),
    bootstrapMaster: vi.fn(async () => staffMember),
    listStaff: vi.fn(async () => [staffMember]),
    createStaff: vi.fn(async () => staffMember),
    updateStaff: vi.fn(async () => staffMember),
    listSales: vi.fn(async () => [createSale()]),
    createSale: vi.fn(async () => createSale()),
    updateSale: vi.fn(async () => createSale()),
    getSummary: vi.fn(async () => ({
      saleCount: 1,
      premiumAmount: "1000.00",
      brokerageCommissionAmount: "200.00",
      employeePayoutAmount: "75.00",
      pendingPayoutAmount: "75.00",
    })),
  } satisfies OperationsAdminRepository;
}

function createEnv(enabled = true) {
  return {
    OPERATIONS_ADMIN_ENABLED: enabled ? "true" : "false",
    HYPERDRIVE: { connectionString: "postgres://example.invalid/database" },
  };
}

const authorize = async () => identity;

function jsonRequest(path: string, method: "POST" | "PATCH", body: unknown) {
  return new Request(`https://bsveritas.com.br${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("operations admin endpoint", () => {
  it("falha de forma fechada quando o módulo está desativado", async () => {
    const authorizeSpy = vi.fn(authorize);
    const response = await handleOperationsAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/operations/session"),
      createEnv(false),
      { authorize: authorizeSpy },
    );

    expect(response.status).toBe(503);
    expect(authorizeSpy).not.toHaveBeenCalled();
  });

  it("nega acesso antes de consultar o banco quando o JWT não é válido", async () => {
    const createRepository = vi.fn();
    const response = await handleOperationsAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/operations/session"),
      createEnv(),
      { authorize: async () => undefined, createRepository },
    );

    expect(response.status).toBe(401);
    expect(createRepository).not.toHaveBeenCalled();
  });

  it("informa quando a ativação do primeiro administrador está disponível", async () => {
    const repository = createRepository();
    repository.getSession.mockResolvedValueOnce({ bootstrapAvailable: true });
    const response = await handleOperationsAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/operations/session"),
      createEnv(),
      { authorize, createRepository: () => repository },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      authenticated: true,
      authorized: false,
      bootstrapAvailable: true,
    });
  });

  it("ativa o primeiro administrador com o e-mail validado pelo Access", async () => {
    const repository = createRepository();
    const response = await handleOperationsAdminRequest(
      jsonRequest("/api/admin/campaigns/operations/bootstrap", "POST", {
        name: "Pessoa Administradora",
      }),
      createEnv(),
      { authorize, createRepository: () => repository },
    );

    expect(response.status).toBe(201);
    expect(repository.bootstrapMaster).toHaveBeenCalledWith(identity, "Pessoa Administradora");
  });

  it("impede usuário autenticado sem função administrativa", async () => {
    const repository = createRepository();
    repository.getSession.mockResolvedValueOnce({ bootstrapAvailable: false });
    const response = await handleOperationsAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/operations/staff"),
      createEnv(),
      { authorize, createRepository: () => repository },
    );

    expect(response.status).toBe(403);
    expect(repository.listStaff).not.toHaveBeenCalled();
  });

  it("cadastra funcionário com payload estrito", async () => {
    const repository = createRepository();
    const response = await handleOperationsAdminRequest(
      jsonRequest("/api/admin/campaigns/operations/staff", "POST", {
        name: "Pessoa Funcionária",
        email: "funcionario@example.invalid",
        role: "employee",
        isMaster: false,
      }),
      createEnv(),
      { authorize, createRepository: () => repository },
    );

    expect(response.status).toBe(201);
    expect(repository.createStaff).toHaveBeenCalledWith(identity, {
      name: "Pessoa Funcionária",
      email: "funcionario@example.invalid",
      role: "employee",
      isMaster: false,
    });
  });

  it("reserva o cadastro de funcionários ao ADM master", async () => {
    const repository = createRepository();
    repository.getSession.mockResolvedValueOnce({
      actor: regularAdministrator,
      bootstrapAvailable: false,
    });
    const response = await handleOperationsAdminRequest(
      jsonRequest("/api/admin/campaigns/operations/staff", "POST", {
        name: "Pessoa Funcionária",
        email: "funcionario@example.invalid",
        role: "employee",
        isMaster: false,
      }),
      createEnv(),
      { authorize, createRepository: () => repository },
    );

    expect(response.status).toBe(403);
    expect(repository.createStaff).not.toHaveBeenCalled();
  });

  it("permite que o funcionário consulte somente sua visão operacional", async () => {
    const repository = createRepository();
    repository.getSession.mockResolvedValueOnce({
      actor: employeeActor,
      bootstrapAvailable: false,
    });
    const response = await handleOperationsAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/operations/sales"),
      createEnv(),
      { authorize, createRepository: () => repository },
    );

    expect(response.status).toBe(200);
    expect(repository.listSales).toHaveBeenCalledWith({ identity, limit: 21 });
  });

  it("impede funcionário de registrar seguros ou consultar a equipe", async () => {
    const salesRepository = createRepository();
    salesRepository.getSession.mockResolvedValueOnce({
      actor: employeeActor,
      bootstrapAvailable: false,
    });
    const salesResponse = await handleOperationsAdminRequest(
      jsonRequest("/api/admin/campaigns/operations/sales", "POST", validSaleInput),
      createEnv(),
      { authorize, createRepository: () => salesRepository },
    );

    const staffRepository = createRepository();
    staffRepository.getSession.mockResolvedValueOnce({
      actor: employeeActor,
      bootstrapAvailable: false,
    });
    const staffResponse = await handleOperationsAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/operations/staff"),
      createEnv(),
      { authorize, createRepository: () => staffRepository },
    );

    expect(salesResponse.status).toBe(403);
    expect(staffResponse.status).toBe(403);
    expect(salesRepository.createSale).not.toHaveBeenCalled();
    expect(staffRepository.listStaff).not.toHaveBeenCalled();
  });

  it("rejeita repasse superior à comissão antes de consultar a gravação", async () => {
    const repository = createRepository();
    const response = await handleOperationsAdminRequest(
      jsonRequest("/api/admin/campaigns/operations/sales", "POST", {
        ...validSaleInput,
        employeePayoutAmount: "201.00",
      }),
      createEnv(),
      { authorize, createRepository: () => repository },
    );

    expect(response.status).toBe(422);
    expect(repository.createSale).not.toHaveBeenCalled();
  });

  it("lista somente uma página de seguros e fornece cursor opaco", async () => {
    const repository = createRepository();
    repository.listSales.mockResolvedValueOnce(
      Array.from({ length: 21 }, (_, index) => createSale(index)),
    );
    const response = await handleOperationsAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/operations/sales"),
      createEnv(),
      { authorize, createRepository: () => repository },
    );
    const payload = (await response.json()) as { items: InsuranceSale[]; nextCursor: string };

    expect(response.status).toBe(200);
    expect(payload.items).toHaveLength(20);
    expect(payload.nextCursor).toMatch(/^[A-Za-z0-9_-]+$/u);
    expect(repository.listSales).toHaveBeenCalledWith({ identity, limit: 21 });
  });

  it("não registra nem devolve detalhes sensíveis quando o banco falha", async () => {
    const repository = createRepository();
    const sensitiveDetail = "cliente-real@example.invalid";
    repository.listStaff.mockRejectedValueOnce(new Error(sensitiveDetail));
    const logger = { error: vi.fn() };
    const response = await handleOperationsAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/operations/staff"),
      createEnv(),
      { authorize, createRepository: () => repository, logger },
    );
    const responseText = await response.text();
    const loggedValue = String(logger.error.mock.calls[0]?.[0]);

    expect(response.status).toBe(503);
    expect(responseText).not.toContain(sensitiveDetail);
    expect(loggedValue).toBe(
      JSON.stringify({ event: "operations_admin_request_failed", errorType: "Error" }),
    );
  });
});
