import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
] as const;

for (const viewport of viewports) {
  test(`formulário de cotação em ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/contato");

    await expect(
      page.getByRole("heading", { name: "Conte o essencial para iniciarmos" }),
    ).toBeVisible();
    await expect(page.getByLabel("Nome completo *")).toBeVisible();
    await expect(page.getByRole("button", { name: "Solicitar cotação" })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);

    await page.screenshot({
      fullPage: true,
      path: `test-results/quote-form-${viewport.name}.png`,
    });
  });
}

test("campos e destinos essenciais permanecem acessíveis", async ({ page }) => {
  await page.goto("/contato");

  const whatsapp = page.getByRole("link", { name: "Conversar pelo WhatsApp" });
  const phone = page.getByRole("link", { name: "Ligar agora" });
  const email = page.getByRole("link", { name: "Enviar e-mail" });

  await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  await expect(phone).toHaveAttribute("href", /^tel:/);
  await expect(email).toHaveAttribute("href", /^mailto:contato@bsveritas\.com\.br$/);
  await expect(page.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute(
    "href",
    "/politica-de-privacidade",
  );

  await page.getByLabel("Nome completo *").focus();
  await expect(page.getByLabel("Nome completo *")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Telefone com DDD *")).toBeFocused();
});

test("pré-seleciona uma modalidade válida sem aceitar valores desconhecidos", async ({ page }) => {
  await page.goto("/contato?seguro=residencial#solicitar-cotacao");
  await expect(page.getByLabel("Seguro de interesse *")).toHaveValue("residencial");

  await page.goto("/contato?seguro=inexistente#solicitar-cotacao");
  await expect(page.getByLabel("Seguro de interesse *")).toHaveValue("");
});
