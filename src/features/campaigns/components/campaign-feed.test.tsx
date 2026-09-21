/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CampaignFeed } from "./campaign-feed";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CampaignFeed", () => {
  it("carrega as campanhas publicadas pela API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          campaigns: [
            {
              id: "campanha-publicada",
              partnerSlug: "icatu",
              title: "Campanha oficial carregada",
              summary: "Resumo oficial retornado pela API de campanhas.",
              imageSrc: "/api/campaign-images/campanha-publicada",
              imageAlt: "Peça oficial da campanha",
              ctaLabel: "Saiba mais",
              href: "/contato",
            },
          ],
        }),
      ),
    );

    render(<CampaignFeed />);
    expect(screen.getByRole("status", { name: "Carregando campanhas" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Campanha oficial carregada")).toBeInTheDocument());
  });

  it("informa falha sem exibir conteúdo inventado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 })),
    );
    render(<CampaignFeed />);

    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          name: "Não foi possível carregar as campanhas agora",
        }),
      ).toBeInTheDocument(),
    );
  });
});
