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

    await expect(page.getByRole("heading", { name: "Solicite sua cotação" })).toBeVisible();
    await expect(page.getByLabel("Nome completo *")).toBeVisible();
    await expect(page.getByRole("button", { name: "Solicitar cotação" })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);

    await page.evaluate(() => document.fonts.ready);
    const positions = await page.evaluate(() => {
      const quote = document.getElementById("solicitar-cotacao");
      const channels = document.getElementById("other-contact-title");
      const name = document.querySelector('input[name="fullName"]');
      if (!quote || !channels || !name) throw new Error("Seções de contato ausentes");
      return {
        quote: quote.getBoundingClientRect().top + window.scrollY,
        channels: channels.getBoundingClientRect().top + window.scrollY,
        firstField: name.getBoundingClientRect().top + window.scrollY,
      };
    });
    expect(positions.quote).toBeLessThan(positions.channels);
    expect(positions.firstField).toBeLessThan(1100);
    await expect(page.getByRole("link", { name: "Preencher cotação" })).toBeInViewport();

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

test("atalho de cotação preserva a modalidade e posiciona o formulário no celular", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contato?seguro=auto");
  await page.getByRole("link", { name: "Preencher cotação" }).click();

  await expect(page).toHaveURL(/\/contato\?seguro=auto#solicitar-cotacao$/);
  await expect(page.getByLabel("Seguro de interesse *")).toHaveValue("auto");
  await expect(page.getByLabel("Nome completo *")).toBeInViewport();
  await expect
    .poll(async () => {
      const heading = await page
        .getByRole("heading", { name: "Solicite sua cotação" })
        .boundingBox();
      const header = await page.getByRole("banner").boundingBox();
      return Boolean(heading && header && heading.y >= header.y + header.height);
    })
    .toBe(true);
});

test("entrada pela modalidade continua chegando ao formulário com contexto", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/seguros/auto");
  await page.getByRole("link", { name: "Solicitar cotação", exact: true }).first().click();
  await expect(page).toHaveURL(/\/contato\?seguro=auto#solicitar-cotacao$/);
  await expect(page.getByLabel("Seguro de interesse *")).toHaveValue("auto");
  await expect(page.getByLabel("Nome completo *")).toBeInViewport();
});

test("pré-seleciona uma modalidade válida sem aceitar valores desconhecidos", async ({ page }) => {
  await page.goto("/contato?seguro=residencial#solicitar-cotacao");
  await expect(page.getByLabel("Seguro de interesse *")).toHaveValue("residencial");

  await page.goto("/contato?seguro=inexistente#solicitar-cotacao");
  await expect(page.getByLabel("Seguro de interesse *")).toHaveValue("");
});
