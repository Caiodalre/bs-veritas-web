import { ExternalLink, FileText, Mail, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Conheça as condições para acessar e utilizar o site institucional da B&S Veritas.",
  alternates: {
    canonical: "/termos-de-uso",
  },
};

const currentScope = [
  "O site apresenta informações institucionais e gerais sobre seguros.",
  "Não há contratação, pagamento, cadastro ou envio de proposta dentro do site.",
  "O contato pelos canais publicados inicia um atendimento, mas não garante cobertura ou contratação.",
] as const;

const acceptableUse = [
  "acessar o conteúdo para finalidades lícitas e compatíveis com sua natureza institucional;",
  "não interferir no funcionamento, na segurança ou na disponibilidade das páginas;",
  "não tentar obter acesso não autorizado a sistemas, dados ou áreas restritas;",
  "não copiar ou explorar comercialmente o conteúdo e a identidade visual sem autorização ou base legal.",
] as const;

export default function TermsOfUsePage() {
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
            <span aria-current="page">Termos de Uso</span>
          </nav>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
            Uso responsável
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
            Regras para uso deste site
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Estes termos explicam a finalidade do site da B&S Veritas, os limites das informações
            publicadas e as responsabilidades relacionadas ao seu uso.
          </p>
          <p className="mt-6 text-sm font-semibold text-aqua-200">
            Versão 1.0 · Atualizada em 13 de setembro de 2026
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="rounded-2xl border border-aqua-200 bg-aqua-50 p-7 lg:sticky lg:top-24">
            <FileText aria-hidden="true" className="text-aqua-700" size={30} strokeWidth={1.7} />
            <h2 className="mt-5 font-serif text-2xl font-bold text-navy-950">Escopo atual</h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
              {currentScope.map((item) => (
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
            <section aria-labelledby="identificacao">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="identificacao">
                1. Identificação e alcance
              </h2>
              <p className="mt-4">
                Este site é mantido por {siteConfig.legalName}, inscrita no CNPJ sob o nº{" "}
                {siteConfig.cnpj}, com atuação em {siteConfig.location}. Os termos se aplicam ao
                acesso e ao uso do domínio {siteConfig.domain}.
              </p>
              <p className="mt-4">
                Ao navegar pelo site, o visitante deve observar estes termos e a legislação
                aplicável. Se não concordar com alguma condição, poderá interromper o uso e entrar
                em contato para solicitar esclarecimentos.
              </p>
            </section>

            <section aria-labelledby="finalidade">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="finalidade">
                2. Finalidade das informações
              </h2>
              <p className="mt-4">
                O conteúdo possui caráter institucional e informativo. As descrições de seguros
                apresentam exemplos gerais e não substituem análise individual, orientação
                profissional, proposta, condições contratuais, apólice ou comunicação oficial da
                seguradora.
              </p>
              <p className="mt-4">
                As informações podem ser atualizadas para melhorar sua clareza ou refletir mudanças
                operacionais e legais. Em caso de dúvida, confirme as condições vigentes pelos
                canais oficiais antes de tomar uma decisão.
              </p>
            </section>

            <section aria-labelledby="seguros">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="seguros">
                3. Seguros e atendimento
              </h2>
              <p className="mt-4">
                O envio de mensagem, ligação ou conversa por WhatsApp não representa contratação,
                garantia de aceitação do risco, início de cobertura ou confirmação de indenização. A
                contratação depende da análise da seguradora e da emissão dos documentos aplicáveis,
                com coberturas, limites, exclusões, vigência e preço apresentados ao interessado.
              </p>
              <p className="mt-4">
                Em situações de sinistro, as orientações publicadas são apenas primeiros cuidados.
                Devem ser observadas a apólice, as instruções da seguradora e, quando necessário, as
                determinações das autoridades e dos serviços de emergência.
              </p>
            </section>

            <section aria-labelledby="uso-adequado">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="uso-adequado">
                4. Uso adequado
              </h2>
              <p className="mt-4">Ao utilizar o site, o visitante deve:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                {acceptableUse.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="disponibilidade">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="disponibilidade">
                5. Disponibilidade e links externos
              </h2>
              <p className="mt-4">
                Adotamos medidas razoáveis para manter o conteúdo correto, seguro e disponível, mas
                o site pode passar por interrupções, manutenção ou apresentar informações que
                necessitem de correção. Falhas identificadas podem ser comunicadas pelo canal de
                contato.
              </p>
              <p className="mt-4">
                Links para e-mail, WhatsApp, sites de autoridades ou outros serviços levam a
                ambientes administrados por terceiros, sujeitos às próprias condições e políticas. A
                presença de um link não transfere à B&S Veritas o controle sobre esses serviços.
              </p>
            </section>

            <section aria-labelledby="propriedade">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="propriedade">
                6. Propriedade intelectual
              </h2>
              <p className="mt-4">
                Textos, elementos visuais, marca, organização e demais conteúdos próprios são
                protegidos pela legislação aplicável. É permitido consultar e compartilhar links
                para as páginas. Reprodução, alteração ou exploração comercial do conteúdo exige
                autorização, salvo quando a lei permitir.
              </p>
            </section>

            <section aria-labelledby="privacidade">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="privacidade">
                7. Privacidade
              </h2>
              <p className="mt-4">
                O tratamento de informações pessoais e as práticas atuais relacionadas a cookies e
                serviços externos estão descritos na nossa{" "}
                <Link
                  className="font-semibold text-aqua-700 hover:text-navy-900"
                  href="/politica-de-privacidade"
                >
                  Política de Privacidade
                </Link>
                . O atendimento comercial pode ser iniciado por WhatsApp, telefone ou e-mail. O site
                não utiliza analytics nem cookies de marketing.
              </p>
            </section>

            <section aria-labelledby="direitos">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="direitos">
                8. Legislação, direitos e atualizações
              </h2>
              <p className="mt-4">
                Estes termos são interpretados conforme a legislação brasileira. Nenhuma disposição
                pretende excluir ou limitar direitos ou responsabilidades que não possam ser
                afastados por lei, inclusive os direitos assegurados ao consumidor quando houver
                relação de consumo.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <a
                  className="inline-flex items-center gap-2 font-semibold text-aqua-700 hover:text-navy-900"
                  href="https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Consultar o Marco Civil da Internet
                  <ExternalLink aria-hidden="true" size={16} />
                </a>
                <a
                  className="inline-flex items-center gap-2 font-semibold text-aqua-700 hover:text-navy-900"
                  href="https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Consultar o Código de Defesa do Consumidor
                  <ExternalLink aria-hidden="true" size={16} />
                </a>
              </div>
              <p className="mt-4">
                Os termos podem ser atualizados para refletir mudanças no site, na operação ou na
                legislação. A versão e a data exibidas no início identificam o texto vigente.
              </p>
            </section>
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-16 text-white sm:py-20">
        <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <ShieldCheck aria-hidden="true" className="text-aqua-300" size={34} strokeWidth={1.6} />
            <h2 className="mt-5 font-serif text-3xl font-bold">Dúvidas sobre estes termos?</h2>
            <p className="mt-4 leading-8 text-slate-300">
              Entre em contato pelo e-mail {siteConfig.contact.email} com o assunto “Termos de Uso”.
            </p>
          </div>
          <a
            className={buttonStyles({ size: "lg", variant: "outlineDark" })}
            href={`mailto:${siteConfig.contact.email}?subject=Termos%20de%20Uso`}
          >
            <Mail aria-hidden="true" size={18} />
            Falar sobre os termos
          </a>
        </Container>
      </section>
    </SiteShell>
  );
}
