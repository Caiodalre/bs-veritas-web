import { expect, test } from "@playwright/test";
import { insuranceCatalog } from "../src/features/insurance/catalog";

for (const insurance of insuranceCatalog) {
  test(`${insurance.slug}: layout responsivo e conteúdo preservado`, async ({ page }) => {
    await page.goto(`/seguros/${insurance.slug}`);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(insurance.name);
      await expect(
        page.getByRole("link", { name: "Solicitar cotação", exact: true }).first(),
      ).toBeInViewport({ ratio: 1 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      );
    }

    for (const text of [
      ...insurance.audiences,
      ...insurance.analysisPoints,
      ...insurance.practicalQuestions,
    ]) {
      await expect(page.getByText(text, { exact: true })).toBeVisible();
    }
    const faq = page.getByRole("region", { name: "O que vale esclarecer antes de contratar" });
    const preparation = page.getByRole("region", { name: "Prepare sua cotação" });
    await expect(faq.locator("details")).toHaveCount(insurance.faqs.length);
    expect((await faq.boundingBox())!.y).toBeLessThan((await preparation.boundingBox())!.y);
    await expect(
      page.getByRole("complementary", { name: "Informações importantes" }),
    ).toContainText(
      "A contratação depende da proposta, das condições contratuais e da aceitação do risco.",
    );
    await expect(page.getByRole("link", { name: "Consultar orientação da SUSEP" })).toHaveAttribute(
      "href",
      insurance.referenceUrl,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://bsveritas.com.br/seguros/${insurance.slug}`,
    );
    const quoteLinks = page.getByRole("link", { name: "Solicitar cotação", exact: true });
    await expect(quoteLinks).toHaveCount(2);
    for (const link of await quoteLinks.all()) {
      await expect(link).toHaveAttribute(
        "href",
        `/contato?seguro=${insurance.slug}#solicitar-cotacao`,
      );
    }
  });

  test(`${insurance.slug}: FAQ por teclado e cotação com contexto`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/seguros/${insurance.slug}`);
    for (const faq of insurance.faqs) {
      const summary = page.locator("summary").filter({ hasText: faq.question });
      const answer = page.getByText(faq.answer, { exact: true });
      await summary.focus();
      await page.keyboard.press("Enter");
      await expect(answer).toBeVisible();
      await page.keyboard.press("Space");
      await expect(answer).toBeHidden();
    }
    await page.getByRole("link", { name: "Solicitar cotação", exact: true }).last().click();
    await expect(page).toHaveURL(
      new RegExp(`/contato\\?seguro=${insurance.slug}#solicitar-cotacao$`),
    );
    await expect(page.getByLabel("Seguro de interesse *")).toHaveValue(insurance.slug);
    await expect(page.getByLabel("Nome completo *")).toBeInViewport();
  });
}
