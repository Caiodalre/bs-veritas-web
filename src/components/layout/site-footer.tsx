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
        </div>

        <div className="text-sm leading-6 text-slate-600 sm:text-right">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}.
          </p>
          <p>Site institucional em desenvolvimento.</p>
        </div>
      </Container>
    </footer>
  );
}
