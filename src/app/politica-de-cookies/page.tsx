import { Cookie, ExternalLink, Mail, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Entenda o uso atual de cookies no site da B&S Veritas e como futuras mudanças serão informadas.",
  alternates: {
    canonical: "/politica-de-cookies",
  },
};

const currentStatus = [
  "A aplicação não define cookies próprios durante a navegação comum.",
  "Não utilizamos cookies de analytics, publicidade, marketing ou personalização.",
  "Não carregamos anúncios, pixels ou conteúdo incorporado de redes sociais.",
] as const;

const unusedCategories = [
  {
    name: "Analytics ou desempenho",
    purpose: "Medir visitas, comportamento, erros ou desempenho individualizado.",
  },
  {
    name: "Publicidade ou marketing",
    purpose: "Criar perfis, acompanhar interesses ou personalizar anúncios.",
  },
  {
    name: "Funcionalidade ou personalização",
    purpose: "Lembrar escolhas, preferências, idioma ou conteúdo personalizado.",
  },
  {
    name: "Conteúdo incorporado",
    purpose: "Executar recursos de terceiros diretamente dentro das páginas.",
  },
] as const;

export default function CookiePolicyPage() {
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
            <span aria-current="page">Política de Cookies</span>
          </nav>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
            Transparência digital
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
            Como este site utiliza cookies
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Esta política apresenta o inventário atual de cookies do site da B&S Veritas e explica
            quais controles serão adotados antes de qualquer uso futuro de tecnologias não
            essenciais.
          </p>
          <p className="mt-6 text-sm font-semibold text-aqua-200">
            Versão 1.0 · Atualizada em 13 de setembro de 2026
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="rounded-2xl border border-aqua-200 bg-aqua-50 p-7 lg:sticky lg:top-24">
            <Cookie aria-hidden="true" className="text-aqua-700" size={30} strokeWidth={1.7} />
            <h2 className="mt-5 font-serif text-2xl font-bold text-navy-950">Situação atual</h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
              {currentStatus.map((item) => (
                <li className="flex gap-3" key={item}>
                  <span
                    aria-hidden="true"
                    className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua-600"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="space-y-10 text-base leading-8 text-slate-700">
            <section aria-labelledby="definicao">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="definicao">
                1. O que são cookies
              </h2>
              <p className="mt-4">
                Cookies são pequenos arquivos ou registros armazenados no dispositivo do visitante
                durante o acesso a um site. Eles podem ser usados para viabilizar funções básicas,
                proteger a navegação, lembrar escolhas, medir uso ou personalizar conteúdo.
              </p>
              <p className="mt-4">
                A Autoridade Nacional de Proteção de Dados distingue cookies necessários, essenciais
                ao funcionamento ou ao serviço solicitado, de cookies não necessários, cuja
                desativação não impede o uso principal da página.
              </p>
            </section>

            <section aria-labelledby="inventario">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="inventario">
                2. Inventário atual
              </h2>
              <p className="mt-4">
                O site institucional não cria cookies próprios nem integra ferramentas de analytics,
                publicidade, rastreamento, personalização ou conteúdo incorporado. A navegação
                também não depende de conta, sessão autenticada ou carrinho.
              </p>
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid gap-2 bg-slate-100 px-5 py-4 font-semibold text-navy-950 sm:grid-cols-[0.8fr_1.2fr_auto]">
                  <span>Categoria</span>
                  <span>Finalidade típica</span>
                  <span>Status</span>
                </div>
                {unusedCategories.map((category) => (
                  <div
                    className="grid gap-2 border-t border-slate-200 px-5 py-4 sm:grid-cols-[0.8fr_1.2fr_auto]"
                    key={category.name}
                  >
                    <span className="font-semibold text-navy-950">{category.name}</span>
                    <span>{category.purpose}</span>
                    <span className="font-semibold text-aqua-700">Não utilizada</span>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="infraestrutura">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="infraestrutura">
                3. Infraestrutura e segurança
              </h2>
              <p className="mt-4">
                O site utiliza a infraestrutura da Cloudflare para hospedagem, entrega de conteúdo e
                proteção. Em determinadas situações, como desafios de segurança ou mitigação de
                tráfego malicioso, a Cloudflare pode definir cookies estritamente necessários para
                comprovar a validação ou manter o serviço protegido.
              </p>
              <p className="mt-4">
                Esses mecanismos não são usados pela B&S Veritas para publicidade, criação de perfis
                comerciais ou acompanhamento do visitante entre sites.
              </p>
              <a
                className="mt-4 inline-flex items-center gap-2 font-semibold text-aqua-700 hover:text-navy-900"
                href="https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Consultar a documentação de cookies da Cloudflare
                <ExternalLink aria-hidden="true" size={16} />
              </a>
            </section>

            <section aria-labelledby="banner">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="banner">
                4. Por que não há banner de cookies
              </h2>
              <p className="mt-4">
                Como a aplicação não utiliza cookies não necessários, não exibimos um banner para
                solicitar escolhas que atualmente não existem. Isso evita interromper a navegação ou
                induzir o visitante a aceitar um tratamento inexistente.
              </p>
              <p className="mt-4">
                A ausência do banner será reavaliada antes da ativação de qualquer recurso que use
                cookies opcionais ou tecnologia equivalente.
              </p>
            </section>

            <section aria-labelledby="mudancas">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="mudancas">
                5. Mudanças futuras e escolhas
              </h2>
              <p className="mt-4">
                Antes de instalar cookies não necessários, atualizaremos este inventário e
                implementaremos controles adequados. Quando a base legal for o consentimento, os
                cookies opcionais permanecerão desativados por padrão e o visitante poderá aceitar,
                rejeitar ou gerenciar categorias de maneira clara.
              </p>
              <p className="mt-4">
                Também será disponibilizado um mecanismo simples para rever a escolha. Nenhum
                recurso opcional será ativado apenas porque o visitante continuou navegando.
              </p>
              <a
                className="mt-4 inline-flex items-center gap-2 font-semibold text-aqua-700 hover:text-navy-900"
                href="https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais"
                rel="noopener noreferrer"
                target="_blank"
              >
                Consultar o guia de cookies da ANPD
                <ExternalLink aria-hidden="true" size={16} />
              </a>
            </section>

            <section aria-labelledby="navegador">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="navegador">
                6. Controles do navegador
              </h2>
              <p className="mt-4">
                Navegadores normalmente permitem visualizar, bloquear ou apagar cookies. O bloqueio
                amplo pode afetar recursos essenciais de outros sites e, se mecanismos de segurança
                forem acionados, pode impedir a conclusão de uma verificação legítima.
              </p>
            </section>

            <section aria-labelledby="privacidade">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="privacidade">
                7. Privacidade e atualizações
              </h2>
              <p className="mt-4">
                Informações sobre dados técnicos, fornecedores, direitos dos titulares e o canal do
                controlador estão na nossa{" "}
                <Link
                  className="font-semibold text-aqua-700 hover:text-navy-900"
                  href="/politica-de-privacidade"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
              <p className="mt-4">
                Esta política será revista quando houver mudança tecnológica, operacional ou legal.
                A versão e a data apresentadas no início identificam o texto vigente.
              </p>
            </section>
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-16 text-white sm:py-20">
        <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <ShieldCheck aria-hidden="true" className="text-aqua-300" size={34} strokeWidth={1.6} />
            <h2 className="mt-5 font-serif text-3xl font-bold">Dúvidas sobre cookies?</h2>
            <p className="mt-4 leading-8 text-slate-300">
              Escreva para {siteConfig.contact.email} com o assunto “Cookies”.
            </p>
          </div>
          <a
            className={buttonStyles({ size: "lg", variant: "outlineDark" })}
            href={`mailto:${siteConfig.contact.email}?subject=Cookies`}
          >
            <Mail aria-hidden="true" size={18} />
            Falar sobre cookies
          </a>
        </Container>
      </section>
    </SiteShell>
  );
}
