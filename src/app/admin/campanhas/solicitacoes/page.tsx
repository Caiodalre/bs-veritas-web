import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Container } from "@/components/layout/container";
import { QuoteRequestAdmin } from "@/features/quote-admin/components/quote-request-admin";

export const metadata: Metadata = {
  title: "Solicitações de cotação",
  robots: { index: false, follow: false },
};

export default function QuoteRequestAdminPage() {
  return (
    <div className="min-h-screen bg-aqua-50">
      <header className="border-b border-white/10 bg-navy-950 text-white">
        <Container className="flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
          <Wordmark inverted />
          <nav
            aria-label="Navegação administrativa"
            className="flex flex-wrap gap-4 text-sm font-semibold"
          >
            <Link
              className="text-aqua-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-300"
              href="/admin/campanhas"
            >
              Campanhas
            </Link>
            <Link
              className="text-aqua-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-300"
              href="/"
            >
              Ver site
            </Link>
          </nav>
        </Container>
      </header>
      <main className="py-12 sm:py-16" id="conteudo">
        <Container>
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
              Área protegida
            </p>
            <h1 className="mt-4 font-serif text-3xl font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
              Solicitações de cotação
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Organize o atendimento dos pedidos recebidos sem expor informações pessoais no site
              público.
            </p>
          </div>
          <QuoteRequestAdmin />
        </Container>
      </main>
    </div>
  );
}
