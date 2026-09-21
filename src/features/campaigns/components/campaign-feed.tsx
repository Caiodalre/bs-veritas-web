"use client";

import { useEffect, useState } from "react";
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

  if (state.status === "loading") {
    return (
      <div
        aria-label="Carregando campanhas"
        className="grid min-h-64 place-items-center rounded-2xl border border-aqua-200 bg-white"
        role="status"
      >
        <p className="text-sm font-semibold text-slate-600">Carregando campanhas…</p>
      </div>
    );
  }

  return <CampaignCarousel campaigns={state.campaigns} loadFailed={state.status === "error"} />;
}
