import type { Metadata } from "next";
import { Libre_Baskerville, Manrope } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const sans = Manrope({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

const serif = Libre_Baskerville({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-libre-baskerville",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.descriptor}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.descriptor}`,
    description: siteConfig.description,
    url: "/",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
