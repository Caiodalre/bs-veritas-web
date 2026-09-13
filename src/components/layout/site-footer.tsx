import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white py-10">
      <Container className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">{siteConfig.description}</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            CNPJ {siteConfig.cnpj} · {siteConfig.location}
          </p>
        </div>

        <div className="text-sm leading-6 text-slate-600 sm:text-right">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}.
          </p>
          <nav
            aria-label="Links institucionais"
            className="mt-1 flex flex-wrap gap-x-4 gap-y-1 sm:justify-end"
          >
            <Link
              className="font-semibold text-aqua-700 hover:text-navy-900"
              href="/politica-de-privacidade"
            >
              Privacidade
            </Link>
            <Link className="font-semibold text-aqua-700 hover:text-navy-900" href="/termos-de-uso">
              Termos de Uso
            </Link>
            <Link className="font-semibold text-aqua-700 hover:text-navy-900" href="/contato">
              Contato
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
