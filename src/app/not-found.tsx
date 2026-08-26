import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="flex min-h-[38rem] items-center bg-navy-950 py-20 text-white">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-aqua-300 text-navy-950">
              <SearchX aria-hidden="true" size={31} strokeWidth={1.7} />
            </div>
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-aqua-300">
              Erro 404
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              Esta página não foi encontrada
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300">
              O endereço pode estar incorreto ou a página pode ter sido movida. Volte ao início ou
              consulte as modalidades de seguros disponíveis.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className={buttonStyles({ size: "lg" })} href="/">
                <ArrowLeft aria-hidden="true" size={18} />
                Voltar ao início
              </Link>
              <Link className={buttonStyles({ size: "lg", variant: "outline" })} href="/seguros">
                Ver seguros
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
