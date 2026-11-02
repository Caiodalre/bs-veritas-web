import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 },
] as const;

for (const viewport of viewports) {
  test(`aviso de risco aparece antes do atendimento em ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/sinistros");
    await page.evaluate(() => document.fonts.ready);

    const warning = page.getByRole("complementary", { name: "Há risco imediato?" });
    const support = page.getByRole("link", { name: "Pedir apoio da corretora" });
    await expect(warning).toBeInViewport({ ratio: 1 });
    await expect(warning).toContainText("Este site não é um canal de emergência");

    const warningBox = await warning.boundingBox();
    const supportBox = await support.boundingBox();
    expect(warningBox).not.toBeNull();
    expect(supportBox).not.toBeNull();
    expect(warningBox!.y + warningBox!.height).toBeLessThan(supportBox!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );

    await page.screenshot({ fullPage: true, path: `test-results/claims-${viewport.width}.png` });
  });
}

test("atalho por teclado leva à sequência de quatro passos sem cobrir o título", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sinistros");
  await page.getByRole("link", { name: "Ver próximos passos" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/sinistros#primeiros-passos$/);

  const steps = page.getByRole("region", { name: "Próximos passos com a seguradora" });
  await expect(steps.getByRole("listitem")).toHaveCount(4);
  await expect(
    steps.getByRole("heading", { name: "Localize o canal da seguradora" }),
  ).toBeInViewport();
  await expect
    .poll(async () => {
      const heading = await steps.getByRole("heading", { level: 2 }).boundingBox();
      const header = await page.getByRole("banner").boundingBox();
      return Boolean(heading && header && heading.y >= header.y + header.height);
    })
    .toBe(true);
});

test("mantém os limites do atendimento, a privacidade e os destinos oficiais", async ({ page }) => {
  await page.goto("/sinistros");
  await expect(
    page.getByText(/O contato com a corretora não substitui o aviso de sinistro/),
  ).toBeVisible();
  await expect(
    page.getByText(
      /A análise de cobertura, a regulação e uma eventual indenização cabem à seguradora/,
    ),
  ).toBeVisible();
  await expect(
    page.getByText(/salvo medidas urgentes e seguras para evitar agravamento/),
  ).toBeVisible();
  await expect(page.getByText(/Os documentos e prazos variam conforme o produto/)).toBeVisible();
  await expect(page.getByText(/Não envie CPF, RG, dados bancários/)).toBeVisible();

  const support = page.getByRole("link", { name: "Pedir apoio da corretora" });
  const href = await support.getAttribute("href");
  expect(href).not.toBeNull();
  const destination = new URL(href!);
  expect(destination.origin).toBe("https://wa.me");
  expect(destination.pathname).toBe("/5511925065022");
  expect(destination.searchParams.get("text")).toContain("orientação inicial sobre um sinistro");
  await expect(support).toHaveAttribute("rel", "noopener noreferrer");
  await expect(
    page.getByRole("link", { name: "Falar com a corretora", exact: true }),
  ).toHaveAttribute("href", href!);
  await expect(page.getByRole("link", { name: "Outros canais", exact: true })).toHaveAttribute(
    "href",
    "/contato",
  );
});
