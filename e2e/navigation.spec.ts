import { expect, test } from "@playwright/test";
import { mainNavigation } from "../src/config/site";
import { insuranceCatalog } from "../src/features/insurance/catalog";

for (const width of [320, 390, 768, 1440]) {
  test(`menu identifica a página e a seção atual em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const mobile = width < 1024;
    const nav = page.getByRole("navigation", {
      name: mobile ? "Navegação móvel" : "Navegação principal",
      exact: true,
    });
    const cases = [
      ...mainNavigation.map((item) => ({
        route: item.href,
        label: item.label,
        current: "page",
      })),
      ...insuranceCatalog.map((item) => ({
        route: `/seguros/${item.slug}`,
        label: "Seguros",
        current: "location",
      })),
      { route: "/politica-de-privacidade", label: "", current: "" },
    ];

    for (const entry of cases) {
      await page.goto(entry.route);
      if (mobile) await page.locator("header summary").click();
      await expect(nav).toBeVisible();
      await expect(nav.locator("[aria-current]")).toHaveCount(entry.label ? 1 : 0);
      if (entry.label) {
        await expect(nav.getByRole("link", { name: entry.label, exact: true })).toHaveAttribute(
          "aria-current",
          entry.current,
        );
      }
      for (const item of mainNavigation) {
        await expect(nav.getByRole("link", { name: item.label, exact: true })).toHaveCSS(
          "border-bottom-color",
          item.label === entry.label ? "rgb(118, 230, 218)" : "rgba(0, 0, 0, 0)",
        );
        await expect(nav.getByRole("link", { name: item.label, exact: true })).toHaveAttribute(
          "href",
          item.href,
        );
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      );
    }
  });
}

for (const width of [390, 1440]) {
  test(`destaque acompanha a navegação por teclado em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    if (width < 1024) {
      await page.locator("header summary").focus();
      await page.keyboard.press("Enter");
    }
    const nav = page.getByRole("navigation", {
      name: width < 1024 ? "Navegação móvel" : "Navegação principal",
      exact: true,
    });
    await nav.getByRole("link", { name: "Sobre", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/sobre$/);
    if (width < 1024 && !(await nav.isVisible())) {
      await page.locator("header summary").focus();
      await page.keyboard.press("Enter");
    }
    await expect(nav.getByRole("link", { name: "Sobre", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(nav.getByRole("link", { name: "Início", exact: true })).not.toHaveAttribute(
      "aria-current",
    );
  });
}
