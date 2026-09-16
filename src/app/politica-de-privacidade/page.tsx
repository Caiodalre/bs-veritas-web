import { ExternalLink, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonStyles } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Entenda como a B&S Veritas trata informações pessoais e como exercer seus direitos.",
  alternates: {
    canonical: "/politica-de-privacidade",
  },
};

const currentPractices = [
  "WhatsApp, telefone e e-mail são os canais disponíveis para iniciar o atendimento.",
  "O formulário só recebe um pedido quando está habilitado e você o envia.",
  "Não utilizamos analytics, publicidade comportamental ou cookies de marketing.",
  "O atendimento começa quando você escolhe entrar em contato.",
] as const;

const dataPurposes = [
  "responder dúvidas e solicitações de atendimento ou cotação;",
  "adotar providências solicitadas antes de uma eventual contratação;",
  "manter a segurança dos canais, prevenir abusos e solucionar falhas técnicas;",
  "cumprir obrigações legais ou regulatórias e exercer direitos em processos.",
] as const;

const holderRights = [
  "confirmar a existência de tratamento e solicitar acesso aos dados;",
  "pedir a correção de informações incompletas, inexatas ou desatualizadas;",
  "solicitar anonimização, bloqueio ou eliminação quando cabível;",
  "obter informações sobre compartilhamentos e sobre as consequências de eventual negativa de consentimento;",
  "revogar o consentimento ou se opor ao tratamento nas situações previstas em lei.",
] as const;

