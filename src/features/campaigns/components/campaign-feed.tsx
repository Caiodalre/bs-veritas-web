"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/container";
import type { PartnerCampaign } from "@/features/campaigns/catalog";
import { CampaignCarousel } from "@/features/campaigns/components/campaign-carousel";

type CampaignFeedState =
  | { status: "loading"; campaigns: readonly PartnerCampaign[] }
  | { status: "ready"; campaigns: readonly PartnerCampaign[] }
  | { status: "error"; campaigns: readonly PartnerCampaign[] };

export function CampaignFeed() {
  const [state, setState] = useState<CampaignFeedState>({ status: "loading", campaigns: [] });

  useEffect(() => {
    const controller = new AbortController();

    async function loadCampaigns() {
      try {
        const response = await fetch("/api/campaigns", {
          headers: { accept: "application/json" },
          signal: controller.signal,
        });

        if (response.status === 404) {
          setState({ status: "ready", campaigns: [] });
          return;
        }

        if (!response.ok) {
          throw new Error("campaign_feed_unavailable");
        }

        const payload = (await response.json()) as { campaigns?: unknown };
        const campaigns = Array.isArray(payload.campaigns)
          ? (payload.campaigns as PartnerCampaign[])
          : [];
        setState({ status: "ready", campaigns });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({ status: "error", campaigns: [] });
      }
    }

    void loadCampaigns();
    return () => controller.abort();
  }, []);

  if (state.status === "loading" || (state.status === "ready" && state.campaigns.length === 0)) {
    return null;
  }

  return (
    <section
      className="scroll-mt-24 border-y border-border bg-aqua-50 py-20 sm:py-24"
      id="campanhas"
    >
      <Container>
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
              Avisos e campanhas
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
              Novidades das seguradoras parceiras
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Acompanhe ações vigentes, benefícios e informações importantes. Condições,
              disponibilidade e elegibilidade são sempre apresentadas conforme a comunicação oficial
              de cada seguradora.
            </p>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-500">
            Confira as publicações e consulte as condições apresentadas em cada campanha.
          </p>
        </div>

        <CampaignCarousel campaigns={state.campaigns} loadFailed={state.status === "error"} />
      </Container>
    </section>
  );
}
