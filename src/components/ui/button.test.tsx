import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, buttonStyles } from "./button";

describe("Button", () => {
  it("usa o tipo button por padrão", () => {
    render(<Button>Continuar</Button>);

    expect(screen.getByRole("button", { name: "Continuar" })).toHaveAttribute("type", "button");
  });

  it("mescla classes sem manter utilitários conflitantes", () => {
    const classes = buttonStyles({ className: "px-8", size: "sm" });

    expect(classes).toContain("px-8");
    expect(classes).not.toContain("px-4");
  });

  it("distingue contornos para fundos claros e escuros", () => {
    const onLight = buttonStyles({ variant: "outlineLight" });
    const onDark = buttonStyles({ variant: "outlineDark" });

    expect(onLight).toContain("text-navy-950");
    expect(onLight).toContain("bg-white");
    expect(onDark).toContain("text-white");
    expect(onDark).toContain("hover:bg-white/10");
  });
});
