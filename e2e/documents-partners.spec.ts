import { expect, test } from "@playwright/test";
import { partnerCatalog } from "../src/features/partners/catalog";

const documents = [
  { route: "/politica-de-privacidade", count: 8 },
  { route: "/politica-de-cookies", count: 7 },
  { route: "/termos-de-uso", count: 8 },
] as const;

for (const width of [320, 390, 768, 1440]) {
  test(`quatro parceiras visíveis juntas em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const partners = page.getByRole("region", { name: "Seguradoras e plataformas parceiras" });
    await partners.scrollIntoViewIfNeeded();
    await expect(partners.getByRole("listitem")).toHaveCount(partnerCatalog.length);
    for (const partner of partnerCatalog) {
      const logo = partners.getByRole("img", { name: `Logotipo ${partner.name}` });
      await expect(logo).toBeInViewport({ ratio: 1 });
      expect(
        await logo.evaluate((element) => (element as HTMLImageElement).naturalWidth),
      ).toBeGreaterThan(0);
      await expect(partners.getByText(partner.name, { exact: true })).toBeInViewport({ ratio: 1 });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
  });

  for (const entry of documents) {
    test(`${entry.route}: índice e âncoras em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(entry.route);
      const index = page.getByRole("navigation", { name: "Nesta página" });
      const links = index.getByRole("link");
      await expect(links).toHaveCount(entry.count);
      for (const link of await links.all()) {
        const href = await link.getAttribute("href");
        expect(href).toMatch(/^#[a-z-]+$/);
        const heading = page.locator(href!);
        await expect(heading).toHaveText((await link.innerText()).trim());
        await link.focus();
        await page.keyboard.press("Enter");
        await expect(heading).toBeFocused();
        await expect(heading).toBeInViewport();
        const headingBox = await heading.boundingBox();
        const headerBox = await page.getByRole("banner").boundingBox();
        expect(headingBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);
      }
      await page.getByRole("link", { name: "Voltar ao índice" }).click();
      await expect(page.getByRole("heading", { name: "Nesta página" })).toBeFocused();
      await expect(page.getByRole("heading", { name: "Nesta página" })).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      );
    });
  }
}

test("inventário relaciona categoria, finalidade e status no celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/politica-de-cookies#inventario");
  const inventory = page.getByRole("region", { name: "2. Inventário atual" });
  const categories = inventory.locator("dl");
  await expect(categories).toHaveCount(4);
  for (const category of await categories.all()) {
    await expect(category.locator("dt")).toHaveText(["Categoria", "Finalidade típica", "Status"]);
    await expect(category.locator("dd").last()).toHaveText("Não utilizada");
  }
});
