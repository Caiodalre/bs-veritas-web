import { expect, test } from "@playwright/test";
import { insuranceCatalog } from "../src/features/insurance/catalog";

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

for (const insurance of insuranceCatalog) {
  test(`publica a pagina de ${insurance.name}`, async ({ page }) => {
    const response = await page.goto(`/seguros/${insurance.slug}`);

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole("heading", { level: 1, name: insurance.name })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Informações importantes" })).toBeVisible();
  });
}

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

test("publica orientacoes seguras sobre sinistros", async ({ page }) => {
  await page.goto("/sinistros");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Orientação clara quando acontece um sinistro",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Há risco imediato?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Apoio sem promessas indevidas" })).toBeVisible();
});

test("publica sitemap com as rotas atuais", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(body).toContain("<loc>https://bsveritas.com.br/</loc>");
  expect(body).toContain("<loc>https://bsveritas.com.br/sobre</loc>");
  expect(body).toContain("<loc>https://bsveritas.com.br/sinistros</loc>");

  for (const insurance of insuranceCatalog) {
    expect(body).toContain(`<loc>https://bsveritas.com.br/seguros/${insurance.slug}</loc>`);
  }
});

test("responde com pagina 404 personalizada", async ({ page }) => {
  const response = await page.goto("/pagina-inexistente");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Esta página não foi encontrada" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar ao início" })).toHaveAttribute("href", "/");
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

    for (const path of ["/sobre", "/seguros", "/seguros/auto", "/sinistros"]) {
      await page.goto(path);

      const routeHasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );

      expect(routeHasHorizontalOverflow).toBe(false);
    }
  });
});
