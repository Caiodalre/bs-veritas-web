import { expect, test } from "@playwright/test";
import { insuranceCatalog } from "../src/features/insurance/catalog";

for (const width of [320, 390, 768, 1440]) {
  test(`páginas institucionais sem cortes em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["/", "/seguros", "/sobre"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      );
      if (route === "/sobre") {
        await expect(page.getByText("Responsável pela cotação", { exact: true })).toBeInViewport();
      }
    }
  });
}

test("início oferece seis atalhos e o catálogo complementa a escolha", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("link", { name: "Ver modalidades" }).click();
  const shortcuts = page.getByRole("navigation", { name: "Acesso rápido às modalidades" });
  await expect(shortcuts.getByRole("link")).toHaveCount(6);
  for (const insurance of insuranceCatalog) {
    await expect(
      shortcuts.getByRole("link", { name: `Conhecer ${insurance.name}` }),
    ).toHaveAttribute("href", `/seguros/${insurance.slug}`);
  }
  const guide = page.getByRole("link", { name: "Precisa de ajuda para escolher a modalidade?" });
  await guide.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/seguros$/);
  const catalog = page.getByRole("region", { name: "Guia de modalidades" });
  await expect(catalog.getByRole("article")).toHaveCount(6);
  for (const insurance of insuranceCatalog) {
    const card = catalog
      .getByRole("article")
      .filter({ has: page.getByRole("heading", { name: insurance.name, exact: true }) });
    await expect(card).toContainText(insurance.description);
    await expect(card).toContainText(insurance.practicalQuestions[0]);
    await expect(card.getByRole("link")).toHaveAttribute("href", `/seguros/${insurance.slug}`);
  }
});

test("sobre concentra o processo e conecta cotação e sinistros", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("link", { name: "Conhecer a B&S Veritas" }).click();
  await expect(page).toHaveURL(/\/sobre$/);
  const process = page.getByRole("region", { name: "Como funciona o atendimento" });
  await expect(process.getByRole("listitem")).toHaveCount(3);
  await expect(process).toContainText("Você não precisa enviar documentos ou dados sensíveis");
  await expect(process).toContainText("renovação");
  await expect(process.getByRole("link")).toHaveAttribute("href", "/sinistros");
  await page.getByRole("link", { name: "Iniciar uma cotação" }).click();
  await expect(page).toHaveURL(/\/contato#solicitar-cotacao$/);
  await expect(page.getByLabel("Nome completo *")).toBeInViewport();
});
