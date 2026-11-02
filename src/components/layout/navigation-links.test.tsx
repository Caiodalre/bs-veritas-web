import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavigationLinks } from "./navigation-links";

const route = vi.hoisted(() => ({ pathname: "/" as string | null }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

describe.each([false, true])("menu mobile=%s", (mobile) => {
  it.each([
    ["/", "Início", "page"],
    ["/sobre", "Sobre", "page"],
    ["/seguros", "Seguros", "page"],
    ["/seguros/auto", "Seguros", "location"],
    ["/sinistros", "Sinistros", "page"],
    ["/contato", "Contato", "page"],
  ])("marca %s sem selecionar os outros itens", (pathname, label, current) => {
    route.pathname = pathname;
    const { container } = render(<NavigationLinks mobile={mobile} />);
    expect(container.querySelectorAll("[aria-current]")).toHaveLength(1);
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", current);
  });

  it.each(["/politica-de-privacidade", "/seguros-inexistentes", null])(
    "não marca itens para %s",
    (pathname) => {
      route.pathname = pathname;
      const { container } = render(<NavigationLinks mobile={mobile} />);
      expect(container.querySelectorAll("[aria-current]")).toHaveLength(0);
    },
  );

  it("atualiza a indicação quando a rota muda", () => {
    route.pathname = "/";
    const { rerender } = render(<NavigationLinks mobile={mobile} />);
    route.pathname = "/contato";
    rerender(<NavigationLinks mobile={mobile} />);
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Contato" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute("href", "/#inicio");
  });
});
