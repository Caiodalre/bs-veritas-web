import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ClipboardList,
  FileSearch,
  MessageCircle,
  PhoneCall,
  Scale,
  ShieldAlert,
} from "lucide-react";
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

const firstActions: readonly {
  title: string;
  text: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Proteja as pessoas",
    text: "Em situação de risco ou emergência, priorize a segurança e acione os serviços públicos adequados.",
    icon: ShieldAlert,
  },
  {
    title: "Use os canais oficiais",
    text: "Localize na apólice, aplicativo ou cartão do seguro a assistência e o aviso de sinistro da seguradora.",
    icon: PhoneCall,
  },
  {
    title: "Registre o contexto",
    text: "Quando for seguro, anote data, horário, local, envolvidos e um resumo objetivo do ocorrido.",
    icon: ClipboardList,
  },
];

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
  "Identifique a seguradora e a modalidade contratada.",
  "Tenha uma descrição breve e cronológica do ocorrido.",
  "Guarde números de protocolo e comunicações oficiais.",
  "Siga as orientações da seguradora antes de reparos ou descarte de bens, salvo medidas urgentes e seguras para evitar agravamento.",
] as const;

export default function ClaimsPage() {
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
            <span aria-current="page">Sinistros</span>
          </nav>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
            Apoio em momentos delicados
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
            Orientação clara quando acontece um sinistro
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            O primeiro passo é preservar a segurança e usar os canais oficiais da seguradora. A
            corretora pode apoiar a compreensão do processo, sempre respeitando as condições da
            apólice.
          </p>
          <a
            className={buttonStyles({ className: "mt-8", size: "lg" })}
            href={createWhatsAppHref(whatsappMessages.claimsSupport)}
            rel="noopener noreferrer"
            target="_blank"
          >
            Pedir apoio da corretora
            <MessageCircle aria-hidden="true" size={18} />
          </a>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
            Este contato não substitui o aviso de sinistro nem os canais de emergência.
          </p>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <ShieldAlert
                aria-hidden="true"
                className="shrink-0 text-amber-700"
                size={30}
                strokeWidth={1.8}
              />
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy-950">Há risco imediato?</h2>
                <p className="mt-3 max-w-4xl leading-7 text-slate-700">
                  Acione os serviços de emergência, as autoridades competentes e a assistência
                  indicada na apólice. Este site não é um canal de emergência nem substitui o aviso
                  oficial à seguradora.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
              Primeiros cuidados
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
              Uma sequência simples para começar
            </h2>
          </div>

          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {firstActions.map(({ icon: Icon, text, title }, index) => (
              <li className="rounded-xl border border-border bg-white p-7" key={title}>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
                    <Icon aria-hidden="true" size={25} strokeWidth={1.7} />
                  </div>
                  <span className="text-xs font-bold tracking-[0.18em] text-aqua-700">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-serif text-xl font-bold text-navy-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-aqua-50 py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
              Antes do contato
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
              Organize as informações essenciais
            </h2>
            <p className="mt-6 leading-8 text-slate-600">
              Os documentos e prazos variam conforme o produto, a seguradora e as circunstâncias.
              Consulte sempre a apólice e as instruções oficiais antes de enviar qualquer material.
            </p>
          </div>
          <ul className="grid gap-4">
            {preparationItems.map((item, index) => (
              <li
                className="flex gap-4 rounded-xl border border-aqua-200 bg-white p-5 text-sm leading-7 text-slate-700"
                key={item}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-950 text-xs font-bold text-aqua-300">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-navy-950 py-20 text-white sm:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
              Papel da corretora
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
              Apoio sem promessas indevidas
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {supportMoments.map(({ icon: Icon, text, title }) => (
              <article
                className="rounded-xl border border-white/10 bg-white/[0.045] p-7"
                key={title}
              >
                <Icon aria-hidden="true" className="text-aqua-300" size={26} strokeWidth={1.7} />
                <h3 className="mt-6 font-serif text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-serif text-3xl font-bold text-navy-950">
              Proteja também as suas informações
            </h2>
            <p className="mt-4 max-w-3xl leading-8 text-slate-600">
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
