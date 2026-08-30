import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { getInsuranceBySlug, insuranceCatalog } from "@/features/insurance/catalog";
import { InsuranceIcon } from "@/features/insurance/components/insurance-icon";

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
            <Link className={buttonStyles({ size: "lg" })} href="/contato">
              Solicitar orientação
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
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
            <Link className={buttonStyles({ variant: "subtle" })} href="/contato">
              Conhecer a jornada de cotação
            </Link>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
