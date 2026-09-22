import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonStyles } from "@/components/ui/button";
import { CampaignFeed } from "@/features/campaigns/components/campaign-feed";
import { insuranceCatalog } from "@/features/insurance/catalog";
import { InsuranceIcon } from "@/features/insurance/components/insurance-icon";
import { partnerCatalog } from "@/features/partners/catalog";
import { createWhatsAppHref, whatsappMessages } from "@/features/contact/whatsapp";
import { homeStructuredData, serializeStructuredData } from "@/lib/structured-data";

const trustItems = [
  "Atendimento humano e próximo",
  "Comparação com critérios claros",
  "Apoio também depois da contratação",
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
      <script
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(homeStructuredData) }}
        type="application/ld+json"
      />
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
                Entenda coberturas, limites e diferenças antes de contratar. A B&S Veritas organiza
                as opções e acompanha sua decisão com clareza.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  className={buttonStyles({ size: "lg" })}
                  href={createWhatsAppHref(whatsappMessages.generalQuote)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Pedir cotação no WhatsApp
                  <MessageCircle aria-hidden="true" size={18} />
                </a>
                <Link
                  className={buttonStyles({ size: "lg", variant: "outlineDark" })}
                  href="#seguros"
                >
                  Ver modalidades
                  <ArrowRight aria-hidden="true" size={18} />
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
          <Container className="grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {trustItems.map((label) => (
              <div
                className="flex min-h-24 items-center gap-4 px-1 py-5 md:px-6 first:md:pl-0"
                key={label}
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="shrink-0 text-aqua-300"
                  size={24}
                  strokeWidth={1.8}
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

        <section
          className="scroll-mt-24 border-y border-border bg-aqua-50 py-20 sm:py-24"
          id="campanhas"
        >
          <Container>
            <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
                  Avisos e campanhas
                </p>
                <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
                  Novidades das seguradoras parceiras
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-600">
                  Acompanhe ações vigentes, benefícios e informações importantes. Condições,
                  disponibilidade e elegibilidade são sempre apresentadas conforme a comunicação
                  oficial de cada seguradora.
                </p>
              </div>
              <p className="max-w-sm text-sm leading-6 text-slate-500">
                Confira as publicações e consulte as condições apresentadas em cada campanha.
              </p>
            </div>

            <CampaignFeed />
          </Container>
        </section>

        <section className="scroll-mt-24 bg-navy-950 py-20 text-white sm:py-24" id="diferenciais">
          <Container>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
                Como ajudamos
              </p>
              <h2 className="mt-4 max-w-xl font-serif text-3xl leading-tight font-bold tracking-[-0.025em] sm:text-4xl">
                Da necessidade à escolha, sem atalhos
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
                A conversa organiza o que precisa de proteção e os critérios que realmente importam
                antes da comparação de propostas.
              </p>
            </div>

            <ol className="mt-12 grid gap-5 md:grid-cols-3">
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

            <div className="mx-auto mt-12 max-w-5xl">
              <div
                aria-label="Seguradoras e plataformas parceiras"
                aria-roledescription="carrossel"
                className="overflow-x-auto scroll-smooth pb-4 focus-visible:rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700 focus-visible:ring-offset-4"
                role="region"
                tabIndex={0}
              >
                <ul className="flex snap-x snap-mandatory gap-4 px-1">
                  {partnerCatalog.map((partner) => (
                    <li
                      className="flex min-h-36 w-[78vw] max-w-80 flex-none scroll-mt-24 snap-center items-center justify-center rounded-xl border border-aqua-200 bg-white px-8 py-7 shadow-sm sm:w-80 lg:w-[calc((100%-2rem)/3)] lg:max-w-none"
                      id={`parceira-${partner.slug}`}
                      key={partner.slug}
                    >
                      <Image
                        alt={`Logotipo ${partner.name}`}
                        className="h-10 w-auto max-w-full object-contain"
                        height={partner.logoHeight}
                        src={partner.logoSrc}
                        unoptimized
                        width={partner.logoWidth}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <nav
                aria-label="Selecionar marca parceira no carrossel"
                className="mt-5 flex flex-wrap justify-center gap-2"
              >
                {partnerCatalog.map((partner) => (
                  <a
                    className="rounded-full border border-aqua-200 bg-white px-4 py-2 text-sm font-semibold text-aqua-700 transition-colors hover:border-aqua-600 hover:text-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700"
                    href={`#parceira-${partner.slug}`}
                    key={partner.slug}
                  >
                    {partner.name}
                  </a>
                ))}
              </nav>

              <p className="mt-5 text-center text-sm leading-6 text-slate-500">
                Parcerias comerciais confirmadas. A disponibilidade de produtos depende do perfil,
                da região e das condições de cada empresa. As marcas pertencem aos respectivos
                titulares.
              </p>
            </div>
          </Container>
        </section>

        <section className="scroll-mt-24 bg-navy-900 py-20 text-white sm:py-24" id="cotacao">
          <Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
                Próximo passo
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.025em] sm:text-4xl">
                Conte o que você quer proteger
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Inicie pelo WhatsApp ou escolha telefone e e-mail. No primeiro contato, basta
                informar a modalidade de interesse e sua dúvida principal.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                className={buttonStyles({ size: "lg" })}
                href={createWhatsAppHref(whatsappMessages.generalQuote)}
                rel="noopener noreferrer"
                target="_blank"
              >
                Conversar pelo WhatsApp
                <MessageCircle aria-hidden="true" size={18} />
              </a>
              <Link
                className={buttonStyles({ size: "lg", variant: "outlineDark" })}
                href="/contato"
              >
                Ver outros canais
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
