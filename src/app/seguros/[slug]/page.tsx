import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Info,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { getInsuranceBySlug, insuranceCatalog } from "@/features/insurance/catalog";
import { InsuranceIcon } from "@/features/insurance/components/insurance-icon";
import { createWhatsAppHref } from "@/features/contact/whatsapp";

type InsurancePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return insuranceCatalog.map((insurance) => ({ slug: insurance.slug }));
}

export async function generateMetadata({ params }: InsurancePageProps): Promise<Metadata> {
  const { slug } = await params;
  const insurance = getInsuranceBySlug(slug);

  if (!insurance) {
    return { title: "Seguro não encontrado" };
  }

  return {
    title: insurance.name,
    description: insurance.description,
    alternates: {
      canonical: "/seguros/" + insurance.slug,
    },
  };
}

export default async function InsurancePage({ params }: InsurancePageProps) {
  const { slug } = await params;
  const insurance = getInsuranceBySlug(slug);

  if (!insurance) {
    notFound();
  }

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
            <Link className="hover:text-aqua-200" href="/seguros">
              Seguros
            </Link>
            <span aria-hidden="true" className="px-2 text-slate-500">
              /
            </span>
            <span aria-current="page">{insurance.shortName}</span>
          </nav>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-aqua-300 text-navy-950">
                <InsuranceIcon name={insurance.icon} size={29} />
              </div>
              <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
                Proteção com orientação
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
                {insurance.name}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {insurance.introduction}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                className={buttonStyles({ size: "lg" })}
                href={`/contato?seguro=${insurance.slug}#solicitar-cotacao`}
              >
                Solicitar cotação
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <a
                className={buttonStyles({ size: "lg", variant: "outlineDark" })}
                href={createWhatsAppHref(insurance.whatsappMessage)}
                rel="noopener noreferrer"
                target="_blank"
              >
                Cotar pelo WhatsApp
                <MessageCircle aria-hidden="true" size={18} />
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
              Para quem pode fazer sentido
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-[-0.025em] text-navy-950">
              Contextos considerados no atendimento
            </h2>
            <ul className="mt-8 space-y-4">
              {insurance.audiences.map((audience) => (
                <li className="flex gap-3 text-slate-600" key={audience}>
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-aqua-700"
                    size={21}
                  />
                  <span className="leading-7">{audience}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-white p-7 shadow-[0_14px_45px_rgba(7,24,39,0.055)] sm:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
              Análise consultiva
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-[-0.025em] text-navy-950">
              O que merece atenção
            </h2>
            <ul className="mt-8 divide-y divide-border">
              {insurance.analysisPoints.map((point, index) => (
                <li className="flex gap-4 py-4 first:pt-0 last:pb-0" key={point}>
                  <span className="font-serif text-lg font-bold text-aqua-700">0{index + 1}</span>
                  <span className="leading-7 text-slate-600">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-20 text-white sm:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
              Prepare a conversa
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
              Perguntas práticas para começar
            </h2>
            <p className="mt-5 leading-8 text-slate-300">
              Você não precisa enviar documentos no primeiro contato. Estas perguntas ajudam a
              organizar a necessidade antes de comparar propostas.
            </p>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {insurance.practicalQuestions.map((question, index) => (
              <li className="rounded-xl border border-white/10 bg-white/[0.045] p-6" key={question}>
                <span className="text-sm font-bold tracking-[0.18em] text-aqua-300">
                  0{index + 1}
                </span>
                <p className="mt-4 leading-7 text-slate-100">{question}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-y border-aqua-200 bg-aqua-50 py-16 sm:py-20">
        <Container>
          <div className="flex gap-4 rounded-xl border border-aqua-200 bg-white p-6 sm:p-8">
            <Info aria-hidden="true" className="mt-1 shrink-0 text-aqua-700" size={24} />
            <div>
              <h2 className="font-serif text-xl font-bold text-navy-950">
                Informações importantes
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                Coberturas, limites, franquias, carências, assistências e exclusões variam conforme
                o produto e a seguradora. A contratação depende da proposta, das condições
                contratuais e da aceitação do risco. A orientação não substitui a leitura desses
                documentos.
              </p>
              <a
                className="mt-4 inline-flex items-center gap-2 font-semibold text-aqua-700 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700"
                href={insurance.referenceUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Consultar orientação da SUSEP
                <ExternalLink aria-hidden="true" size={16} />
              </a>
            </div>
          </div>

          <div className="mt-14 max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
              Perguntas frequentes
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-[-0.025em] text-navy-950">
              O que vale esclarecer antes de contratar
            </h2>
            <div className="mt-8 space-y-3">
              {insurance.faqs.map((faq) => (
                <details
                  className="group rounded-xl border border-aqua-200 bg-white px-5 py-4 open:shadow-sm"
                  key={faq.question}
                >
                  <summary className="cursor-pointer pr-4 font-semibold text-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700">
                    {faq.question}
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              className="inline-flex items-center gap-2 font-semibold text-navy-900 hover:text-aqua-700"
              href="/seguros"
            >
              <ArrowLeft aria-hidden="true" size={18} />
              Ver todos os seguros
            </Link>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className={buttonStyles()}
                href={`/contato?seguro=${insurance.slug}#solicitar-cotacao`}
              >
                Solicitar cotação
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <a
                className={buttonStyles({ variant: "subtle" })}
                href={createWhatsAppHref(insurance.whatsappMessage)}
                rel="noopener noreferrer"
                target="_blank"
              >
                Conversar sobre {insurance.shortName}
                <MessageCircle aria-hidden="true" size={18} />
              </a>
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
