import { ArrowDown, ArrowRight, FileSearch, MessageCircle, Scale, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { createWhatsAppHref, whatsappMessages } from "@/features/contact/whatsapp";

export const metadata: Metadata = {
  title: "Orientação sobre sinistros",
  description: "Entenda os primeiros cuidados após um sinistro e o papel de apoio da B&S Veritas.",
  alternates: {
    canonical: "/sinistros",
  },
};

const supportMoments = [
  {
    title: "Orientação inicial",
    text: "A corretora ajuda a compreender o fluxo e a identificar o canal adequado da seguradora.",
    icon: MessageCircle,
  },
  {
    title: "Acompanhamento",
    text: "Após a abertura, o apoio pode organizar dúvidas e facilitar a compreensão das comunicações recebidas.",
    icon: FileSearch,
  },
  {
    title: "Responsabilidades claras",
    text: "A análise de cobertura, a regulação e uma eventual indenização cabem à seguradora, conforme a apólice.",
    icon: Scale,
  },
] as const;

const preparationItems = [
  {
    title: "Localize o canal da seguradora",
    text: "Identifique a seguradora e a modalidade contratada. Consulte na apólice, aplicativo ou cartão do seguro os canais de assistência e aviso de sinistro.",
  },
  {
    title: "Registre o ocorrido com segurança",
    text: "Quando for seguro, anote data, horário, local, envolvidos e um resumo objetivo do ocorrido.",
  },
  {
    title: "Guarde os protocolos",
    text: "Mantenha os números de protocolo e as comunicações oficiais para acompanhar o atendimento.",
  },
  {
    title: "Confira as orientações antes de agir",
    text: "Siga as orientações da seguradora antes de reparos ou descarte de bens, salvo medidas urgentes e seguras para evitar agravamento.",
  },
] as const;

export default function ClaimsPage() {
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
            <span aria-current="page">Sinistros</span>
          </nav>
          <h1 className="mt-5 max-w-4xl font-serif text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
            Orientação clara quando acontece um sinistro
          </h1>
          <aside
            aria-labelledby="urgent-risk-title"
            className="mt-6 max-w-4xl rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert
                aria-hidden="true"
                className="shrink-0 text-amber-700"
                size={24}
                strokeWidth={1.8}
              />
              <h2 className="text-lg font-bold text-navy-950" id="urgent-risk-title">
                Há risco imediato?
              </h2>
            </div>
            <p className="mt-3 text-base leading-6 text-slate-700">
              Acione os serviços de emergência, as autoridades competentes e a assistência indicada
              na apólice. Este site não é um canal de emergência nem substitui o aviso oficial à
              seguradora.
            </p>
          </aside>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a className={buttonStyles({ variant: "secondary" })} href="#primeiros-passos">
              Ver próximos passos
              <ArrowDown aria-hidden="true" size={18} />
            </a>
            <a
              className={buttonStyles({ variant: "outlineDark" })}
              href={createWhatsAppHref(whatsappMessages.claimsSupport)}
              rel="noopener noreferrer"
              target="_blank"
            >
              Pedir apoio da corretora
              <MessageCircle aria-hidden="true" size={18} />
            </a>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            O contato com a corretora não substitui o aviso de sinistro à seguradora.
          </p>
        </Container>
      </section>

      <section
        aria-labelledby="first-steps-title"
        className="scroll-mt-20 bg-aqua-50 py-10 sm:py-12"
        id="primeiros-passos"
      >
        <Container>
          <h2
            className="font-serif text-2xl font-bold text-navy-950 sm:text-3xl"
            id="first-steps-title"
          >
            Próximos passos com a seguradora
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-2">
            {preparationItems.map(({ title, text }, index) => (
              <li className="rounded-xl border border-aqua-200 bg-white p-5 sm:p-6" key={title}>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-950 text-sm font-bold text-aqua-300"
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-base font-bold text-navy-950">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">
            Os documentos e prazos variam conforme o produto, a seguradora e as circunstâncias.
            Consulte sempre a apólice e as instruções oficiais antes de enviar qualquer material.
          </p>
        </Container>
      </section>

      <section className="bg-navy-950 py-10 text-white sm:py-12">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
              Papel da corretora
            </p>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
              Apoio sem promessas indevidas
            </h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {supportMoments.map(({ icon: Icon, text, title }) => (
              <article
                className="rounded-xl border border-white/10 bg-white/[0.045] p-5 sm:p-6"
                key={title}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    aria-hidden="true"
                    className="shrink-0 text-aqua-300"
                    size={22}
                    strokeWidth={1.7}
                  />
                  <h3 className="text-base font-bold">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-12">
        <Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-950">
              Proteja também as suas informações
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Não envie CPF, RG, dados bancários, imagens de documentos ou informações médicas por
              mensagens abertas. Utilize os canais oficiais indicados pela seguradora para conteúdos
              sensíveis.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className={buttonStyles({ size: "lg" })}
              href={createWhatsAppHref(whatsappMessages.claimsSupport)}
              rel="noopener noreferrer"
              target="_blank"
            >
              Falar com a corretora
              <MessageCircle aria-hidden="true" size={18} />
            </a>
            <Link className={buttonStyles({ size: "lg", variant: "outlineLight" })} href="/contato">
              Outros canais
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
