import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Wordmark } from "./wordmark";

describe("Wordmark", () => {
  it("inclui todo o texto visível no nome acessível do link", () => {
    render(<Wordmark />);

    expect(
      screen.getByRole("link", {
        name: /B&S Veritas\s*CORRETORA DE SEGUROS/i,
      }),
    ).toHaveAttribute("href", "/#inicio");
  });
});
