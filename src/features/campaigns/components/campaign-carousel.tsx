"use client";

import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import type { PartnerCampaign } from "@/features/campaigns/catalog";
import { partnerCatalog } from "@/features/partners/catalog";
import { cn } from "@/lib/cn";

type CampaignCarouselProps = {
  campaigns: readonly PartnerCampaign[];
  loadFailed?: boolean;
};

export function CampaignCarousel({ campaigns, loadFailed = false }: CampaignCarouselProps) {
  const carouselId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (campaigns.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-aqua-300 bg-white px-6 py-10 text-center shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
          <Megaphone aria-hidden="true" size={23} />
        </span>
        <h3 className="mt-5 font-serif text-xl font-bold text-navy-950">
          {loadFailed
            ? "Não foi possível carregar as campanhas agora"
            : "Nenhuma campanha publicada no momento"}
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
          {loadFailed
            ? "Atualize a página em alguns instantes ou fale com a corretora pelos canais oficiais."
            : "Novos avisos e condições das seguradoras parceiras serão apresentados aqui somente após a confirmação das informações oficiais."}
        </p>
        <Link
          className={buttonStyles({ className: "mt-6", variant: "outlineLight" })}
          href="/contato"
        >
          Falar com a corretora
        </Link>
      </div>
    );
  }

  function goToCampaign(index: number) {
    const nextIndex = Math.min(Math.max(index, 0), campaigns.length - 1);
    const scroller = scrollerRef.current;
    const item = scroller?.children.item(nextIndex) as HTMLElement | null;

    setActiveIndex(nextIndex);

    if (scroller && item && typeof scroller.scrollTo === "function") {
      scroller.scrollTo({
        behavior: "smooth",
        left: item.offsetLeft - scroller.offsetLeft,
      });
    }
  }

  function updateActiveCampaign() {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const items = Array.from(scroller.children) as HTMLElement[];
    const closestIndex = items.reduce((closest, item, index) => {
      const closestDistance = Math.abs(items[closest].offsetLeft - scroller.scrollLeft);
      const currentDistance = Math.abs(item.offsetLeft - scroller.scrollLeft);
      return currentDistance < closestDistance ? index : closest;
    }, 0);

    setActiveIndex(closestIndex);
  }

  return (
    <div>
      {campaigns.length > 1 ? (
        <div className="mb-5 flex items-center justify-between gap-4">
          <p aria-live="polite" className="text-sm font-semibold text-slate-600">
            {activeIndex + 1} de {campaigns.length}
          </p>
          <div className="hidden gap-2 sm:flex">
            <button
              aria-controls={carouselId}
              aria-label="Ver campanha anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-aqua-200 bg-white text-navy-950 transition hover:border-aqua-600 hover:bg-aqua-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-aqua-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={activeIndex === 0}
              onClick={() => goToCampaign(activeIndex - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={20} />
            </button>
            <button
              aria-controls={carouselId}
              aria-label="Ver próxima campanha"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-aqua-200 bg-white text-navy-950 transition hover:border-aqua-600 hover:bg-aqua-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-aqua-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={activeIndex === campaigns.length - 1}
              onClick={() => goToCampaign(activeIndex + 1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={20} />
            </button>
          </div>
        </div>
      ) : null}

      <div
        aria-label="Campanhas das seguradoras parceiras"
        aria-roledescription="carrossel"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-5 focus-visible:rounded-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-aqua-700 focus-visible:ring-offset-4 sm:gap-6 lg:gap-8"
        id={carouselId}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goToCampaign(activeIndex - 1);
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            goToCampaign(activeIndex + 1);
          }
        }}
        onScroll={updateActiveCampaign}
        ref={scrollerRef}
        role="region"
        tabIndex={0}
      >
        {campaigns.map((campaign, index) => {
          const partner = partnerCatalog.find(({ slug }) => slug === campaign.partnerSlug);
          const externalLink = /^https?:\/\//.test(campaign.href);

          if (!partner) {
            return null;
          }

          return (
            <article
              aria-label={`${index + 1} de ${campaigns.length}: ${campaign.title}`}
              aria-roledescription="slide"
              className="group flex w-[84vw] max-w-[24rem] flex-none snap-center flex-col overflow-hidden rounded-3xl border border-aqua-200 bg-white shadow-[0_18px_55px_rgba(7,24,39,0.12)] sm:w-[24rem] lg:grid lg:w-full lg:max-w-none lg:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]"
              key={campaign.id}
              role="group"
            >
              <div className="flex min-h-16 items-center justify-between gap-4 border-b border-aqua-100 px-5 py-3 lg:col-span-2 lg:px-8">
                <span className="rounded-full bg-aqua-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-navy-950">
                  Campanha
                </span>
                <span className="flex min-h-10 min-w-24 items-center justify-center rounded-lg bg-white px-3 py-2 shadow-sm">
                  <Image
                    alt={`Logotipo ${partner.name}`}
                    className="h-6 w-auto max-w-28 object-contain"
                    height={partner.logoHeight}
                    src={partner.logoSrc}
                    unoptimized
                    width={partner.logoWidth}
                  />
                </span>
              </div>

              <div className="relative aspect-[2/3] w-full bg-white lg:col-start-1 lg:row-start-2">
                <Image
                  alt={campaign.imageAlt}
                  className="object-contain"
                  fill
                  sizes="(max-width: 639px) 84vw, 384px"
                  src={campaign.imageSrc}
                  unoptimized
                />
              </div>

              <div className="flex flex-1 flex-col border-t border-aqua-100 p-6 lg:col-start-2 lg:row-start-2 lg:justify-center lg:border-t-0 lg:border-l lg:p-10 xl:p-14">
                <h3 className="font-serif text-xl leading-tight font-bold text-navy-950 text-balance lg:max-w-2xl lg:text-3xl">
                  {campaign.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 lg:mt-5 lg:max-w-2xl lg:text-base lg:leading-8">
                  {campaign.summary}
                </p>
                {campaign.conditions ? (
                  <p className="mt-3 text-xs leading-5 text-slate-500 lg:max-w-2xl lg:text-sm lg:leading-6">
                    {campaign.conditions}
                  </p>
                ) : null}
                <div className="mt-auto pt-5 lg:mt-8 lg:max-w-sm lg:pt-0">
                  <a
                    className={buttonStyles({ className: "w-full", size: "sm" })}
                    href={campaign.href}
                    rel={externalLink ? "noopener noreferrer" : undefined}
                    target={externalLink ? "_blank" : undefined}
                  >
                    {campaign.ctaLabel}
                    <ChevronRight aria-hidden="true" size={17} />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {campaigns.length > 1 ? (
        <nav aria-label="Selecionar campanha" className="mt-2 flex justify-center gap-2">
          {campaigns.map((campaign, index) => (
            <button
              aria-controls={carouselId}
              aria-current={index === activeIndex ? "true" : undefined}
              aria-label={`Mostrar campanha ${index + 1}: ${campaign.title}`}
              className={cn(
                "h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-aqua-700 focus-visible:ring-offset-2",
                index === activeIndex ? "w-8 bg-aqua-700" : "w-2.5 bg-aqua-200 hover:bg-aqua-500",
              )}
              key={campaign.id}
              onClick={() => goToCampaign(index)}
              type="button"
            />
          ))}
        </nav>
      ) : null}
    </div>
  );
}
