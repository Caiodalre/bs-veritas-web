"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { insuranceCatalog } from "@/features/insurance/catalog";

const turnstileScriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileRenderOptions = {
  sitekey: string;
  action: string;
  theme: "light";
  size: "flexible";
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type SubmissionState = "idle" | "submitting" | "success" | "error";

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-navy-950 shadow-sm outline-none transition placeholder:text-slate-500 hover:border-slate-400 focus:border-aqua-700 focus:ring-3 focus:ring-aqua-200 disabled:cursor-not-allowed disabled:bg-slate-100";

const initialStatusMessage = "Preencha os dados abaixo. Os campos marcados com * são obrigatórios.";

function getFailureMessage(status: number) {
  if (status === 429) {
    return "Recebemos várias tentativas em sequência. Aguarde alguns segundos e tente novamente.";
  }

  if (status === 422) {
    return "Revise os dados informados e tente novamente.";
  }

  return "Não foi possível registrar sua solicitação agora. Tente novamente ou use um dos canais oficiais acima.";
}

export function QuoteForm({ siteKey }: { siteKey?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const [scriptReady, setScriptReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileMessage, setTurnstileMessage] = useState("");
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [statusMessage, setStatusMessage] = useState(initialStatusMessage);

  useEffect(() => {
    const container = turnstileContainerRef.current;
    const turnstile = window.turnstile;

    if (!siteKey || !scriptReady || !container || !turnstile || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = turnstile.render(container, {
      sitekey: siteKey,
      action: "quote",
      theme: "light",
      size: "flexible",
      callback: (token) => {
        setTurnstileToken(token);
        setTurnstileMessage("");
      },
      "error-callback": () => {
        setTurnstileToken("");
        setTurnstileMessage("Não foi possível carregar a verificação. Tente novamente.");
      },
      "expired-callback": () => {
        setTurnstileToken("");
        setTurnstileMessage("A verificação expirou. Confirme novamente para continuar.");
      },
      "timeout-callback": () => {
        setTurnstileToken("");
        setTurnstileMessage("A verificação demorou mais que o esperado. Confirme novamente.");
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = undefined;
      }
    };
  }, [scriptReady, siteKey]);

  function resetTurnstile() {
    setTurnstileToken("");
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submissionState === "submitting") {
      return;
    }

    if (!turnstileToken) {
      setTurnstileMessage("Confirme a verificação de segurança antes de enviar.");
      turnstileContainerRef.current?.focus();
      return;
    }

    setSubmissionState("submitting");
    setStatusMessage("Enviando sua solicitação com segurança…");

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      insuranceType: String(formData.get("insuranceType") ?? ""),
      city: String(formData.get("city") ?? ""),
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""),
      turnstileToken,
    };

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setSubmissionState("error");
        setStatusMessage(getFailureMessage(response.status));
        resetTurnstile();
        return;
      }

      formRef.current?.reset();
      setSubmissionState("success");
      setStatusMessage(
        "Solicitação recebida. A equipe da B&S Veritas entrará em contato pelos dados informados.",
      );
      resetTurnstile();
    } catch {
      setSubmissionState("error");
      setStatusMessage(
        "Não foi possível conectar agora. Tente novamente ou use um dos canais oficiais acima.",
      );
      resetTurnstile();
    }
  }

  if (!siteKey) {
    return null;
  }

  const fieldsDisabled = submissionState === "submitting";

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        onError={() =>
          setTurnstileMessage(
            "Não foi possível carregar a verificação de segurança. Atualize a página e tente novamente.",
          )
        }
        onReady={() => setScriptReady(true)}
        src={turnstileScriptUrl}
        strategy="afterInteractive"
      />
      <form
        className="rounded-2xl border border-border bg-white p-6 shadow-[0_18px_55px_rgba(7,24,39,0.07)] sm:p-8"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <label className="text-sm font-semibold text-navy-950">
            Nome completo *
            <input
              autoComplete="name"
              className={fieldClassName}
              disabled={fieldsDisabled}
              maxLength={150}
              name="fullName"
              required
              type="text"
            />
          </label>

          <label className="text-sm font-semibold text-navy-950">
            Telefone com DDD *
            <input
              autoComplete="tel"
              className={fieldClassName}
              disabled={fieldsDisabled}
              inputMode="tel"
              maxLength={32}
              name="phone"
              placeholder="(11) 99999-9999"
              required
              type="tel"
            />
          </label>

          <label className="text-sm font-semibold text-navy-950">
            E-mail *
            <input
              autoComplete="email"
              className={fieldClassName}
              disabled={fieldsDisabled}
              maxLength={254}
              name="email"
              required
              type="email"
            />
          </label>

          <label className="text-sm font-semibold text-navy-950">
            Seguro de interesse *
            <select
              className={fieldClassName}
              defaultValue=""
              disabled={fieldsDisabled}
              name="insuranceType"
              required
            >
              <option disabled value="">
                Selecione uma modalidade
              </option>
              {insuranceCatalog.map(({ name, slug }) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-navy-950 md:col-span-2">
            Cidade
            <input
              autoComplete="address-level2"
              className={fieldClassName}
              disabled={fieldsDisabled}
              maxLength={120}
              name="city"
              type="text"
            />
          </label>

          <label className="text-sm font-semibold text-navy-950 md:col-span-2">
            Como podemos ajudar?
            <textarea
              className={`${fieldClassName} min-h-32 py-3`}
              disabled={fieldsDisabled}
              maxLength={1000}
              name="message"
              placeholder="Conte, sem incluir dados sensíveis, o que você deseja proteger."
            />
          </label>
        </div>

        <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label>
            Não preencha este campo
            <input autoComplete="off" name="website" tabIndex={-1} type="text" />
          </label>
        </div>

        <p className="mt-6 text-sm leading-6 text-slate-600">
          Não envie CPF, documentos, dados bancários, informações médicas ou dados completos de
          apólices. Ao enviar, você declara ciência da nossa{" "}
          <Link
            className="font-semibold text-aqua-700 underline hover:text-aqua-600"
            href="/politica-de-privacidade"
          >
            Política de Privacidade
          </Link>
          , incluindo a retenção aplicável por até cinco anos.
        </p>

        <div className="mt-6 max-w-full">
          <div
            aria-label="Verificação de segurança"
            className="min-h-[65px] max-w-full rounded-md outline-none focus-visible:ring-3 focus-visible:ring-aqua-300"
            ref={turnstileContainerRef}
            tabIndex={-1}
          />
          {turnstileMessage ? (
            <p className="mt-2 text-sm font-semibold text-red-700" role="alert">
              {turnstileMessage}
            </p>
          ) : null}
        </div>

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button disabled={fieldsDisabled} size="lg" type="submit">
            {fieldsDisabled ? "Enviando…" : "Solicitar cotação"}
          </Button>
          <p
            aria-live="polite"
            className={`text-sm leading-6 ${submissionState === "error" ? "font-semibold text-red-700" : "text-slate-600"}`}
            role="status"
          >
            {statusMessage}
          </p>
        </div>
      </form>
    </>
  );
}
