import { expect, test } from "@playwright/test";
import { insuranceCatalog } from "../src/features/insurance/catalog";

function channelValue(value: number) {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function contrastRatio(foreground: string, background: string) {
  const parse = (color: string) => {
    const channels = color
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number);
    if (!channels || channels.length !== 3) throw new Error(`Cor não reconhecida: ${color}`);
    return channels;
  };
  const luminance = (color: string) => {
    const [red, green, blue] = parse(color).map(channelValue);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

test("exibe a pagina inicial", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/B&S Veritas/);
  await expect(
    page.getByRole("link", { name: "Fale conosco por e-mail ou telefone" }),
  ).toHaveAttribute("href", "/contato");
  await expect(
    page.getByRole("heading", { level: 1, name: "Proteção para o que realmente importa." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Pedir cotação no WhatsApp" })).toHaveAttribute(
    "href",
    /https:\/\/wa\.me\/\d+\?text=.+/,
  );

  const partnerCarousel = page.getByRole("region", {
    name: "Seguradoras e plataformas parceiras",
  });

  await expect(partnerCarousel).toBeVisible();
  await expect(page.getByRole("img", { name: "Logotipo Porto Seguro" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Logotipo Petlove" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Logotipo Icatu" })).toBeVisible();

  await page.getByRole("link", { name: "Ver modalidades" }).click();
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
    await expect(
      page.getByRole("heading", { name: "O que vale esclarecer antes de contratar" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Cotar pelo WhatsApp" })).toHaveAttribute(
      "href",
      /https:\/\/wa\.me\/\d+\?text=.+/,
    );
    await expect(page.getByRole("link", { name: "Consultar orientação da SUSEP" })).toHaveAttribute(
      "href",
      /^https:\/\/www\.gov\.br\/susep\//,
    );
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
  await expect(page.getByText("Alexandre Marcelo Baez")).toBeVisible();
  await expect(page.getByText("Responsável pela cotação")).toBeVisible();
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
  await expect(page.getByRole("link", { name: "Pedir apoio da corretora" })).toHaveAttribute(
    "href",
    /https:\/\/wa\.me\/\d+\?text=.+/,
  );
});

test("publica os canais oficiais de contato sem formulario", async ({ page }) => {
  await page.goto("/contato");

  await expect(
    page.getByRole("heading", { level: 1, name: "Fale com a B&S Veritas" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Conversar pelo WhatsApp" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Conversar pelo WhatsApp" }).first()).toHaveAttribute(
    "href",
    /https:\/\/wa\.me\/\d+\?text=.+/,
  );
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

test("mantém contraste, hover e foco nos botões sobre fundo claro e escuro", async ({ page }) => {
  await page.goto("/contato");
  const lightButton = page.getByRole("link", { name: "Ligar agora" });

  const lightColors = await lightButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, foreground: style.color };
  });
  expect(contrastRatio(lightColors.foreground, lightColors.background)).toBeGreaterThanOrEqual(4.5);

  await lightButton.hover();
  const lightHoverColors = await lightButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, foreground: style.color };
  });
  expect(
    contrastRatio(lightHoverColors.foreground, lightHoverColors.background),
  ).toBeGreaterThanOrEqual(4.5);

  await lightButton.focus();
  await expect(lightButton).toBeFocused();
  expect(await lightButton.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
    "none",
  );

  await page.goto("/");
  const darkButton = page.getByRole("link", { name: "Ver modalidades" });
  const darkColors = await darkButton.evaluate((element) => {
    const style = getComputedStyle(element);
    const parentBackground = getComputedStyle(
      element.closest("section") ?? element,
    ).backgroundColor;
    return { background: parentBackground, foreground: style.color };
  });
  expect(contrastRatio(darkColors.foreground, darkColors.background)).toBeGreaterThanOrEqual(4.5);

  await darkButton.focus();
  await expect(darkButton).toBeFocused();
  expect(await darkButton.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
    "none",
  );
});

test("não envia mensagens ao verificar os destinos externos", async ({ page }) => {
  await page.goto("/seguros/auto");

  const whatsappHref = await page
    .getByRole("link", { name: "Cotar pelo WhatsApp" })
    .getAttribute("href");
  expect(whatsappHref).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  expect(whatsappHref).not.toContain("send=");
  await expect(page.getByRole("link", { name: "Consultar orientação da SUSEP" })).toHaveAttribute(
    "target",
    "_blank",
  );
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

test("publica a politica de cookies e o inventario atual", async ({ page }) => {
  await page.goto("/politica-de-cookies");

  await expect(
    page.getByRole("heading", { level: 1, name: "Como este site utiliza cookies" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "2. Inventário atual" })).toBeVisible();
  await expect(page.getByText("Não utilizada")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "Falar sobre cookies" })).toHaveAttribute(
    "href",
    "mailto:contato@bsveritas.com.br?subject=Cookies",
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
  expect(body).toContain("<loc>https://bsveritas.com.br/politica-de-cookies</loc>");
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
    await page.locator("summary").click();
    await expect(page.getByRole("link", { name: "Conversar pelo WhatsApp" }).first()).toBeVisible();

    const partnerCarousel = page.getByRole("region", {
      name: "Seguradoras e plataformas parceiras",
    });

    await page.getByRole("link", { name: "Icatu", exact: true }).click();
    await expect
      .poll(() => partnerCarousel.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);

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
      "/politica-de-cookies",
      "/termos-de-uso",
    ]) {
      await page.goto(path);
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      const routeHasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );

      expect(routeHasHorizontalOverflow).toBe(false);
    }
  });
});

test("valida páginas principais em 360, 390, 768 e 1440 pixels", async ({ browser }) => {
  for (const width of [360, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });

    for (const path of ["/", "/contato", "/seguros", "/seguros/auto", "/sinistros", "/sobre"]) {
      const response = await page.goto(path);
      expect(response?.ok(), `${path} em ${width}px`).toBe(true);
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        ),
        `${path} com overflow em ${width}px`,
      ).toBe(false);
    }

    if (width < 1024) {
      await page.goto("/");
      await page.locator("summary").focus();
      await expect(page.locator("summary")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("navigation", { name: "Navegação móvel" })).toBeVisible();
    }

    await page.close();
  }
});
