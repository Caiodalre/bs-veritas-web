import { Building2, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { createWhatsAppHref, whatsappMessages } from "@/features/contact/whatsapp";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a B&S Veritas pelos canais oficiais de atendimento.",
  alternates: {
    canonical: "/contato",
  },
};

const contactChannels = [
  {
    title: "WhatsApp",
    description: "Inicie uma conversa pelo canal oficial da corretora.",
    action: "Conversar pelo WhatsApp",
    href: createWhatsAppHref(whatsappMessages.generalQuote),
    icon: MessageCircle,
    external: true,
  },
  {
    title: "Telefone",
    description: siteConfig.contact.phone,
    action: "Ligar agora",
    href: siteConfig.contact.phoneHref,
    icon: Phone,
    external: false,
  },
  {
    title: "E-mail",
    description: siteConfig.contact.email,
    action: "Enviar e-mail",
    href: `mailto:${siteConfig.contact.email}`,
    icon: Mail,
    external: false,
  },
] as const;

export default function ContactPage() {
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
            <span aria-current="page">Contato</span>
          </nav>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
            Canais oficiais
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
            Fale com a B&S Veritas
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Escolha o canal mais conveniente para tirar dúvidas, conversar sobre seguros ou
            solicitar uma cotação com atendimento humano e próximo.
          </p>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {contactChannels.map(({ action, description, external, href, icon: Icon, title }) => (
              <article
                className="flex flex-col rounded-2xl border border-border bg-white p-7 shadow-[0_14px_45px_rgba(7,24,39,0.055)]"
                key={title}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
                  <Icon aria-hidden="true" size={25} strokeWidth={1.7} />
                </div>
                <h2 className="mt-6 font-serif text-xl font-bold text-navy-950">{title}</h2>
                <p className="mt-3 flex-1 break-words text-sm leading-7 text-slate-600">
                  {description}
                </p>
                <a
                  className={buttonStyles({ className: "mt-6 w-full", variant: "outlineLight" })}
                  href={href}
                  rel={external ? "noopener noreferrer" : undefined}
                  target={external ? "_blank" : undefined}
                >
                  {action}
                </a>
              </article>
            ))}
          </div>

          <p className="mt-5 text-center text-sm leading-6 text-slate-600">
            No WhatsApp, a mensagem inicial será apenas preenchida. Você poderá revisar o texto
            antes de enviá-lo.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-aqua-200 bg-aqua-50 p-6">
              <MapPin aria-hidden="true" className="text-aqua-700" size={26} />
              <h2 className="mt-5 font-serif text-xl font-bold text-navy-950">Localização</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">{siteConfig.location}</p>
            </div>
            <div className="rounded-xl border border-aqua-200 bg-aqua-50 p-6">
              <Building2 aria-hidden="true" className="text-aqua-700" size={26} />
              <h2 className="mt-5 font-serif text-xl font-bold text-navy-950">
                Identificação empresarial
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {siteConfig.legalName}
                <br />
                CNPJ {siteConfig.cnpj}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-16 text-white sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <ShieldCheck aria-hidden="true" className="text-aqua-300" size={38} strokeWidth={1.6} />
          <div>
            <h2 className="font-serif text-3xl font-bold">Proteja suas informações</h2>
            <p className="mt-4 max-w-3xl leading-8 text-slate-300">
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
