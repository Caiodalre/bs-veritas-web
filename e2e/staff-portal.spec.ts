import { expect, test } from "@playwright/test";

const identity = {
  email: "funcionario@example.invalid",
  staffMemberId: "11111111-1111-4111-8111-111111111111",
  name: "Pessoa Funcionária",
};

const summary = {
  saleCount: 1,
  premiumAmount: "1000.00",
  brokerageCommissionAmount: "200.00",
  employeePayoutAmount: "75.00",
  pendingPayoutAmount: "75.00",
};

const sale = {
  id: "22222222-2222-4222-8222-222222222222",
  createdAt: "2026-09-27T12:00:00.000Z",
  updatedAt: "2026-09-27T12:00:00.000Z",
  soldAt: "2026-09-27",
  staffMemberId: identity.staffMemberId,
  staffMemberName: identity.name,
  customerName: "Cliente Fictício",
  insurer: "Seguradora Exemplo",
  insuranceType: "auto",
  premiumAmount: "1000.00",
  brokerageCommissionAmount: "200.00",
  employeePayoutAmount: "75.00",
  payoutStatus: "pending",
};

test("funcionário vê somente sua visão e não carrega a equipe", async ({ page }) => {
  let staffRequests = 0;
  await page.route("**/api/admin/campaigns/operations/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith("/session")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          authenticated: true,
          authorized: true,
          actor: { ...identity, role: "employee", isMaster: false },
        }),
      });
      return;
    }
    if (pathname.endsWith("/sales")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ items: [sale], nextCursor: null }),
      });
      return;
    }
    if (pathname.endsWith("/summary")) {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ summary }) });
      return;
    }
    if (pathname.endsWith("/staff")) staffRequests += 1;
    await route.fulfill({ status: 403, contentType: "application/json", body: "{}" });
  });

  await page.goto("/painel");

  await expect(
    page.getByRole("heading", { level: 1, name: "Funcionários, vendas e repasses" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: "Meus seguros e repasses" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 4, name: "Cliente Fictício" })).toBeVisible();
  await expect(page.getByRole("button", { name: /registrar seguro/iu })).toHaveCount(0);
  expect(staffRequests).toBe(0);
});

test("ADM master pode cadastrar perfis sem campo de senha", async ({ page }) => {
  await page.route("**/api/admin/campaigns/operations/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const body = pathname.endsWith("/session")
      ? {
          authenticated: true,
          authorized: true,
          actor: { ...identity, role: "administrator", isMaster: true },
        }
      : pathname.endsWith("/staff")
        ? { items: [] }
        : pathname.endsWith("/sales")
          ? { items: [], nextCursor: null }
          : { summary: { ...summary, saleCount: 0 } };
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });
  });

  await page.goto("/painel");

  await expect(page.getByRole("heading", { level: 3, name: "Funcionários" })).toBeVisible();
  await expect(page.getByLabel("Função").getByRole("option", { name: "ADM master" })).toHaveCount(
    1,
  );
  await expect(page.getByRole("button", { name: "Adicionar funcionário" })).toBeVisible();
  await expect(page.getByLabel(/senha/iu)).toHaveCount(0);
});
