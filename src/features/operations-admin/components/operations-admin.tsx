"use client";

import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Pencil,
  RefreshCw,
  Save,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { insuranceCatalog } from "@/features/insurance/catalog";
import {
  payoutStatusLabels,
  staffRoleLabels,
  type InsuranceSale,
  type InsuranceSaleInput,
  type OperationsSession,
  type OperationsSummary,
  type PayoutStatus,
  type StaffMember,
  type StaffRole,
} from "@/features/operations-admin/model";

const endpoint = "/api/admin/campaigns/operations";
const fieldClassName =
  "mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-950 shadow-sm outline-none transition hover:border-slate-400 focus:border-aqua-700 focus:ring-3 focus:ring-aqua-200 disabled:cursor-not-allowed disabled:bg-slate-100";

type StaffForm = { name: string; email: string; role: StaffRole };
type SaleForm = InsuranceSaleInput;

const emptyStaffForm: StaffForm = { name: "", email: "", role: "employee" };

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptySaleForm(staffMemberId = ""): SaleForm {
  return {
    soldAt: today(),
    staffMemberId,
    customerName: "",
    insurer: "",
    insuranceType: "auto",
    premiumAmount: "",
    brokerageCommissionAmount: "",
    employeePayoutAmount: "",
    payoutStatus: "pending",
  };
}

function formatMoney(value: string) {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(number)
    : "—";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(`${value}T12:00:00Z`),
  );
}

async function readError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: { message?: string } };
    return payload.error?.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${endpoint}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as T;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-3 font-serif text-2xl font-bold text-navy-950">{value}</p>
    </div>
  );
}

