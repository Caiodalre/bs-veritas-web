"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavigation } from "@/config/site";

export function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return mainNavigation.map((item) => {
    const target = item.href.split("#")[0];
    const exact = pathname === target;
    const active = exact || (target !== "/" && pathname?.startsWith(`${target}/`));

    return (
      <Link
        aria-current={exact ? "page" : active ? "location" : undefined}
        style={{ borderColor: active ? "var(--aqua-300)" : "transparent" }}
        className={
          mobile
            ? `block min-h-11 rounded-lg border-l-2 px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-300 ${active ? "bg-white/8 text-aqua-200" : "text-slate-100 hover:bg-white/8 hover:text-aqua-200"}`
            : `inline-flex min-h-11 items-center border-b-2 text-sm font-medium transition-colors hover:text-aqua-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-300 ${active ? "text-aqua-200" : "text-slate-200"}`
        }
        href={item.href}
        key={item.href}
      >
        {item.label}
      </Link>
    );
  });
}
