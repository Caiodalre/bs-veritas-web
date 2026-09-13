import { Menu, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui/button";
import { mainNavigation } from "@/config/site";
import { createWhatsAppHref, whatsappMessages } from "@/features/contact/whatsapp";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/95 text-white backdrop-blur-xl">
      <a
        className="sr-only z-[60] rounded-md bg-aqua-300 px-4 py-3 font-semibold text-navy-950 focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        href="#conteudo"
      >
        Ir para o conteúdo
      </a>

      <Container className="flex min-h-20 items-center justify-between gap-2 sm:gap-4 lg:gap-6">
        <Wordmark inverted />

        <nav aria-label="Navegação principal" className="hidden items-center gap-7 lg:flex">
          {mainNavigation.map((item) => (
            <Link
              className="text-sm font-medium text-slate-200 transition-colors hover:text-aqua-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-300"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            aria-label="Fale conosco por e-mail ou telefone"
            className={buttonStyles({ size: "sm" })}
            href="/contato"
          >
            Fale conosco
          </Link>
        </div>

        <a
          aria-label="Conversar pelo WhatsApp"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-aqua-400 text-navy-950 transition-colors hover:bg-aqua-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-aqua-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 lg:hidden"
          href={createWhatsAppHref(whatsappMessages.generalQuote)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MessageCircle aria-hidden="true" size={21} strokeWidth={1.9} />
        </a>

        <details className="relative lg:hidden">
          <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-md border border-white/20 text-white transition-colors hover:border-aqua-300 hover:text-aqua-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-300">
            <Menu aria-hidden="true" size={22} strokeWidth={1.8} />
            <span className="sr-only">Abrir menu</span>
          </summary>

          <nav
            aria-label="Navegação móvel"
            className="absolute right-0 top-14 w-[min(19rem,calc(100vw-2.5rem))] rounded-xl border border-white/10 bg-navy-900 p-3 shadow-2xl"
          >
            {mainNavigation.map((item) => (
              <Link
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-100 hover:bg-white/8 hover:text-aqua-200"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            <Link
              aria-label="Fale conosco por e-mail ou telefone"
              className={buttonStyles({ className: "mt-2 w-full", size: "sm" })}
              href="/contato"
            >
              Fale conosco
            </Link>
          </nav>
        </details>
      </Container>
    </header>
  );
}
