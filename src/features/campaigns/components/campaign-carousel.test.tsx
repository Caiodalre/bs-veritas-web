/** @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PartnerCampaign } from "@/features/campaigns/catalog";
import { CampaignCarousel } from "./campaign-carousel";

const campaigns: readonly PartnerCampaign[] = [
  {
    id: "campanha-um",
    partnerSlug: "porto-seguro",
    title: "Campanha de teste um",
    summary: "Conteúdo fictício usado somente no teste automatizado.",
    imageSrc: "/file.svg",
    imageAlt: "Imagem fictícia da primeira campanha",
    ctaLabel: "Conhecer campanha",
    href: "/contato",
  },
  {
    id: "campanha-dois",
    partnerSlug: "petlove",
    title: "Campanha de teste dois",
    summary: "Segundo conteúdo fictício usado somente no teste automatizado.",
    imageSrc: "/file.svg",
    imageAlt: "Imagem fictícia da segunda campanha",
    ctaLabel: "Consultar condições",
    href: "https://example.invalid/campanha",
    conditions: "Condições fictícias para o teste.",
  },
];

describe("CampaignCarousel", () => {
  it("exibe um estado vazio sem inventar campanhas", () => {
    render(<CampaignCarousel campaigns={[]} />);

    expect(
      screen.getByRole("heading", { name: "Nenhuma campanha publicada no momento" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Falar com a corretora" })).toHaveAttribute(
      "href",
      "/contato",
    );
    expect(screen.queryByRole("region", { name: /campanhas das seguradoras/i })).toBeNull();
  });

  it("renderiza campanhas, controles e condições fornecidas", () => {
    render(<CampaignCarousel campaigns={campaigns} />);

    expect(
      screen.getByRole("region", { name: "Campanhas das seguradoras parceiras" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(screen.getByText("Condições fictícias para o teste.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Consultar condições" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("avança por botão e teclado sem reprodução automática", () => {
    render(<CampaignCarousel campaigns={campaigns} />);

    const region = screen.getByRole("region", { name: "Campanhas das seguradoras parceiras" });
    const nextButton = screen.getByRole("button", { name: "Ver próxima campanha" });

    expect(screen.getByText("1 de 2")).toBeInTheDocument();
    fireEvent.click(nextButton);
    expect(screen.getByText("2 de 2")).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(screen.getByText("1 de 2")).toBeInTheDocument();
  });
});
