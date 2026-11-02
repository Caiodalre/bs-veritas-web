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

          <Container className="grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.08fr_0.92fr]">
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
              <div className="flex items-center gap-3 px-1 py-4 md:px-6 first:md:pl-0" key={label}>
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

        <section className="scroll-mt-24 py-10 sm:py-16" id="seguros">
          <Container>
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
                Modalidades
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
                Seguros para diferentes fases da sua vida
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Já sabe o que procura? Acesse a modalidade para conhecer os pontos de atenção e
                solicitar uma cotação.
              </p>
            </div>

            <nav
              aria-label="Acesso rápido às modalidades"
              className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {insuranceCatalog.map((solution) => (
                <Link
                  aria-label={"Conhecer " + solution.name}
                  className="group flex min-h-20 items-center gap-4 rounded-xl border border-border bg-white p-4 text-navy-950 transition-colors hover:border-aqua-600 hover:bg-aqua-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700"
                  href={"/seguros/" + solution.slug}
                  key={solution.slug}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aqua-100 text-aqua-700">
                    <InsuranceIcon name={solution.icon} size={24} />
                  </span>
                  <span className="flex-1 font-serif text-xl font-bold">{solution.name}</span>
                  <ArrowRight aria-hidden="true" className="shrink-0 text-aqua-700" size={18} />
                </Link>
              ))}
            </nav>
            <Link
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-md font-semibold text-aqua-700 hover:text-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700"
              href="/seguros"
            >
              Precisa de ajuda para escolher a modalidade?
              <ArrowRight aria-hidden="true" className="shrink-0" size={18} />
            </Link>
          </Container>
        </section>

        <CampaignFeed />

        <section className="scroll-mt-24 bg-navy-950 py-10 text-white sm:py-12" id="diferenciais">
          <Container className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
                Como ajudamos
              </p>
              <h2 className="mt-4 max-w-xl font-serif text-3xl leading-tight font-bold tracking-[-0.025em] sm:text-4xl">
                Orientação de pessoas, para pessoas
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Conheça quem acompanha sua cotação e como a B&S Veritas orienta a escolha e os
                próximos ciclos do seguro.
              </p>
            </div>

            <Link className={buttonStyles({ variant: "outlineDark" })} href="/sobre">
              Conhecer a B&S Veritas
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </Container>
        </section>

        <section
          className="scroll-mt-24 border-y border-border bg-aqua-50 py-10 sm:py-12"
          id="seguradoras"
        >
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
                Mercado segurador
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
                Seguradoras e plataformas parceiras
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Conheça as marcas parceiras da B&S Veritas. Durante o atendimento, avaliamos as
                opções disponíveis conforme sua necessidade.
              </p>
            </div>

            <div className="mx-auto mt-7 max-w-5xl">
              <div aria-label="Seguradoras e plataformas parceiras" role="region">
                <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {partnerCatalog.map((partner) => (
                    <li
                      className="flex min-w-0 scroll-mt-24 flex-col items-center justify-center gap-3 rounded-xl border border-aqua-200 bg-white px-4 py-5 shadow-sm sm:p-6"
                      id={`parceira-${partner.slug}`}
                      key={partner.slug}
                    >
                      <Image
                        alt={`Logotipo ${partner.name}`}
                        className="h-10 w-full object-contain"
                        height={partner.logoHeight}
                        src={partner.logoSrc}
                        unoptimized
                        width={partner.logoWidth}
                      />
                      <span className="text-center text-sm font-semibold text-navy-950">
                        {partner.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-5 text-center text-sm leading-6 text-slate-500">
                Parcerias comerciais confirmadas. A disponibilidade de produtos depende do perfil,
                da região e das condições de cada empresa. As marcas pertencem aos respectivos
                titulares.
              </p>
            </div>
          </Container>
        </section>

        <section className="scroll-mt-24 bg-navy-900 py-10 text-white sm:py-12" id="cotacao">
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
