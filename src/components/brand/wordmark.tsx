import Link from "next/link";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";

type WordmarkProps = {
  inverted?: boolean;
  className?: string;
};

export function Wordmark({ className, inverted = false }: WordmarkProps) {
  return (
    <Link className={cn("inline-flex flex-col leading-none", className)} href="/#inicio">
      <span
        className={cn(
          "font-serif text-[1.36rem] font-bold tracking-[0.035em] sm:text-[1.5rem]",
          inverted ? "text-white" : "text-navy-950",
        )}
      >
        B&amp;S <span className={inverted ? "text-aqua-300" : "text-aqua-700"}>Veritas</span>
      </span>
      <span
        className={cn(
          "mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.24em]",
          inverted ? "text-slate-300" : "text-slate-600",
        )}
      >
        {siteConfig.descriptor}
      </span>
    </Link>
  );
}
