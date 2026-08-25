import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function TestStatus() {
  return <p>Vitest configurado</p>;
}

describe("ambiente de testes", () => {
  it("renderiza um componente React no jsdom", () => {
    render(<TestStatus />);

    expect(screen.getByText("Vitest configurado")).toBeInTheDocument();
  });
});
