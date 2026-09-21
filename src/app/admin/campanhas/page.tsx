import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Container } from "@/components/layout/container";
import { CampaignAdmin } from "@/features/campaigns/components/campaign-admin";

export const metadata: Metadata = {
  title: "Administrar campanhas",
  robots: { index: false, follow: false },
};

export default function CampaignAdminPage() {
  return (
    <div className="min-h-screen bg-aqua-50">
      <header className="border-b border-white/10 bg-navy-950 text-white">
        <Container className="flex min-h-20 items-center justify-between gap-4">
          <Wordmark inverted />
          <Link
            className="text-sm font-semibold text-aqua-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-300"
            href="/"
          >
            Ver site
          </Link>
        </Container>
      </header>
      <main className="py-12 sm:py-16" id="conteudo">
        <Container>
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
              Área protegida
            </p>
            <h1 className="mt-4 font-serif text-3xl font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
              Campanhas das seguradoras
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Envie as peças recebidas, revise o conteúdo e controle o que aparece no carrossel
              público.
            </p>
          </div>
          <CampaignAdmin />
        </Container>
      </main>
    </div>
  );
}
