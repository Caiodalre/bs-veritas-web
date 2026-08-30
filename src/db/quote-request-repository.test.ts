import { describe, expect, it, vi } from "vitest";
import { quoteRequests } from "./schema";
import {
  createDrizzleQuoteRequestRepository,
  type QuoteDatabase,
} from "./quote-request-repository";
import type { QuoteRequestToPersist } from "@/features/quote/service";

const request: QuoteRequestToPersist = {
  fullName: "Pessoa Exemplo",
  phone: "11999990000",
  email: "pessoa@example.invalid",
  insuranceType: "auto",
  city: "Cidade Exemplo",
  message: "Mensagem inteiramente fictícia.",
  privacyPolicyVersion: "v1",
  retentionExpiresAt: new Date("2030-02-01T00:00:00.000Z"),
};

function createDatabase(result: { id: string }[]) {
  const returning = vi.fn(async () => result);
  const values = vi.fn(() => ({ returning }));
  const insert = vi.fn(() => ({ values }));
  const database = { insert } as unknown as QuoteDatabase;

  return { database, insert, values, returning };
}

describe("createDrizzleQuoteRequestRepository", () => {
  it("insere a solicitação e retorna somente o identificador", async () => {
    const id = "00000000-0000-4000-8000-000000000000";
    const { database, insert, values, returning } = createDatabase([{ id }]);
    const repository = createDrizzleQuoteRequestRepository(database);

    await expect(repository.create(request)).resolves.toEqual({ id });
    expect(insert).toHaveBeenCalledWith(quoteRequests);
    expect(values).toHaveBeenCalledWith(request);
    expect(returning).toHaveBeenCalledWith({ id: quoteRequests.id });
  });

  it("falha de forma explícita quando o banco não retorna o registro", async () => {
    const { database } = createDatabase([]);
    const repository = createDrizzleQuoteRequestRepository(database);

    await expect(repository.create(request)).rejects.toThrow("Quote request was not persisted.");
  });
});
