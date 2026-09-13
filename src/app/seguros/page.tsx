import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
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

const guidanceSteps = [
  {
    title: "Entendimento",
    text: "A conversa começa pela sua realidade, prioridades e dúvidas.",
  },
  {
    title: "Comparação",
    text: "As condições relevantes são organizadas para facilitar a avaliação.",
  },
  {
    title: "Acompanhamento",
    text: "A orientação continua durante a contratação e nos próximos ciclos.",
  },
] as const;

export default function InsuranceCatalogPage() {
  return (
    <SiteShell>
      <section className="bg-navy-950 py-16 text-white sm:py-20">
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
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
            Soluções de proteção
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
            Uma escolha orientada pela sua necessidade
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Conheça as modalidades atendidas e os principais pontos que ajudam a construir uma
            decisão clara, sem tratar seguro como uma solução pronta para todos.
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

      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {insuranceCatalog.map((insurance) => (
              <article
                className="group flex flex-col rounded-2xl border border-border bg-white p-7 shadow-[0_14px_45px_rgba(7,24,39,0.055)] transition duration-200 hover:-translate-y-1 hover:border-aqua-400"
                key={insurance.slug}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700 transition-colors group-hover:bg-aqua-300 group-hover:text-navy-950">
                  <InsuranceIcon name={insurance.icon} />
                </div>
                <h2 className="mt-6 font-serif text-2xl font-bold text-navy-950">
                  {insurance.name}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                  {insurance.description}
                </p>
                <Link
                  aria-label={"Conhecer " + insurance.name}
                  className="mt-6 inline-flex items-center gap-2 font-semibold text-aqua-700 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500"
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

      <section className="bg-aqua-50 py-20 sm:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
              Atendimento consultivo
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
              Como a orientação acontece
            </h2>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {guidanceSteps.map((step, index) => (
              <li className="rounded-xl border border-aqua-200 bg-white p-6" key={step.title}>
                <CheckCircle2 aria-hidden="true" className="text-aqua-700" size={24} />
                <p className="mt-5 text-xs font-bold tracking-[0.18em] text-aqua-700">
                  0{index + 1}
                </p>
                <h3 className="mt-2 font-serif text-xl font-bold text-navy-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-navy-900 py-16 text-white sm:py-20">
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
