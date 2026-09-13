import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { insuranceCatalog } from "@/features/insurance/catalog";

export const dynamic = "force-static";

const publicRoutes = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/sobre", changeFrequency: "monthly", priority: 0.8 },
  { path: "/seguros", changeFrequency: "monthly", priority: 0.9 },
  { path: "/sinistros", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contato", changeFrequency: "monthly", priority: 0.8 },
  { path: "/politica-de-privacidade", changeFrequency: "yearly", priority: 0.4 },
  { path: "/politica-de-cookies", changeFrequency: "yearly", priority: 0.4 },
  { path: "/termos-de-uso", changeFrequency: "yearly", priority: 0.4 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: new URL(route.path, siteConfig.url).toString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const insuranceRoutes: MetadataRoute.Sitemap = insuranceCatalog.map((insurance) => ({
    url: new URL("/seguros/" + insurance.slug, siteConfig.url).toString(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...routes, ...insuranceRoutes];
}
