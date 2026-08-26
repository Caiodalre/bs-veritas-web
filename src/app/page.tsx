import { ArrowRight, BadgeCheck, CheckCircle2, Headphones, Scale, UsersRound } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonStyles } from "@/components/ui/button";
import { insuranceCatalog } from "@/features/insurance/catalog";
import { InsuranceIcon } from "@/features/insurance/components/insurance-icon";

const trustItems = [
  { label: "Atendimento personalizado", icon: UsersRound },
  { label: "Análise consultiva", icon: Scale },
  { label: "Experiência e confiança", icon: BadgeCheck },
  { label: "Suporte em todas as etapas", icon: Headphones },
] as const;

const differentiators = [
  "Atendimento humano e próximo",
  "Análise adequada ao perfil de cada cliente",
  "Comparação responsável de alternativas",
  "Acompanhamento da contratação à renovação",
] as const;

const quoteSteps = [
  {
    number: "01",
    title: "Conte sua necessidade",
    text: "Um contato inicial simples, sem documentos ou dados sensíveis.",
  },
  {
    number: "02",
    title: "Receba orientação",
    text: "A equipe entende seu contexto antes de apresentar alternativas.",
  },
  {
    number: "03",
    title: "Escolha com clareza",
    text: "Coberturas e condições são explicadas para uma decisão consciente.",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main id="conteudo">
        <section className="relative isolate overflow-hidden bg-navy-950 text-white" id="inicio">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_75%_15%,rgba(72,215,200,0.17),transparent_27%),linear-gradient(120deg,#071827_20%,#0b263e_72%,#113653)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 -z-10 hidden w-[48%] skew-x-[-8deg] border-l border-white/10 bg-white/[0.025] lg:block"
          />

          <Container className="grid min-h-[38rem] items-center gap-14 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
            <div className="max-w-3xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-aqua-300">
                Consultoria em seguros para pessoas e empresas
              </p>
              <h1 className="max-w-4xl font-serif text-4xl leading-[1.13] font-bold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
                Proteção para o que realmente <span className="text-aqua-300">importa.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                Soluções em seguros para pessoas, famílias e empresas, com atendimento próximo,
                transparente e personalizado.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link className={buttonStyles({ size: "lg" })} href="#cotacao">
                  Solicitar cotação
                  <ArrowRight aria-hidden="true" size={18} />
                </Link>
                <Link className={buttonStyles({ size: "lg", variant: "outline" })} href="#seguros">
                  Conheça os seguros
                </Link>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="relative mx-auto hidden h-[24rem] w-full max-w-lg lg:block"
            >
              <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-2xl" />
              <div className="absolute inset-x-8 bottom-8 top-16 grid grid-cols-5 gap-3 [perspective:900px]">
                {[68, 86, 100, 80, 60].map((height, index) => (
                  <div className="relative flex items-end" key={height}>
                    <div
                      className="w-full rounded-t-sm border border-white/10 bg-gradient-to-t from-navy-800 to-white/10 shadow-[0_0_30px_rgba(72,215,200,0.05)]"
                      style={{
                        height: `${height}%`,
                        transform: `translateY(${index % 2 === 0 ? 0 : 8}px)`,
                      }}
                    >
                      <div className="grid h-full grid-cols-2 gap-px p-2 opacity-60">
                        {Array.from({ length: 12 }).map((_, windowIndex) => (
                          <span className="rounded-[1px] bg-aqua-300/20" key={windowIndex} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute left-8 top-8 h-px w-24 bg-aqua-300" />
              <p className="absolute right-8 top-7 text-xs font-semibold uppercase tracking-[0.2em] text-aqua-200">
                Confiança para avançar
              </p>
            </div>
          </Container>
        </section>

        <section
          aria-label="Compromissos da B&S Veritas"
          className="relative z-10 -mt-1 bg-navy-900 text-white"
        >
          <Container className="grid divide-y divide-white/10 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
            {trustItems.map(({ icon: Icon, label }) => (
              <div
                className="flex min-h-24 items-center gap-4 px-1 py-5 md:px-6 first:md:pl-0"
                key={label}
              >
                <Icon
                  aria-hidden="true"
                  className="shrink-0 text-aqua-300"
                  size={28}
                  strokeWidth={1.6}
                />
                <span className="text-sm font-semibold leading-6 text-slate-100">{label}</span>
              </div>
            ))}
          </Container>
        </section>

        <section className="scroll-mt-24 py-20 sm:py-24" id="seguros">
          <Container>
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
                Soluções completas
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
                Seguros para diferentes fases da sua vida
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                O atendimento começa pela compreensão da sua necessidade. As alternativas são
                analisadas com clareza, sem fórmulas prontas.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {insuranceCatalog.map((solution) => {
                return (
                  <article
                    className="group flex flex-col rounded-2xl border border-border bg-white p-7 shadow-[0_14px_45px_rgba(7,24,39,0.055)] transition duration-200 hover:-translate-y-1 hover:border-aqua-400"
                    key={solution.slug}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700 transition-colors group-hover:bg-aqua-300 group-hover:text-navy-950">
                      <InsuranceIcon name={solution.icon} size={25} />
                    </div>
                    <h3 className="mt-6 font-serif text-xl font-bold text-navy-950">
                      {solution.name}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                      {solution.description}
                    </p>
                    <Link
                      aria-label={"Conhecer " + solution.name}
                      className="mt-6 inline-flex items-center gap-2 font-semibold text-aqua-700 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500"
                      href={"/seguros/" + solution.slug}
                    >
                      Conhecer detalhes
                      <ArrowRight aria-hidden="true" size={17} />
                    </Link>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="scroll-mt-24 bg-navy-950 py-20 text-white sm:py-24" id="diferenciais">
          <Container className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
                Por que a B&S Veritas?
              </p>
              <h2 className="mt-4 max-w-xl font-serif text-3xl leading-tight font-bold tracking-[-0.025em] sm:text-4xl">
                Compromisso que gera confiança
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
                Seguro é uma decisão importante. Por isso, a relação precisa ser próxima,
                transparente e acompanhada também depois da contratação.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {differentiators.map((item) => (
                <li
                  className="flex min-h-28 gap-4 rounded-xl border border-white/10 bg-white/[0.045] p-5"
                  key={item}
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-aqua-300"
                    size={22}
                  />
                  <span className="text-sm font-semibold leading-6 text-slate-100">{item}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className="scroll-mt-24 bg-white py-20 sm:py-24" id="sobre">
          <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
                A B&S Veritas
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
                Relacionamentos construídos com confiança
              </h2>
            </div>
            <div className="grid gap-6 text-base leading-8 text-slate-600 sm:grid-cols-2">
              <p>
                A B&S Veritas nasce com o propósito de tornar a relação com o mercado segurador mais
                próxima, transparente e consultiva.
              </p>
              <p>
                Cada atendimento parte da realidade do cliente, com explicações claras e
                acompanhamento nos momentos em que a proteção precisa fazer diferença.
              </p>
              <Link
                className="inline-flex items-center gap-2 font-semibold text-aqua-700 hover:text-navy-900 sm:col-span-2"
                href="/sobre"
              >
                Conheça nossa forma de trabalhar
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </div>
          </Container>
        </section>

        <section
          className="scroll-mt-24 border-y border-border bg-aqua-50 py-20 sm:py-24"
          id="seguradoras"
        >
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
                Mercado segurador
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
                Escolha orientada, além da comparação de preço
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-600">
                A análise considera coberturas, assistências, condições e adequação ao perfil. As
                opções disponíveis são apresentadas de forma responsável durante o atendimento.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
              {["Coberturas adequadas", "Condições transparentes", "Suporte compatível"].map(
                (item, index) => (
                  <div
                    className="rounded-xl border border-aqua-200 bg-white p-6 text-center"
                    key={item}
                  >
                    <span className="text-xs font-bold tracking-[0.18em] text-aqua-700">
                      0{index + 1}
                    </span>
                    <p className="mt-3 font-serif text-lg font-bold text-navy-950">{item}</p>
                  </div>
                ),
              )}
            </div>
          </Container>
        </section>

        <section className="scroll-mt-24 bg-navy-900 py-20 text-white sm:py-24" id="cotacao">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
                  Jornada de cotação
                </p>
                <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.025em] sm:text-4xl">
                  Proteção começa com uma boa conversa
                </h2>
                <p className="mt-6 text-base leading-8 text-slate-300">
                  O formulário digital será ativado somente após a conexão segura do banco e das
                  camadas anti-spam. Nenhum dado está sendo coletado nesta versão.
                </p>
              </div>

              <ol className="grid gap-5 md:grid-cols-3">
                {quoteSteps.map((step) => (
                  <li
                    className="rounded-xl border border-white/10 bg-white/[0.045] p-6"
                    key={step.number}
                  >
                    <span className="text-sm font-bold tracking-[0.18em] text-aqua-300">
                      {step.number}
                    </span>
                    <h3 className="mt-5 font-serif text-xl font-bold">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
