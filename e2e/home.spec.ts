import { expect, test } from "@playwright/test";

test("exibe a pagina inicial", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/B&S Veritas/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Proteção para o que realmente importa." }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Conheça os seguros" }).click();
  await expect(
    page.getByRole("heading", { name: "Seguros para diferentes fases da sua vida" }),
  ).toBeVisible();
});

test.describe("layout mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mantem a navegacao acessivel e sem overflow horizontal", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

    await page.locator("summary").click();
    await expect(page.getByRole("navigation", { name: "Navegação móvel" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Seguros", exact: true }).last()).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );

    expect(hasHorizontalOverflow).toBe(false);
  });
});
