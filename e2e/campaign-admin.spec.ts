import { expect, test } from "@playwright/test";

for (const width of [360, 390, 768, 1440]) {
  test(`painel de campanhas permanece utilizável em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/admin/campanhas");

    await expect(
      page.getByRole("heading", { level: 1, name: "Campanhas das seguradoras" }),
    ).toBeVisible();
    await expect(page.getByLabel("Imagem oficial *")).toHaveAttribute("accept", /image\/jpeg/);
    await expect(
      page.getByLabel("Seguradora *").getByRole("option", { name: "Bradesco Seguros" }),
    ).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Salvar campanha" })).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
