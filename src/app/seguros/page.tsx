import type { Metadata } from "next";
import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { insuranceCatalog } from "@/features/insurance/catalog";
import { InsuranceIcon } from "@/features/insurance/components/insurance-icon";
import { createWhatsAppHref, whatsappMessages } from "@/features/contact/whatsapp";

export const metadata: Metadata = {
  title: "Seguros",
  description:
    "Conheça as modalidades de seguros atendidas pela B&S Veritas e entenda os pontos considerados em uma análise consultiva.",
  alternates: {
    canonical: "/seguros",
  },
};

export default function InsuranceCatalogPage() {
  return (
    <SiteShell>
      <section className="bg-navy-950 py-8 text-white sm:py-12">
        <Container>
          <nav aria-label="Navegação estrutural" className="text-sm text-slate-300">
            <Link className="hover:text-aqua-200" href="/">
              Início
            </Link>
            <span aria-hidden="true" className="px-2 text-slate-500">
              /
            </span>
            <span aria-current="page">Seguros</span>
          </nav>
          <h1 className="mt-6 max-w-4xl font-serif text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
            Qual seguro faz sentido para você?
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            Compare o foco das seis modalidades e veja o que considerar em cada uma. Os detalhes
            ajudam a preparar a conversa, sem substituir a análise da proposta.
          </p>
          <a
            className={buttonStyles({ className: "mt-8", size: "lg" })}
            href={createWhatsAppHref(whatsappMessages.generalQuote)}
            rel="noopener noreferrer"
            target="_blank"
          >
            Pedir orientação no WhatsApp
            <MessageCircle aria-hidden="true" size={18} />
          </a>
        </Container>
      </section>

      <section aria-label="Guia de modalidades" className="py-10 sm:py-12">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {insuranceCatalog.map((insurance) => (
              <article
                className="flex flex-col rounded-xl border border-border bg-white p-5 sm:p-6"
                key={insurance.slug}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aqua-100 text-aqua-700">
                    <InsuranceIcon name={insurance.icon} />
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-navy-950">{insurance.name}</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{insurance.description}</p>
                <div className="mt-4 flex-1 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-navy-950">Ponto de partida</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {insurance.practicalQuestions[0]}
                  </p>
                </div>
                <Link
                  aria-label={"Conhecer " + insurance.name}
                  className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-md font-semibold text-aqua-700 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700"
                  href={"/seguros/" + insurance.slug}
                >
                  Conhecer detalhes
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy-900 py-10 text-white sm:py-12">
        <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl font-bold">Ainda não sabe por onde começar?</h2>
            <p className="mt-4 leading-8 text-slate-300">
              Informe qual bem, pessoa ou atividade deseja proteger. A equipe ajuda a identificar a
              modalidade e os pontos que merecem comparação.
            </p>
          </div>
          <Link className={buttonStyles({ size: "lg" })} href="/contato">
            Ver todos os canais
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </Container>
      </section>
    </SiteShell>
  );
}
