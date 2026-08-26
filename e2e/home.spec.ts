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

test("navega pelo catalogo de seguros", async ({ page }) => {
  await page.goto("/seguros");

  await expect(
    page.getByRole("heading", { level: 1, name: "Uma escolha orientada pela sua necessidade" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Conhecer Seguro Auto" }).click();
  await expect(page).toHaveURL(/\/seguros\/auto$/);
  await expect(page.getByRole("heading", { level: 1, name: "Seguro Auto" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Informações importantes" })).toBeVisible();
});

test("exibe a pagina institucional sobre", async ({ page }) => {
  await page.goto("/sobre");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Confiança se constrói com clareza e presença",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "O que orienta cada atendimento" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver seguros" })).toHaveAttribute("href", "/seguros");
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

    for (const path of ["/sobre", "/seguros", "/seguros/auto"]) {
      await page.goto(path);

      const routeHasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );

      expect(routeHasHorizontalOverflow).toBe(false);
    }
  });
});
