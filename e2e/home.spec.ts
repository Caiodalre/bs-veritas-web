import { expect, test } from "@playwright/test";
import { insuranceCatalog } from "../src/features/insurance/catalog";

test("exibe a pagina inicial", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/B&S Veritas/);
  await expect(
    page.getByRole("link", { name: "Fale conosco por e-mail ou telefone" }),
  ).toHaveAttribute("href", "/contato");
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

test("publica os canais oficiais de contato sem formulario", async ({ page }) => {
  await page.goto("/contato");

  await expect(
    page.getByRole("heading", { level: 1, name: "Fale com a B&S Veritas" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Conversar pelo WhatsApp" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ligar agora" })).toHaveAttribute(
    "href",
    "tel:+5511985269641",
  );
  await expect(page.getByRole("link", { name: "Enviar e-mail" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Enviar e-mail" })).toHaveAttribute(
    "href",
    "mailto:contato@bsveritas.com.br",
  );
  await expect(page.getByRole("heading", { name: "Proteja suas informações" })).toBeVisible();
});

test("publica a politica de privacidade e o canal do titular", async ({ page }) => {
  await page.goto("/politica-de-privacidade");

  await expect(
    page.getByRole("heading", { level: 1, name: "Como tratamos informações pessoais" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "6. Direitos do titular" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Falar sobre privacidade" })).toHaveAttribute(
    "href",
    "mailto:contato@bsveritas.com.br?subject=Privacidade",
  );
});

test("publica os termos de uso e o canal de contato", async ({ page }) => {
  await page.goto("/termos-de-uso");

  await expect(
    page.getByRole("heading", { level: 1, name: "Regras para uso deste site" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "3. Seguros e atendimento" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Falar sobre os termos" })).toHaveAttribute(
    "href",
    "mailto:contato@bsveritas.com.br?subject=Termos%20de%20Uso",
  );
});

test("publica sitemap com as rotas atuais", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(body).toContain("<loc>https://bsveritas.com.br/</loc>");
  expect(body).toContain("<loc>https://bsveritas.com.br/sobre</loc>");
  expect(body).toContain("<loc>https://bsveritas.com.br/sinistros</loc>");
  expect(body).toContain("<loc>https://bsveritas.com.br/contato</loc>");
  expect(body).toContain("<loc>https://bsveritas.com.br/politica-de-privacidade</loc>");
  expect(body).toContain("<loc>https://bsveritas.com.br/termos-de-uso</loc>");

  for (const insurance of insuranceCatalog) {
    expect(body).toContain(`<loc>https://bsveritas.com.br/seguros/${insurance.slug}</loc>`);
  }
});

test("publica robots com rastreamento permitido no domínio oficial", async ({ request }) => {
  const response = await request.get("/robots.txt");
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(body).toContain("User-Agent: *");
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap:");
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
    await expect(
      page.getByRole("link", { name: "Fale conosco por e-mail ou telefone" }),
    ).toHaveAttribute("href", "/contato");

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );

    expect(hasHorizontalOverflow).toBe(false);

    for (const path of [
      "/sobre",
      "/seguros",
      "/seguros/auto",
      "/sinistros",
      "/contato",
      "/politica-de-privacidade",
      "/termos-de-uso",
    ]) {
      await page.goto(path);

      const routeHasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );

      expect(routeHasHorizontalOverflow).toBe(false);
    }
  });
});