export function OperationsAdmin() {
  const [session, setSession] = useState<OperationsSession>();
  const [staff, setStaff] = useState<readonly StaffMember[]>([]);
  const [sales, setSales] = useState<readonly InsuranceSale[]>([]);
  const [summary, setSummary] = useState<OperationsSummary>();
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState<StaffForm>(emptyStaffForm);
  const [saleForm, setSaleForm] = useState<SaleForm>(() => emptySaleForm());
  const [editingSaleId, setEditingSaleId] = useState<string>();
  const [bootstrapName, setBootstrapName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Validando acesso…");

  const activeStaff = useMemo(() => staff.filter((member) => member.active), [staff]);

  const loadWorkspace = useCallback(async () => {
    const [staffPayload, salesPayload, summaryPayload] = await Promise.all([
      api<{ items: StaffMember[] }>("/staff"),
      api<{ items: InsuranceSale[]; nextCursor: string | null }>("/sales"),
      api<{ summary: OperationsSummary }>("/summary"),
    ]);
    setStaff(staffPayload.items);
    setSales(salesPayload.items);
    setNextCursor(salesPayload.nextCursor);
    setSummary(summaryPayload.summary);
    setSaleForm((current) =>
      current.staffMemberId || staffPayload.items.length === 0
        ? current
        : { ...current, staffMemberId: staffPayload.items.find((item) => item.active)?.id ?? "" },
    );
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const payload = await api<OperationsSession>("/session");
      setSession(payload);
      if (payload.authorized) {
        await loadWorkspace();
        setMessage("Painel atualizado.");
      } else {
        setMessage(
          payload.bootstrapAvailable
            ? "Defina o primeiro administrador para ativar o painel."
            : "Seu e-mail não está cadastrado como administrador ativo.",
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível validar o acesso.");
    }
  }, [loadWorkspace]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadSession(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadSession]);

  async function bootstrap(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api("/bootstrap", { method: "POST", body: JSON.stringify({ name: bootstrapName }) });
      setMessage("Administrador inicial criado.");
      await loadSession();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível ativar o painel.");
    } finally {
      setBusy(false);
    }
  }

  async function createStaff(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api("/staff", { method: "POST", body: JSON.stringify(staffForm) });
      setStaffForm(emptyStaffForm);
      await loadWorkspace();
      setMessage("Funcionário cadastrado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível cadastrar.");
    } finally {
      setBusy(false);
    }
  }

  async function updateStaff(member: StaffMember, changes: Partial<StaffMember>) {
    setBusy(true);
    try {
      await api(`/staff/${member.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          role: member.role,
          active: member.active,
          ...changes,
        }),
      });
      await loadWorkspace();
      setMessage("Funcionário atualizado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível atualizar.");
    } finally {
      setBusy(false);
    }
  }

  async function saveSale(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api(editingSaleId ? `/sales/${editingSaleId}` : "/sales", {
        method: editingSaleId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...saleForm,
          policyNumber: saleForm.policyNumber || undefined,
          notes: saleForm.notes || undefined,
        }),
      });
      setEditingSaleId(undefined);
      setSaleForm(emptySaleForm(activeStaff[0]?.id));
      await loadWorkspace();
      setMessage(
        editingSaleId
          ? "Seguro atualizado com histórico registrado."
          : "Seguro fechado registrado.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar o seguro.");
    } finally {
      setBusy(false);
    }
  }

  function editSale(sale: InsuranceSale) {
    setEditingSaleId(sale.id);
    setSaleForm({
      soldAt: sale.soldAt,
      staffMemberId: sale.staffMemberId,
      customerName: sale.customerName,
      insurer: sale.insurer,
      insuranceType: sale.insuranceType,
      policyNumber: sale.policyNumber,
      premiumAmount: sale.premiumAmount,
      brokerageCommissionAmount: sale.brokerageCommissionAmount,
      employeePayoutAmount: sale.employeePayoutAmount,
      payoutStatus: sale.payoutStatus,
      notes: sale.notes,
    });
    document.getElementById("sale-form")?.scrollIntoView({ behavior: "smooth" });
  }

  async function loadMore() {
    if (!nextCursor) return;
    setBusy(true);
    try {
      const payload = await api<{ items: InsuranceSale[]; nextCursor: string | null }>(
        `/sales?cursor=${encodeURIComponent(nextCursor)}`,
      );
      setSales((current) => [...current, ...payload.items]);
      setNextCursor(payload.nextCursor);
      setMessage("Mais registros carregados.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível carregar mais.");
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return (
      <p className="rounded-2xl border border-border bg-white p-6 text-slate-600">{message}</p>
    );
  }

  if (!session.authorized) {
    return (
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <ShieldCheck className="text-aqua-700" aria-hidden="true" />
        <h2 className="mt-4 font-serif text-2xl font-bold text-navy-950">Acesso ao painel</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        {session.bootstrapAvailable ? (
          <form className="mt-6 max-w-md" onSubmit={bootstrap}>
            <label className="text-sm font-semibold text-navy-950">
              Nome do administrador inicial
              <input
                className={fieldClassName}
                maxLength={150}
                minLength={2}
                onChange={(event) => setBootstrapName(event.currentTarget.value)}
                required
                value={bootstrapName}
              />
            </label>
            <Button className="mt-4" disabled={busy} type="submit">
              Ativar painel
            </Button>
          </form>
        ) : null}
      </section>
    );
  }

  return (
    <section aria-labelledby="operations-title">
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-5 shadow-[0_18px_55px_rgba(7,24,39,0.07)] sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
            <BriefcaseBusiness aria-hidden="true" size={22} />
          </span>
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-950" id="operations-title">
              Controle comercial
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Registre responsáveis, valores e repasses. Toda alteração financeira gera histórico de
              auditoria.
            </p>
          </div>
        </div>
        <Button
          disabled={busy}
          onClick={() => void loadWorkspace().then(() => setMessage("Painel atualizado."))}
          size="sm"
          variant="subtle"
        >
          <RefreshCw aria-hidden="true" size={16} /> Atualizar
        </Button>
      </div>

      <p aria-live="polite" className="mt-5 text-sm text-slate-600" role="status">
        {message}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Seguros fechados" value={String(summary?.saleCount ?? 0)} />
        <SummaryCard label="Prêmios" value={formatMoney(summary?.premiumAmount ?? "0")} />
        <SummaryCard
          label="Comissão"
          value={formatMoney(summary?.brokerageCommissionAmount ?? "0")}
        />
        <SummaryCard label="Repasses" value={formatMoney(summary?.employeePayoutAmount ?? "0")} />
        <SummaryCard
          label="Repasse pendente"
          value={formatMoney(summary?.pendingPayoutAmount ?? "0")}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Users aria-hidden="true" className="text-aqua-700" size={20} />
            <h3 className="font-serif text-xl font-bold text-navy-950">Funcionários</h3>
          </div>
          <form className="mt-5 grid gap-4" onSubmit={createStaff}>
            <label className="text-sm font-semibold text-navy-950">
              Nome
              <input
                className={fieldClassName}
                maxLength={150}
                minLength={2}
                onChange={(event) =>
                  setStaffForm((current) => ({ ...current, name: event.currentTarget.value }))
                }
                required
                value={staffForm.name}
              />
            </label>
            <label className="text-sm font-semibold text-navy-950">
              E-mail
              <input
                className={fieldClassName}
                maxLength={254}
                onChange={(event) =>
                  setStaffForm((current) => ({ ...current, email: event.currentTarget.value }))
                }
                required
                type="email"
                value={staffForm.email}
              />
            </label>
            <label className="text-sm font-semibold text-navy-950">
              Função
              <select
                className={fieldClassName}
                onChange={(event) =>
                  setStaffForm((current) => ({
                    ...current,
                    role: event.currentTarget.value as StaffRole,
                  }))
                }
                value={staffForm.role}
              >
                <option value="employee">Funcionário</option>
                <option value="administrator">Administrador</option>
              </select>
            </label>
            <Button disabled={busy} type="submit">
              <UserPlus aria-hidden="true" size={16} /> Adicionar funcionário
            </Button>
          </form>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Para entrar no painel, um administrador também precisa ter o e-mail autorizado na
            política do Cloudflare Access.
          </p>

          <div className="mt-6 grid gap-3">
            {staff.map((member) => (
              <article className="rounded-xl border border-slate-200 p-4" key={member.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-950">{member.name}</p>
                    <p className="mt-1 break-all text-xs text-slate-500">{member.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${member.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                  >
                    {member.active ? staffRoleLabels[member.role] : "Inativo"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    disabled={busy}
                    onClick={() =>
                      void updateStaff(member, {
                        role: member.role === "administrator" ? "employee" : "administrator",
                      })
                    }
                    size="sm"
                    variant="subtle"
                  >
                    Alterar função
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={() => void updateStaff(member, { active: !member.active })}
                    size="sm"
                    variant="subtle"
                  >
                    {member.active ? "Desativar" : "Reativar"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"
          id="sale-form"
        >
          <div className="flex items-center gap-3">
            <BadgeDollarSign aria-hidden="true" className="text-aqua-700" size={20} />
            <h3 className="font-serif text-xl font-bold text-navy-950">
              {editingSaleId ? "Alterar seguro fechado" : "Registrar seguro fechado"}
            </h3>
          </div>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveSale}>
            <label className="text-sm font-semibold text-navy-950">
              Data do fechamento
              <input
                className={fieldClassName}
                onChange={(event) =>
                  setSaleForm((current) => ({ ...current, soldAt: event.currentTarget.value }))
                }
                required
                type="date"
                value={saleForm.soldAt}
              />
            </label>
            <label className="text-sm font-semibold text-navy-950">
              Funcionário
              <select
                className={fieldClassName}
                onChange={(event) =>
                  setSaleForm((current) => ({
                    ...current,
                    staffMemberId: event.currentTarget.value,
                  }))
                }
                required
                value={saleForm.staffMemberId}
              >
                <option value="">Selecione</option>
                {activeStaff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-navy-950">
              Cliente
              <input
                className={fieldClassName}
                maxLength={150}
                minLength={2}
                onChange={(event) =>
                  setSaleForm((current) => ({
                    ...current,
                    customerName: event.currentTarget.value,
                  }))
                }
                required
                value={saleForm.customerName}
              />
            </label>
            <label className="text-sm font-semibold text-navy-950">
              Seguradora
              <input
                className={fieldClassName}
                maxLength={120}
                minLength={2}
                onChange={(event) =>
                  setSaleForm((current) => ({ ...current, insurer: event.currentTarget.value }))
                }
                required
                value={saleForm.insurer}
              />
            </label>
            <label className="text-sm font-semibold text-navy-950">
              Tipo de seguro
              <select
                className={fieldClassName}
                onChange={(event) =>
                  setSaleForm((current) => ({
                    ...current,
                    insuranceType: event.currentTarget.value,
                  }))
                }
                value={saleForm.insuranceType}
              >
                {insuranceCatalog.map((insurance) => (
                  <option key={insurance.slug} value={insurance.slug}>
                    {insurance.shortName}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-navy-950">
              Número da apólice (opcional)
              <input
                className={fieldClassName}
                maxLength={80}
                onChange={(event) =>
                  setSaleForm((current) => ({
                    ...current,
                    policyNumber: event.currentTarget.value,
                  }))
                }
                value={saleForm.policyNumber ?? ""}
              />
            </label>
            <label className="text-sm font-semibold text-navy-950">
              Prêmio (R$)
              <input
                className={fieldClassName}
                inputMode="decimal"
                onChange={(event) =>
                  setSaleForm((current) => ({
                    ...current,
                    premiumAmount: event.currentTarget.value.replace(",", "."),
                  }))
                }
                pattern="[0-9]+([.,][0-9]{1,2})?"
                required
                value={saleForm.premiumAmount}
              />
            </label>
            <label className="text-sm font-semibold text-navy-950">
              Comissão da corretora (R$)
              <input
                className={fieldClassName}
                inputMode="decimal"
                onChange={(event) =>
                  setSaleForm((current) => ({
                    ...current,
                    brokerageCommissionAmount: event.currentTarget.value.replace(",", "."),
                  }))
                }
                pattern="[0-9]+([.,][0-9]{1,2})?"
                required
                value={saleForm.brokerageCommissionAmount}
              />
            </label>
            <label className="text-sm font-semibold text-navy-950">
              Repasse ao funcionário (R$)
              <input
                className={fieldClassName}
                inputMode="decimal"
                onChange={(event) =>
                  setSaleForm((current) => ({
                    ...current,
                    employeePayoutAmount: event.currentTarget.value.replace(",", "."),
                  }))
                }
                pattern="[0-9]+([.,][0-9]{1,2})?"
                required
                value={saleForm.employeePayoutAmount}
              />
            </label>
            <label className="text-sm font-semibold text-navy-950">
              Situação do repasse
              <select
                className={fieldClassName}
                onChange={(event) =>
                  setSaleForm((current) => ({
                    ...current,
                    payoutStatus: event.currentTarget.value as PayoutStatus,
                  }))
                }
                value={saleForm.payoutStatus}
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-navy-950 sm:col-span-2">
              Observações (opcional)
              <textarea
                className={`${fieldClassName} min-h-24 py-3`}
                maxLength={2000}
                onChange={(event) =>
                  setSaleForm((current) => ({ ...current, notes: event.currentTarget.value }))
                }
                value={saleForm.notes ?? ""}
              />
            </label>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button disabled={busy || activeStaff.length === 0} type="submit">
                <Save aria-hidden="true" size={16} />{" "}
                {editingSaleId ? "Salvar alterações" : "Registrar seguro"}
              </Button>
              {editingSaleId ? (
                <Button
                  disabled={busy}
                  onClick={() => {
                    setEditingSaleId(undefined);
                    setSaleForm(emptySaleForm(activeStaff[0]?.id));
                  }}
                  type="button"
                  variant="subtle"
                >
                  Cancelar edição
                </Button>
              ) : null}
            </div>
          </form>
        </section>
      </div>

      <section className="mt-8">
        <h3 className="font-serif text-2xl font-bold text-navy-950">Seguros registrados</h3>
        <div className="mt-5 grid gap-4">
          {sales.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-aqua-300 bg-white p-8 text-center text-sm text-slate-600">
              Nenhum seguro fechado registrado.
            </p>
          ) : null}
          {sales.map((sale) => (
            <article
              className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"
              key={sale.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${sale.payoutStatus === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}
                    >
                      {payoutStatusLabels[sale.payoutStatus]}
                    </span>
                    <span className="rounded-full bg-aqua-100 px-3 py-1 text-xs font-bold text-aqua-800">
                      {sale.staffMemberName}
                    </span>
                  </div>
                  <h4 className="mt-3 font-serif text-xl font-bold text-navy-950">
                    {sale.customerName}
                  </h4>
                  <p className="mt-1 text-sm text-slate-600">
                    {sale.insurer} ·{" "}
                    {insuranceCatalog.find((item) => item.slug === sale.insuranceType)?.shortName ??
                      sale.insuranceType}{" "}
                    · {formatDate(sale.soldAt)}
                  </p>
                </div>
                <Button onClick={() => editSale(sale)} size="sm" variant="subtle">
                  <Pencil aria-hidden="true" size={15} /> Alterar
                </Button>
              </div>
              <dl className="mt-5 grid gap-4 border-t border-slate-200 pt-5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-slate-500">Prêmio</dt>
                  <dd className="mt-1 font-bold text-navy-950">
                    {formatMoney(sale.premiumAmount)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Comissão</dt>
                  <dd className="mt-1 font-bold text-navy-950">
                    {formatMoney(sale.brokerageCommissionAmount)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Repasse</dt>
                  <dd className="mt-1 font-bold text-navy-950">
                    {formatMoney(sale.employeePayoutAmount)}
                  </dd>
                </div>
              </dl>
              {sale.policyNumber ? (
                <p className="mt-4 text-xs text-slate-500">Apólice: {sale.policyNumber}</p>
              ) : null}
              {sale.notes ? (
                <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {sale.notes}
                </p>
              ) : null}
            </article>
          ))}
        </div>
        {nextCursor ? (
          <div className="mt-6 flex justify-center">
            <Button disabled={busy} onClick={() => void loadMore()} variant="subtle">
              Carregar mais
            </Button>
          </div>
        ) : null}
      </section>
    </section>
  );
}
