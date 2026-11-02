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
      <section className="bg-navy-950 py-8 text-white sm:py-12">
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

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-aqua-300 text-navy-950">
                  <InsuranceIcon name={insurance.icon} size={26} />
                </div>
                <h1 className="font-serif text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
                  {insurance.name}
                </h1>
              </div>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
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

      <section className="py-10 sm:py-12">
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-[-0.025em] text-navy-950">
              Para quem é
            </h2>
            <ul className="mt-5 space-y-3">
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

          <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
            <h2 className="font-serif text-2xl font-bold tracking-[-0.025em] text-navy-950">
              O que avaliar
            </h2>
            <ul className="mt-5 divide-y divide-border">
              {insurance.analysisPoints.map((point, index) => (
                <li className="flex gap-3 py-3 first:pt-0 last:pb-0" key={point}>
                  <span aria-hidden="true" className="font-serif text-lg font-bold text-aqua-700">
                    0{index + 1}
                  </span>
                  <span className="leading-7 text-slate-600">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-y border-aqua-200 bg-aqua-50 py-10 sm:py-12">
        <Container className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div aria-labelledby="insurance-faq-title" role="region">
            <h2
              className="font-serif text-2xl font-bold tracking-[-0.025em] text-navy-950"
              id="insurance-faq-title"
            >
              O que vale esclarecer antes de contratar
            </h2>
            <div className="mt-5 space-y-3">
              {insurance.faqs.map((faq) => (
                <details
                  className="group rounded-xl border border-aqua-200 bg-white open:shadow-sm"
                  key={faq.question}
                >
                  <summary className="min-h-12 cursor-pointer rounded-xl px-5 py-4 font-semibold text-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700">
                    {faq.question}
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-7 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <aside
            aria-labelledby="insurance-notice-title"
            className="rounded-xl border border-aqua-200 bg-white p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <Info aria-hidden="true" className="shrink-0 text-aqua-700" size={24} />
              <h2
                className="font-serif text-xl font-bold text-navy-950"
                id="insurance-notice-title"
              >
                Informações importantes
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Coberturas, limites, franquias, carências, assistências e exclusões variam conforme o
              produto e a seguradora. A contratação depende da proposta, das condições contratuais e
              da aceitação do risco. A orientação não substitui a leitura desses documentos.
            </p>
            <a
              className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-md font-semibold text-aqua-700 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700"
              href={insurance.referenceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Consultar orientação da SUSEP
              <ExternalLink aria-hidden="true" className="shrink-0" size={16} />
            </a>
          </aside>

          <div
            aria-labelledby="quote-preparation-title"
            className="rounded-xl bg-navy-950 p-5 text-white sm:p-8 lg:col-span-2"
            role="region"
          >
            <h2
              className="font-serif text-2xl font-bold tracking-[-0.025em]"
              id="quote-preparation-title"
            >
              Prepare sua cotação
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Você não precisa enviar documentos no primeiro contato. Estas perguntas ajudam a
              organizar a necessidade antes de comparar propostas.
            </p>
            <ol className="mt-5 grid gap-5 md:grid-cols-3">
              {insurance.practicalQuestions.map((question, index) => (
                <li className="flex gap-3" key={question}>
                  <span aria-hidden="true" className="font-bold text-aqua-300">
                    {index + 1}.
                  </span>
                  <p className="text-base leading-7 text-slate-100">{question}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                className={buttonStyles()}
                href={`/contato?seguro=${insurance.slug}#solicitar-cotacao`}
              >
                Solicitar cotação
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <a
                className={buttonStyles({ variant: "outlineDark" })}
                href={createWhatsAppHref(insurance.whatsappMessage)}
                rel="noopener noreferrer"
                target="_blank"
              >
                Conversar sobre {insurance.shortName}
                <MessageCircle aria-hidden="true" size={18} />
              </a>
            </div>
          </div>
          <Link
            className="inline-flex min-h-12 w-fit items-center gap-2 rounded-md font-semibold text-navy-900 hover:text-aqua-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700 lg:col-span-2"
            href="/seguros"
          >
            <ArrowLeft aria-hidden="true" size={18} />
            Ver todos os seguros
          </Link>
        </Container>
      </section>
    </SiteShell>
  );
}