export default function PrivacyPolicyPage() {
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
            <span aria-current="page">Política de Privacidade</span>
          </nav>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-aqua-300">
            Privacidade e dados
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
            Como tratamos informações pessoais
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Esta política explica, de forma clara, como a B&S Veritas protege informações
            relacionadas aos visitantes do site e às pessoas que iniciam contato pelos nossos canais
            oficiais.
          </p>
          <p className="mt-6 text-sm font-semibold text-aqua-200">
            Versão 1.1 · Atualizada em 15 de setembro de 2026
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="rounded-2xl border border-aqua-200 bg-aqua-50 p-7 lg:sticky lg:top-24">
            <ShieldCheck aria-hidden="true" className="text-aqua-700" size={30} strokeWidth={1.7} />
            <h2 className="mt-5 font-serif text-2xl font-bold text-navy-950">Resumo atual</h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
              {currentPractices.map((practice) => (
                <li className="flex gap-3" key={practice}>
                  <span
                    aria-hidden="true"
                    className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua-600"
                  />
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="space-y-10 text-base leading-8 text-slate-700">
            <section aria-labelledby="controlador">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="controlador">
                1. Controlador e alcance
              </h2>
              <p className="mt-4">
                A controladora das informações descritas nesta política é {siteConfig.legalName},
                inscrita no CNPJ sob o nº {siteConfig.cnpj}, com atuação em {siteConfig.location}.
                Esta política se aplica ao site {siteConfig.domain} e aos contatos iniciados pelos
                canais nele publicados.
              </p>
              <p className="mt-4">
                Serviços externos acessados pelo visitante, como o aplicativo de mensagens e o
                provedor de e-mail, também possuem regras próprias de privacidade.
              </p>
            </section>

            <section aria-labelledby="informacoes">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="informacoes">
                2. Informações tratadas
              </h2>
              <p className="mt-4">
                Quando você decide falar conosco por telefone, e-mail ou WhatsApp, podemos receber
                os dados que escolher compartilhar, como nome, contato e informações necessárias
                para compreender sua solicitação.
              </p>
              <p className="mt-4">
                Se o formulário de cotação estiver habilitado no site e você optar por enviá-lo, ele
                pedirá nome, telefone, e-mail e modalidade de seguro; cidade e mensagem serão
                opcionais. Sem formulário habilitado, não há envio de pedido por esse canal.
              </p>
              <p className="mt-4">
                Para disponibilizar e proteger as páginas, prestadores de infraestrutura podem
                processar dados técnicos de conexão, como endereço IP, data e hora do acesso,
                endereço solicitado, características do navegador ou dispositivo e sinais de
                segurança. Esses dados não são usados pela B&S Veritas para publicidade
                personalizada.
              </p>
              <div className="mt-5 rounded-xl border border-aqua-200 bg-aqua-50 p-5">
                <p className="font-semibold text-navy-950">
                  Não envie CPF, documentos, dados bancários, informações médicas ou dados completos
                  de apólices no primeiro contato.
                </p>
              </div>
            </section>

            <section aria-labelledby="finalidades">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="finalidades">
                3. Finalidades e bases legais
              </h2>
              <p className="mt-4">As informações podem ser utilizadas para:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                {dataPurposes.map((purpose) => (
                  <li key={purpose}>{purpose}</li>
                ))}
              </ul>
              <p className="mt-4">
                Conforme o contexto, o tratamento poderá se apoiar na execução de procedimentos
                preliminares ou de contrato, no cumprimento de obrigação legal ou regulatória, no
                legítimo interesse relacionado à segurança e ao atendimento e no exercício regular
                de direitos. Quando a lei exigir consentimento, ele será solicitado de forma
                específica.
              </p>
            </section>

            <section aria-labelledby="compartilhamento">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="compartilhamento">
                4. Compartilhamento e tratamento internacional
              </h2>
              <p className="mt-4">
                Informações podem ser compartilhadas, no limite necessário, com prestadores de
                hospedagem, segurança e comunicação; com seguradoras ou prestadores envolvidos no
                atendimento solicitado; e com autoridades quando houver obrigação legal ou ordem
                válida. Não vendemos dados pessoais.
              </p>
              <p className="mt-4">
                Alguns fornecedores de tecnologia podem processar dados em outros países. Quando
                isso ocorrer, serão observadas as exigências e salvaguardas aplicáveis à
                transferência internacional de dados.
              </p>
            </section>

            <section aria-labelledby="retencao">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="retencao">
                5. Retenção
              </h2>
              <p className="mt-4">
                As informações são mantidas somente pelo período necessário para atender a
                solicitação, conduzir uma relação pré-contratual ou contratual, cumprir obrigações
                legais e regulatórias ou exercer direitos. Encerradas essas finalidades e os prazos
                aplicáveis, os dados são eliminados ou anonimizados quando cabível.
              </p>
              <p className="mt-4">
                Cada solicitação recebida por um formulário de cotação habilitado terá prazo de
                armazenamento de cinco anos corridos, contado do recebimento. No vencimento, o
                registro deverá ser eliminado ou anonimizado, ressalvadas as hipóteses de
                conservação previstas na LGPD e as obrigações legais ou regulatórias aplicáveis.
                Esse prazo específico não é atribuído automaticamente às conversas iniciadas por
                WhatsApp, telefone ou e-mail.
              </p>
              <p className="mt-4">
                Dúvidas sobre retenção de informações recebidas pelos canais de atendimento podem
                ser encaminhadas ao e-mail de privacidade indicado nesta página.
              </p>
            </section>

            <section aria-labelledby="direitos">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="direitos">
                6. Direitos do titular
              </h2>
              <p className="mt-4">Nos termos da LGPD, você pode, quando aplicável:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                {holderRights.map((right) => (
                  <li key={right}>{right}</li>
                ))}
              </ul>
              <p className="mt-4">
                A solicitação será analisada com segurança, e poderemos pedir informações adicionais
                apenas para confirmar sua identidade e proteger seus dados.
              </p>
              <a
                className="mt-4 inline-flex items-center gap-2 font-semibold text-aqua-700 hover:text-navy-900"
                href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares"
                rel="noopener noreferrer"
                target="_blank"
              >
                Conheça os direitos explicados pela ANPD
                <ExternalLink aria-hidden="true" size={16} />
              </a>
            </section>

            <section aria-labelledby="cookies">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="cookies">
                7. Cookies e serviços externos
              </h2>
              <p className="mt-4">
                O site não instala cookies de analytics, publicidade, personalização ou marketing.
                Por isso, não há um banner de consentimento para cookies não essenciais. Prestadores
                de infraestrutura podem utilizar mecanismos estritamente necessários à entrega e à
                segurança das páginas.
              </p>
              <p className="mt-4">
                Se novas tecnologias de rastreamento forem propostas, esta política e os controles
                de escolha serão revistos antes da ativação.
              </p>
              <Link
                className="mt-4 inline-flex font-semibold text-aqua-700 hover:text-navy-900"
                href="/politica-de-cookies"
              >
                Consulte o inventário atual na Política de Cookies
              </Link>
            </section>

            <section aria-labelledby="seguranca">
              <h2 className="font-serif text-3xl font-bold text-navy-950" id="seguranca">
                8. Segurança e atualizações
              </h2>
              <p className="mt-4">
                Adotamos medidas técnicas e organizacionais proporcionais aos riscos para reduzir
                acessos não autorizados, perdas, alterações ou divulgações indevidas. Nenhum sistema
                conectado à internet é completamente isento de risco.
              </p>
              <p className="mt-4">
                Esta política poderá ser atualizada para refletir mudanças legais, operacionais ou
                tecnológicas. A versão e a data exibidas no início indicarão a atualização vigente.
              </p>
            </section>
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-16 text-white sm:py-20">
        <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <LockKeyhole aria-hidden="true" className="text-aqua-300" size={34} strokeWidth={1.6} />
            <h2 className="mt-5 font-serif text-3xl font-bold">
              Canal para assuntos de privacidade
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              Para exercer direitos ou esclarecer dúvidas, escreva para {siteConfig.contact.email}{" "}
              com o assunto “Privacidade”.
            </p>
          </div>
          <a
            className={buttonStyles({ size: "lg", variant: "outlineDark" })}
            href={`mailto:${siteConfig.contact.email}?subject=Privacidade`}
          >
            <Mail aria-hidden="true" size={18} />
            Falar sobre privacidade
          </a>
        </Container>
      </section>
    </SiteShell>
  );
}
