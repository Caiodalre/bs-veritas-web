import { expect, test } from "@playwright/test";

const item = {
  id: "11111111-1111-4111-8111-111111111111",
  createdAt: "2026-09-25T15:00:00.000Z",
  fullName: "Pessoa Exemplo",
  phone: "11999990000",
  email: "pessoa@example.invalid",
  insuranceType: "auto",
  city: "Cidade Exemplo",
  message: "Mensagem inteiramente fictícia.",
  retentionExpiresAt: "2027-03-24T15:00:00.000Z",
  status: "new",
};

for (const width of [360, 390, 768, 1440]) {
  test(`painel de solicitações permanece utilizável em ${width}px`, async ({ page }) => {
    await page.route("**/api/admin/campaigns/quote-requests*", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ items: [item], nextCursor: null }),
      });
    });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/admin/campanhas/solicitacoes");

    await expect(
      page.getByRole("heading", { level: 1, name: "Solicitações de cotação" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Pessoa Exemplo" })).toBeVisible();
    await expect(page.getByLabel("Filtrar por situação")).toBeVisible();
    await expect(page.getByRole("button", { name: "Em atendimento" })).toBeVisible();
    await expect(page.getByText("pessoa@example.invalid")).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
