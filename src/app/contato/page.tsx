import {
  ArrowDown,
  Building2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { createWhatsAppHref, whatsappMessages } from "@/features/contact/whatsapp";
import { QuoteForm } from "@/features/quote/components/quote-form";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a B&S Veritas pelos canais oficiais de atendimento.",
  alternates: {
    canonical: "/contato",
  },
};

const contactChannels = [
  {
    title: "Telefone",
    description: siteConfig.contact.phone,
    action: "Ligar agora",
    href: siteConfig.contact.phoneHref,
    icon: Phone,
  },
  {
    title: "E-mail",
    description: siteConfig.contact.email,
    action: "Enviar e-mail",
    href: `mailto:${siteConfig.contact.email}`,
    icon: Mail,
  },
] as const;

export default function ContactPage() {
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
            <span aria-current="page">Contato</span>
          </nav>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
            Canais oficiais
          </p>
          <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
            Fale com a B&S Veritas
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Converse pelo WhatsApp ou preencha o formulário para solicitar uma cotação.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              className={buttonStyles()}
              href={createWhatsAppHref(whatsappMessages.generalQuote)}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircle aria-hidden="true" size={20} />
              Conversar pelo WhatsApp
            </a>
            <a className={buttonStyles({ variant: "outlineDark" })} href="#solicitar-cotacao">
              Preencher cotação
              <ArrowDown aria-hidden="true" size={18} />
            </a>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            No WhatsApp, você pode revisar a mensagem antes de enviá-la.
          </p>
        </Container>
      </section>

      <section
        aria-labelledby="quote-form-title"
        className="scroll-mt-20 bg-aqua-50 py-8 sm:py-12"
        id="solicitar-cotacao"
      >
        <Container className="grid max-w-5xl gap-6">
          <div>
            <h2
              className="font-serif text-2xl font-bold tracking-[-0.025em] text-navy-950 sm:text-3xl"
              id="quote-form-title"
            >
              Solicite sua cotação
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-700">
              Informe seus contatos e o seguro de interesse. Nossa equipe continuará o atendimento.
            </p>
          </div>
          <QuoteForm />
        </Container>
      </section>

      <section aria-labelledby="other-contact-title" className="py-10 sm:py-12">
        <Container>
          <h2 className="font-serif text-2xl font-bold text-navy-950" id="other-contact-title">
            Outros canais de atendimento
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {contactChannels.map(({ action, description, href, icon: Icon, title }) => (
              <article className="rounded-xl border border-border bg-white p-5 sm:p-6" key={title}>
                <div className="flex items-center gap-3">
                  <Icon aria-hidden="true" className="shrink-0 text-aqua-700" size={22} />
                  <h3 className="text-base font-bold text-navy-950">{title}</h3>
                </div>
                <p className="mt-2 break-words text-sm leading-6 text-slate-600">{description}</p>
                <a
                  className={buttonStyles({ className: "mt-4", variant: "outlineLight" })}
                  href={href}
                >
                  {action}
                </a>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-6 border-t border-border pt-6 md:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-3 text-base font-bold text-navy-950">
                <MapPin aria-hidden="true" className="shrink-0 text-aqua-700" size={22} />
                Localização
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{siteConfig.location}</p>
            </div>
            <div>
              <h3 className="flex items-center gap-3 text-base font-bold text-navy-950">
                <Building2 aria-hidden="true" className="shrink-0 text-aqua-700" size={22} />
                Identificação empresarial
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {siteConfig.legalName}
                <br />
                CNPJ {siteConfig.cnpj}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-8 text-white sm:py-10">
        <Container className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <ShieldCheck aria-hidden="true" className="text-aqua-300" size={38} strokeWidth={1.6} />
          <div>
            <h2 className="font-serif text-2xl font-bold">Proteja suas informações</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              No primeiro contato, não envie documentos, CPF, dados bancários, informações médicas
              ou dados completos de apólices. Compartilhe apenas o necessário para iniciarmos o
              atendimento com segurança.
            </p>
          </div>
          <Link className={buttonStyles({ size: "lg", variant: "outlineDark" })} href="/sinistros">
            Orientação sobre sinistros
          </Link>
        </Container>
      </section>
    </SiteShell>
  );
}
