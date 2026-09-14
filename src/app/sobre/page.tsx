import type { LucideIcon } from "lucide-react";
import { ArrowRight, Eye, Handshake, MessageCircle, Scale, Search, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre a B&S Veritas",
  description: "Conheça o propósito e a forma de trabalhar da B&S Veritas Corretora de Seguros.",
  alternates: {
    canonical: "/sobre",
  },
};

const principles: readonly {
  title: string;
  text: string;
  icon: LucideIcon;
}[] = [
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
];

const serviceMoments = [
  {
    title: "Entender antes de propor",
    text: "A conversa inicial organiza prioridades, dúvidas e o contexto que precisa de proteção.",
    icon: Search,
  },
  {
    title: "Explicar antes de decidir",
    text: "Os pontos relevantes são apresentados para que a escolha seja consciente.",
    icon: MessageCircle,
  },
  {
    title: "Acompanhar além da contratação",
    text: "A relação continua nos ciclos de renovação e quando surge a necessidade de orientação.",
    icon: Handshake,
  },
] as const;

export default function AboutPage() {
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
            <span aria-current="page">Sobre</span>
          </nav>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
            Quem somos
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
            Confiança se constrói com clareza e presença
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            A B&S Veritas tem o propósito de tornar a relação com o mercado segurador mais próxima,
            transparente e consultiva.
          </p>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
              Nosso propósito
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
              Proteção começa por uma conversa bem conduzida
            </h2>
          </div>
          <div className="grid gap-6 text-base leading-8 text-slate-600 sm:grid-cols-2">
            <p>
              Seguro envolve decisões importantes. Por isso, cada atendimento parte da realidade do
              cliente, sem fórmulas prontas ou comparações limitadas ao preço.
            </p>
            <p>
              A orientação organiza coberturas, condições e responsabilidades para que a proteção
              escolhida possa ser compreendida com tranquilidade.
            </p>
            <div className="rounded-xl border border-aqua-200 bg-aqua-50 p-6 text-navy-900 sm:col-span-2">
              <p className="font-serif text-xl font-bold leading-8">
                A relação precisa continuar fazendo sentido depois da contratação.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-aqua-50 py-20 sm:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
              Princípios
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-[-0.025em] text-navy-950 sm:text-4xl">
              O que orienta cada atendimento
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {principles.map(({ icon: Icon, text, title }) => (
              <article
                className="rounded-xl border border-aqua-200 bg-white p-7 md:last:col-span-2 lg:last:col-span-1"
                key={title}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
                  <Icon aria-hidden="true" size={25} strokeWidth={1.7} />
                </div>
                <h3 className="mt-6 font-serif text-2xl font-bold text-navy-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-20 text-white sm:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
              Nossa forma de trabalhar
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
              Presença em diferentes momentos
            </h2>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {serviceMoments.map(({ icon: Icon, text, title }, index) => (
              <li
                className="rounded-xl border border-white/10 bg-white/[0.045] p-7 md:last:col-span-2 lg:last:col-span-1"
                key={title}
              >
                <div className="flex items-center justify-between">
                  <Icon aria-hidden="true" className="text-aqua-300" size={25} strokeWidth={1.7} />
                  <span className="text-xs font-bold tracking-[0.18em] text-aqua-300">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-7 font-serif text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 rounded-2xl border border-aqua-200 bg-aqua-50 p-7 sm:p-9 md:grid-cols-[1.15fr_0.85fr] md:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-aqua-700">
                Atendimento
              </p>
              <h2 className="mt-4 font-serif text-3xl font-bold text-navy-950">
                Quem acompanha sua cotação
              </h2>
              <p className="mt-4 leading-8 text-slate-600">
                Para assuntos relacionados à cotação, este é o responsável informado pela B&S
                Veritas.
              </p>
            </div>
            <div className="rounded-xl border border-aqua-200 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
                <UserRound aria-hidden="true" size={25} strokeWidth={1.7} />
              </div>
              <p className="mt-5 font-serif text-2xl font-bold text-navy-950">
                Alexandre Marcelo Baez
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Responsável pela cotação</p>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="font-serif text-3xl font-bold text-navy-950">
                Conheça as soluções atendidas
              </h2>
              <p className="mt-4 leading-8 text-slate-600">
                O catálogo apresenta as modalidades e os pontos considerados na orientação.
              </p>
            </div>
            <Link className={buttonStyles({ size: "lg" })} href="/seguros">
              Ver seguros
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
