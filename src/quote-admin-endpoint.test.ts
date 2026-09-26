/** @vitest-environment node */

import { describe, expect, it, vi } from "vitest";
import type { QuoteAdminItem, QuoteAdminStatus } from "@/features/quote-admin/model";
import { handleQuoteAdminRequest } from "../worker/quote-admin-endpoint";
import type { QuoteAdminRepository } from "../worker/quote-admin-repository";

const firstId = "11111111-1111-4111-8111-111111111111";

function createItem(index = 0, status: QuoteAdminStatus = "new"): QuoteAdminItem {
  return {
    id: index === 0 ? firstId : `11111111-1111-4111-8111-${String(index).padStart(12, "0")}`,
    createdAt: new Date(Date.UTC(2026, 8, 25, 15, 0, 0) - index * 1_000).toISOString(),
    fullName: `Pessoa Exemplo ${index}`,
    phone: "11999990000",
    email: `pessoa${index}@example.invalid`,
    insuranceType: "auto",
    city: "Cidade Exemplo",
    message: "Mensagem fictícia usada somente em teste.",
    retentionExpiresAt: "2027-03-24T15:00:00.000Z",
    status,
  };
}

function createRepository(items: readonly QuoteAdminItem[] = [createItem()]) {
  const list = vi.fn(async () => items);
  const updateStatus = vi.fn(async (id: string, status: QuoteAdminStatus) =>
    id === firstId ? { id, status } : undefined,
  );
  const repository = { list, updateStatus } satisfies QuoteAdminRepository;
  return { list, repository, updateStatus };
}

function createEnv(enabled = true) {
  return {
    QUOTE_ADMIN_ENABLED: enabled ? "true" : "false",
    HYPERDRIVE: { connectionString: "postgres://example.invalid/database" },
  };
}

describe("quote admin endpoint", () => {
  it("falha de forma fechada quando o painel está desativado", async () => {
    const authorize = vi.fn(async () => true);
    const response = await handleQuoteAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/quote-requests"),
      createEnv(false),
      { authorize },
    );

    expect(response.status).toBe(503);
    expect(authorize).not.toHaveBeenCalled();
  });

  it("nega acesso antes de consultar o banco", async () => {
    const createRepository = vi.fn();
    const response = await handleQuoteAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/quote-requests"),
      createEnv(),
      { authorize: async () => false, createRepository },
    );

    expect(response.status).toBe(401);
    expect(createRepository).not.toHaveBeenCalled();
  });

  it("lista somente uma página e fornece cursor opaco", async () => {
    const { list, repository } = createRepository(
      Array.from({ length: 21 }, (_, index) => createItem(index)),
    );
    const response = await handleQuoteAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/quote-requests?status=new"),
      createEnv(),
      { authorize: async () => true, createRepository: () => repository },
    );
    const payload = (await response.json()) as { items: QuoteAdminItem[]; nextCursor: string };

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(payload.items).toHaveLength(20);
    expect(payload.nextCursor).toMatch(/^[A-Za-z0-9_-]+$/u);
    expect(list).toHaveBeenCalledWith({ status: "new", limit: 21 });
  });

  it("rejeita cursor inválido antes de consultar o banco", async () => {
    const { list, repository } = createRepository();
    const response = await handleQuoteAdminRequest(
      new Request(
        "https://bsveritas.com.br/api/admin/campaigns/quote-requests?cursor=cursor%20invalido",
      ),
      createEnv(),
      { authorize: async () => true, createRepository: () => repository },
    );

    expect(response.status).toBe(400);
    expect(list).not.toHaveBeenCalled();
  });

  it("atualiza somente a situação permitida", async () => {
    const { repository, updateStatus } = createRepository();
    const response = await handleQuoteAdminRequest(
      new Request(`https://bsveritas.com.br/api/admin/campaigns/quote-requests/${firstId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "contacted" }),
      }),
      createEnv(),
      { authorize: async () => true, createRepository: () => repository },
    );

    expect(response.status).toBe(200);
    expect(updateStatus).toHaveBeenCalledWith(firstId, "contacted");
    await expect(response.json()).resolves.toEqual({
      item: { id: firstId, status: "contacted" },
    });
  });

  it("rejeita propriedades extras na atualização", async () => {
    const { repository, updateStatus } = createRepository();
    const response = await handleQuoteAdminRequest(
      new Request(`https://bsveritas.com.br/api/admin/campaigns/quote-requests/${firstId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "closed", fullName: "Tentativa de alteração" }),
      }),
      createEnv(),
      { authorize: async () => true, createRepository: () => repository },
    );

    expect(response.status).toBe(422);
    expect(updateStatus).not.toHaveBeenCalled();
  });

  it("não registra nem devolve detalhes sensíveis quando o banco falha", async () => {
    const sensitiveDetail = "pessoa-real@example.invalid";
    const logger = { error: vi.fn() };
    const repository = {
      list: vi.fn(async () => {
        throw new Error(sensitiveDetail);
      }),
      updateStatus: vi.fn(),
    } satisfies QuoteAdminRepository;
    const response = await handleQuoteAdminRequest(
      new Request("https://bsveritas.com.br/api/admin/campaigns/quote-requests"),
      createEnv(),
      { authorize: async () => true, createRepository: () => repository, logger },
    );
    const responseText = await response.text();
    const loggedValue = String(logger.error.mock.calls[0]?.[0]);

    expect(response.status).toBe(503);
    expect(responseText).not.toContain(sensitiveDetail);
    expect(loggedValue).toBe(
      JSON.stringify({ event: "quote_admin_request_failed", errorType: "Error" }),
    );
    expect(loggedValue).not.toContain(sensitiveDetail);
  });
});
