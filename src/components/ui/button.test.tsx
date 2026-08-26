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
});
