"use client";

import { CalendarClock, Inbox, Mail, MapPin, Phone, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getInsuranceBySlug } from "@/features/insurance/catalog";
import {
  quoteAdminStatusLabels,
  quoteAdminStatuses,
  type QuoteAdminItem,
  type QuoteAdminStatus,
} from "@/features/quote-admin/model";

const collectionEndpoint = "/api/admin/campaigns/quote-requests";
const fieldClassName =
  "min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-950 shadow-sm outline-none transition hover:border-slate-400 focus:border-aqua-700 focus:ring-3 focus:ring-aqua-200 disabled:cursor-not-allowed disabled:bg-slate-100";

type QuoteAdminPayload = {
  items?: QuoteAdminItem[];
  nextCursor?: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorMessage(status: number) {
  if (status === 401)
    return "Sua sessão administrativa expirou. Atualize a página e entre novamente.";
  if (status === 404) return "A solicitação não está mais disponível.";
  if (status === 422) return "A situação selecionada não é válida.";
  return "Não foi possível consultar as solicitações agora.";
}

function getStatusClassName(status: QuoteAdminStatus) {
  if (status === "new") return "bg-sky-100 text-sky-800";
  if (status === "contacted") return "bg-amber-100 text-amber-900";
  return "bg-emerald-100 text-emerald-800";
}

export function QuoteRequestAdmin() {
  const [items, setItems] = useState<readonly QuoteAdminItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | QuoteAdminStatus>("all");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [updatingId, setUpdatingId] = useState<string>();
  const [message, setMessage] = useState("Carregando solicitações…");

  const loadRequests = useCallback(
    async ({
      append = false,
      cursor,
      signal,
    }: {
      append?: boolean;
      cursor?: string;
      signal?: AbortSignal;
    } = {}) => {
      const query = new URLSearchParams();
      if (statusFilter !== "all") query.set("status", statusFilter);
      if (cursor) query.set("cursor", cursor);

      try {
        const response = await fetch(`${collectionEndpoint}?${query.toString()}`, {
          headers: { accept: "application/json" },
          signal,
        });
        if (!response.ok) throw new Error(String(response.status));

        const payload = (await response.json()) as QuoteAdminPayload;
        const receivedItems = Array.isArray(payload.items) ? payload.items : [];
        setItems((current) => (append ? [...current, ...receivedItems] : receivedItems));
        setNextCursor(typeof payload.nextCursor === "string" ? payload.nextCursor : null);
        setMessage(
          receivedItems.length === 0 && !append
            ? "Nenhuma solicitação encontrada neste filtro."
            : "Lista atualizada.",
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        const status = error instanceof Error ? Number(error.message) : 0;
        setMessage(getErrorMessage(status));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => void loadRequests({ signal: controller.signal }), 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [loadRequests]);

  async function updateStatus(item: QuoteAdminItem, status: QuoteAdminStatus) {
    if (item.status === status || updatingId) return;

    setUpdatingId(item.id);
    setMessage(`Alterando para “${quoteAdminStatusLabels[status]}”…`);
    try {
      const response = await fetch(`${collectionEndpoint}/${item.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(String(response.status));

      setItems((current) => {
        if (statusFilter !== "all" && statusFilter !== status) {
          return current.filter((currentItem) => currentItem.id !== item.id);
        }

        return current.map((currentItem) =>
          currentItem.id === item.id ? { ...currentItem, status } : currentItem,
        );
      });
      setMessage("Situação atualizada com sucesso.");
    } catch (error) {
      const statusCode = error instanceof Error ? Number(error.message) : 0;
      setMessage(getErrorMessage(statusCode));
    } finally {
      setUpdatingId(undefined);
    }
  }

  return (
    <section aria-labelledby="quote-admin-title">
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-5 shadow-[0_18px_55px_rgba(7,24,39,0.07)] sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
            <Inbox aria-hidden="true" size={22} />
          </span>
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-950" id="quote-admin-title">
              Solicitações recebidas
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Consulte os pedidos protegidos e registre o andamento do atendimento. Os dados seguem
              a política automática de retenção.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="text-sm font-semibold text-navy-950">
            Filtrar por situação
            <select
              className={`${fieldClassName} mt-2 w-full sm:w-52`}
              onChange={(event) => {
                setItems([]);
                setNextCursor(null);
                setLoading(true);
                setMessage("Carregando solicitações…");
                setStatusFilter(event.currentTarget.value as "all" | QuoteAdminStatus);
              }}
              value={statusFilter}
            >
              <option value="all">Todas</option>
              {quoteAdminStatuses.map((status) => (
                <option key={status} value={status}>
                  {quoteAdminStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <Button
            disabled={loading || loadingMore}
            onClick={() => {
              setLoading(true);
              setMessage("Atualizando lista…");
              void loadRequests();
            }}
            size="sm"
            variant="subtle"
          >
            <RefreshCw aria-hidden="true" size={16} /> Atualizar
          </Button>
        </div>
      </div>

      <p aria-live="polite" className="mt-5 text-sm leading-6 text-slate-600" role="status">
        {message}
      </p>

      <div className="mt-5 grid gap-5">
        {!loading && items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-aqua-300 bg-white p-8 text-center text-sm leading-6 text-slate-600">
            Nenhuma solicitação disponível.
          </div>
        ) : null}

        {items.map((item) => {
          const insurance = getInsuranceBySlug(item.insuranceType);
          return (
            <article
              className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"
              key={item.id}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClassName(item.status)}`}
                    >
                      {quoteAdminStatusLabels[item.status]}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {insurance?.name ?? item.insuranceType}
                    </span>
                  </div>
                  <h3 className="mt-3 break-words font-serif text-xl font-bold text-navy-950">
                    {item.fullName}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 text-xs leading-5 text-slate-500">
                    <CalendarClock aria-hidden="true" size={15} /> Recebida em{" "}
                    {formatDate(item.createdAt)}
                  </p>
                </div>

                <div
                  className="flex flex-wrap gap-2"
                  aria-label={`Alterar situação de ${item.fullName}`}
                >
                  {quoteAdminStatuses.map((status) => (
                    <Button
                      aria-pressed={item.status === status}
                      disabled={Boolean(updatingId)}
                      key={status}
                      onClick={() => void updateStatus(item, status)}
                      size="sm"
                      variant={item.status === status ? "primary" : "subtle"}
                    >
                      {quoteAdminStatusLabels[status]}
                    </Button>
                  ))}
                </div>
              </div>

              <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-5 text-sm sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <dt className="flex items-center gap-2 font-semibold text-navy-950">
                    <Phone aria-hidden="true" size={16} /> Telefone
                  </dt>
                  <dd className="mt-1 break-all text-slate-600">
                    <a className="hover:text-aqua-700 hover:underline" href={`tel:${item.phone}`}>
                      {item.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-semibold text-navy-950">
                    <Mail aria-hidden="true" size={16} /> E-mail
                  </dt>
                  <dd className="mt-1 break-all text-slate-600">
                    <a
                      className="hover:text-aqua-700 hover:underline"
                      href={`mailto:${item.email}`}
                    >
                      {item.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-semibold text-navy-950">
                    <MapPin aria-hidden="true" size={16} /> Cidade
                  </dt>
                  <dd className="mt-1 break-words text-slate-600">
                    {item.city ?? "Não informada"}
                  </dd>
                </div>
              </dl>

              {item.message ? (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-navy-950">Mensagem</p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                    {item.message}
                  </p>
                </div>
              ) : null}

              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0" size={15} />
                Exclusão automática prevista para {formatDate(item.retentionExpiresAt)}.
              </p>
            </article>
          );
        })}
      </div>

      {nextCursor ? (
        <div className="mt-7 flex justify-center">
          <Button
            disabled={loadingMore}
            onClick={() => {
              setLoadingMore(true);
              setMessage("Carregando mais solicitações…");
              void loadRequests({ append: true, cursor: nextCursor });
            }}
            variant="subtle"
          >
            {loadingMore ? "Carregando…" : "Carregar mais"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
