import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect, type ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isQuoteSubmissionEnabled,
  resolveTurnstileSiteKey,
  turnstileSiteKeys,
} from "@/features/quote/turnstile-site-key";
import { QuoteForm } from "./quote-form";

vi.mock("next/script", () => {
  function MockScript({ onReady }: ComponentProps<"script"> & { onReady?: () => void }) {
    useEffect(() => {
      onReady?.();
    }, [onReady]);
    return null;
  }

  return { default: MockScript };
});

type RenderOptions = Parameters<NonNullable<Window["turnstile"]>["render"]>[1];

let renderOptions: RenderOptions;
let reset: ReturnType<typeof vi.fn<(widgetId: string) => void>>;
let turnstile: NonNullable<Window["turnstile"]>;

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Nome completo *"), {
    target: { value: "Pessoa Exemplo" },
  });
  fireEvent.change(screen.getByLabelText("Telefone com DDD *"), {
    target: { value: "(11) 99999-0000" },
  });
  fireEvent.change(screen.getByLabelText("E-mail *"), {
    target: { value: "pessoa@example.invalid" },
  });
  fireEvent.change(screen.getByLabelText("Seguro de interesse *"), {
    target: { value: "auto" },
  });
}

describe("QuoteForm", () => {
  beforeEach(() => {
    reset = vi.fn<(widgetId: string) => void>();
    turnstile = {
      render: vi.fn((_container, options) => {
        renderOptions = options;
        return "quote-widget";
      }),
      reset,
      remove: vi.fn(),
    };
    window.turnstile = turnstile;
    vi.stubGlobal("fetch", vi.fn());
  });

  it("resolve a chave pública local sem depender do ambiente de build", async () => {
    render(<QuoteForm />);

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledOnce());
    expect(renderOptions.sitekey).toBe(turnstileSiteKeys.local);
    expect(screen.getByRole("button", { name: "Solicitar cotação" })).toBeEnabled();
  });

  it("envia somente após a verificação e confirma o recebimento", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ data: { id: "quote-id" } }, { status: 201 }),
    );
    render(<QuoteForm siteKey="test-site-key" />);

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledOnce());
    expect(renderOptions.action).toBe("quote");
    expect(renderOptions.sitekey).toBe("test-site-key");

    fillRequiredFields();
    await act(async () => renderOptions.callback("verified-token"));
    fireEvent.click(screen.getByRole("button", { name: "Solicitar cotação" }));

    await screen.findByText(/Solicitação recebida/);
    expect(fetch).toHaveBeenCalledOnce();
    const [, request] = vi.mocked(fetch).mock.calls[0] ?? [];
    expect(JSON.parse(String(request?.body))).toMatchObject({
      fullName: "Pessoa Exemplo",
      phone: "(11) 99999-0000",
      email: "pessoa@example.invalid",
      insuranceType: "auto",
      website: "",
      turnstileToken: "verified-token",
    });
    expect(reset).toHaveBeenCalledWith("quote-widget");
  });

  it("orienta a confirmar a verificação antes do envio", async () => {
    render(<QuoteForm siteKey="test-site-key" />);
    await waitFor(() => expect(turnstile.render).toHaveBeenCalledOnce());
    fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "Solicitar cotação" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Confirme a verificação de segurança antes de enviar.",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("informa o limite e exige uma nova verificação", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({}, { status: 429 }));
    render(<QuoteForm siteKey="test-site-key" />);
    await waitFor(() => expect(turnstile.render).toHaveBeenCalledOnce());
    fillRequiredFields();
    await act(async () => renderOptions.callback("verified-token"));

    fireEvent.click(screen.getByRole("button", { name: "Solicitar cotação" }));

    expect(await screen.findByText(/várias tentativas em sequência/)).toBeInTheDocument();
    expect(reset).toHaveBeenCalledWith("quote-widget");
  });
});

describe("resolveTurnstileSiteKey", () => {
  it("seleciona as chaves públicas por hostname conhecido", () => {
    expect(resolveTurnstileSiteKey("bsveritas.com.br")).toBe(turnstileSiteKeys.production);
    expect(resolveTurnstileSiteKey("www.bsveritas.com.br")).toBe(turnstileSiteKeys.production);
    expect(
      resolveTurnstileSiteKey("quote-preview-bs-veritas-web-preview.caio-dalre.workers.dev"),
    ).toBe(turnstileSiteKeys.preview);
    expect(resolveTurnstileSiteKey("localhost")).toBe(turnstileSiteKeys.local);
  });

  it("não ativa o formulário em hostnames desconhecidos", () => {
    expect(resolveTurnstileSiteKey("example.com")).toBeUndefined();
    expect(resolveTurnstileSiteKey("bs-veritas-web.caio-dalre.workers.dev")).toBeUndefined();
  });

  it("habilita persistência somente em produção e no ambiente local", () => {
    expect(isQuoteSubmissionEnabled("bsveritas.com.br")).toBe(true);
    expect(isQuoteSubmissionEnabled("www.bsveritas.com.br")).toBe(true);
    expect(isQuoteSubmissionEnabled("localhost")).toBe(true);
    expect(
      isQuoteSubmissionEnabled("quote-preview-bs-veritas-web-preview.caio-dalre.workers.dev"),
    ).toBe(false);
    expect(isQuoteSubmissionEnabled("example.com")).toBe(false);
  });
});
