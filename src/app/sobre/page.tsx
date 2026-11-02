import { ArrowRight, Eye, Handshake, Scale, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre a B&S Veritas",
  description: "Conheça o propósito e a forma de trabalhar da B&S Veritas Corretora de Seguros.",
  alternates: { canonical: "/sobre" },
};

const principles = [
  {
    title: "Clareza",
    text: "Explicar alternativas, condições e limites em uma linguagem compreensível.",
    icon: Eye,
  },
  {
    title: "Proximidade",
    text: "Ouvir o contexto de cada cliente e manter um atendimento humano.",
    icon: Handshake,
  },
  {
    title: "Responsabilidade",
    text: "Orientar escolhas sem promessas genéricas ou soluções desconectadas da necessidade.",
    icon: Scale,
  },
] as const;

const serviceMoments = [
  {
    title: "Entender antes de propor",
    text: "A conversa inicial organiza prioridades, dúvidas e o contexto que precisa de proteção. Você não precisa enviar documentos ou dados sensíveis nesse primeiro contato.",
  },
  {
    title: "Explicar antes de decidir",
    text: "Coberturas, limites, condições e responsabilidades são apresentados para que a escolha seja consciente, sem limitar a comparação ao preço.",
  },
  {
    title: "Acompanhar além da contratação",
    text: "A relação continua nos ciclos de renovação e quando surge a necessidade de orientação.",
  },
] as const;

export default function AboutPage() {
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
            <span aria-current="page">Sobre</span>
          </nav>
          <h1 className="mt-6 max-w-4xl font-serif text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
            Conheça a B&S Veritas
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            Corretora de seguros para pessoas, famílias e empresas. Nosso propósito é tornar a
            relação com o mercado segurador mais próxima, transparente e consultiva.
          </p>
        </Container>
      </section>

      <section aria-labelledby="quote-contact-title" className="py-10 sm:py-12">
        <Container className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2
              className="font-serif text-2xl font-bold text-navy-950 sm:text-3xl"
              id="quote-contact-title"
            >
              Quem acompanha sua cotação
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              Para assuntos relacionados à cotação, este é o responsável informado pela B&S Veritas.
            </p>
          </div>
          <div className="rounded-xl border border-aqua-200 bg-aqua-50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
                <UserRound aria-hidden="true" size={25} strokeWidth={1.7} />
              </span>
              <div>
                <p className="font-serif text-2xl font-bold text-navy-950">
                  Alexandre Marcelo Baez
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">Responsável pela cotação</p>
              </div>
            </div>
            <Link
              className={buttonStyles({ className: "mt-5 w-full sm:w-auto" })}
              href="/contato#solicitar-cotacao"
            >
              Iniciar uma cotação
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="service-process-title"
        className="scroll-mt-24 bg-navy-950 py-10 text-white sm:py-12"
        id="como-trabalhamos"
      >
        <Container>
          <h2 className="font-serif text-2xl font-bold sm:text-3xl" id="service-process-title">
            Como funciona o atendimento
          </h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {serviceMoments.map((moment, index) => (
              <li className="flex gap-4" key={moment.title}>
                <span aria-hidden="true" className="font-serif text-2xl font-bold text-aqua-300">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold">{moment.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{moment.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-md font-semibold text-aqua-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-300"
            href="/sinistros"
          >
            Precisa de orientação sobre um sinistro?
            <ArrowRight aria-hidden="true" className="shrink-0" size={18} />
          </Link>
        </Container>
      </section>

      <section className="py-10 sm:py-12">
        <Container>
          <h2 className="font-serif text-2xl font-bold text-navy-950 sm:text-3xl">
            O que orienta cada atendimento
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, text }) => (
              <article className="border-t border-border pt-5" key={title}>
                <div className="flex items-center gap-3">
                  <Icon aria-hidden="true" className="shrink-0 text-aqua-700" size={24} />
                  <h3 className="font-serif text-xl font-bold text-navy-950">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-5 rounded-xl border border-aqua-200 bg-aqua-50 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy-950">
                Conheça as soluções atendidas
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                Veja as modalidades e o ponto de partida para cada necessidade.
              </p>
            </div>
            <Link className={buttonStyles()} href="/seguros">
              Ver seguros
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
