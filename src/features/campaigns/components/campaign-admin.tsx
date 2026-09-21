"use client";

import { CalendarClock, ImagePlus, LoaderCircle, Send, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { partnerCatalog } from "@/features/partners/catalog";
import type { CampaignStatus, PartnerSlug } from "@/features/campaigns/model";

type AdminCampaign = {
  id: string;
  partnerSlug: PartnerSlug;
  title: string;
  summary: string;
  imageAlt: string;
  imageSrc: string;
  ctaLabel: string;
  href: string;
  conditions?: string;
  startsAt?: string;
  endsAt?: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
};

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-navy-950 shadow-sm outline-none transition placeholder:text-slate-500 hover:border-slate-400 focus:border-aqua-700 focus:ring-3 focus:ring-aqua-200 disabled:cursor-not-allowed disabled:bg-slate-100";
const maxImageBytes = 8 * 1024 * 1024;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];

function formatDate(value?: string) {
  if (!value) return "Sem data definida";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorMessage(status: number) {
  if (status === 401)
    return "Sua sessão administrativa expirou. Atualize a página e entre novamente.";
  if (status === 409) return "Outra pessoa atualizou a lista. Recarregue e tente novamente.";
  if (status === 413) return "A imagem deve ter no máximo 8 MB.";
  if (status === 422) return "Revise os campos e confirme que a imagem é JPG, PNG ou WebP.";
  return "Não foi possível concluir a operação agora.";
}

export function CampaignAdmin() {
  const formRef = useRef<HTMLFormElement>(null);
  const [campaigns, setCampaigns] = useState<readonly AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Carregando campanhas…");
  const [previewUrl, setPreviewUrl] = useState<string>();

  const loadCampaigns = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/campaigns", {
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error(String(response.status));
      const payload = (await response.json()) as { campaigns?: AdminCampaign[] };
      setCampaigns(Array.isArray(payload.campaigns) ? payload.campaigns : []);
      setMessage("Lista atualizada.");
    } catch (error) {
      const status = error instanceof Error ? Number(error.message) : 0;
      setMessage(getErrorMessage(status));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadCampaigns(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadCampaigns]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const formData = new FormData(event.currentTarget);
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      setMessage("Selecione uma imagem.");
      return;
    }
    if (image.size > maxImageBytes || !acceptedImageTypes.includes(image.type)) {
      setMessage("Envie uma imagem JPG, PNG ou WebP de até 8 MB.");
      return;
    }

    for (const field of ["startsAt", "endsAt"]) {
      const value = formData.get(field);
      if (typeof value === "string" && value) {
        formData.set(field, new Date(value).toISOString());
      }
    }

    setSaving(true);
    setMessage("Salvando campanha…");
    try {
      const response = await fetch("/api/admin/campaigns", { method: "POST", body: formData });
      if (!response.ok) throw new Error(String(response.status));
      formRef.current?.reset();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(undefined);
      setMessage("Campanha salva com sucesso.");
      await loadCampaigns();
    } catch (error) {
      const status = error instanceof Error ? Number(error.message) : 0;
      setMessage(getErrorMessage(status));
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(campaign: AdminCampaign) {
    const status = campaign.status === "published" ? "draft" : "published";
    setMessage(status === "published" ? "Publicando campanha…" : "Retirando campanha do ar…");
    try {
      const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(String(response.status));
      await loadCampaigns();
    } catch (error) {
      const statusCode = error instanceof Error ? Number(error.message) : 0;
      setMessage(getErrorMessage(statusCode));
    }
  }

  async function deleteCampaign(campaign: AdminCampaign) {
    if (!window.confirm(`Excluir definitivamente a campanha “${campaign.title}”?`)) return;
    setMessage("Excluindo campanha…");
    try {
      const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(String(response.status));
      await loadCampaigns();
    } catch (error) {
      const status = error instanceof Error ? Number(error.message) : 0;
      setMessage(getErrorMessage(status));
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
      <form
        className="rounded-2xl border border-border bg-white p-6 shadow-[0_18px_55px_rgba(7,24,39,0.07)] sm:p-8"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
            <ImagePlus aria-hidden="true" size={22} />
          </span>
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-950">Nova campanha</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Salve como rascunho para revisar ou publique quando a comunicação oficial estiver
              confirmada.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <label className="text-sm font-semibold text-navy-950">
            Seguradora *
            <select className={fieldClassName} defaultValue="" name="partnerSlug" required>
              <option disabled value="">
                Selecione
              </option>
              {partnerCatalog.map((partner) => (
                <option key={partner.slug} value={partner.slug}>
                  {partner.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-navy-950">
            Situação *
            <select className={fieldClassName} defaultValue="draft" name="status" required>
              <option value="draft">Rascunho</option>
              <option value="published">Publicada</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-navy-950 md:col-span-2">
            Título *
            <input className={fieldClassName} maxLength={120} minLength={3} name="title" required />
          </label>

          <label className="text-sm font-semibold text-navy-950 md:col-span-2">
            Resumo *
            <textarea
              className={`${fieldClassName} min-h-28 py-3`}
              maxLength={400}
              minLength={10}
              name="summary"
              required
            />
          </label>

          <label className="text-sm font-semibold text-navy-950 md:col-span-2">
            Imagem oficial *
            <input
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className={`${fieldClassName} py-3 file:mr-4 file:rounded-md file:border-0 file:bg-aqua-100 file:px-3 file:py-2 file:font-semibold file:text-navy-950`}
              name="image"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(file ? URL.createObjectURL(file) : undefined);
              }}
              required
              type="file"
            />
            <span className="mt-2 block font-normal leading-6 text-slate-500">
              JPG, PNG ou WebP, até 8 MB. Formatos verticais 2:3 e 4:5 são exibidos sem recorte.
            </span>
          </label>

          {previewUrl ? (
            <div className="relative aspect-[2/3] max-w-xs overflow-hidden rounded-2xl border border-aqua-200 bg-white md:col-span-2">
              <Image
                alt="Prévia da imagem selecionada"
                className="object-contain"
                fill
                src={previewUrl}
                unoptimized
              />
            </div>
          ) : null}

          <label className="text-sm font-semibold text-navy-950 md:col-span-2">
            Texto alternativo da imagem *
            <input
              className={fieldClassName}
              maxLength={180}
              minLength={5}
              name="imageAlt"
              required
            />
          </label>

          <label className="text-sm font-semibold text-navy-950">
            Texto do botão *
            <input
              className={fieldClassName}
              defaultValue="Saiba mais"
              maxLength={40}
              minLength={2}
              name="ctaLabel"
              required
            />
          </label>

          <label className="text-sm font-semibold text-navy-950">
            Destino do botão *
            <input
              className={fieldClassName}
              defaultValue="/contato"
              maxLength={500}
              name="href"
              required
            />
          </label>

          <label className="text-sm font-semibold text-navy-950 md:col-span-2">
            Condições ou observações
            <textarea
              className={`${fieldClassName} min-h-24 py-3`}
              maxLength={500}
              name="conditions"
            />
          </label>

          <label className="text-sm font-semibold text-navy-950">
            Início da exibição
            <input className={fieldClassName} name="startsAt" type="datetime-local" />
          </label>

          <label className="text-sm font-semibold text-navy-950">
            Fim da exibição
            <input className={fieldClassName} name="endsAt" type="datetime-local" />
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button disabled={saving} size="lg" type="submit">
            {saving ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" size={19} />
            ) : (
              <Send aria-hidden="true" size={18} />
            )}
            {saving ? "Salvando…" : "Salvar campanha"}
          </Button>
          <p aria-live="polite" className="text-sm leading-6 text-slate-600" role="status">
            {message}
          </p>
        </div>
      </form>

      <section aria-labelledby="campaign-list-title">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-950" id="campaign-list-title">
              Campanhas cadastradas
            </h2>
            <p className="mt-2 text-sm text-slate-600">{campaigns.length} item(ns)</p>
          </div>
          <Button
            disabled={loading}
            onClick={() => {
              setLoading(true);
              void loadCampaigns();
            }}
            size="sm"
            variant="subtle"
          >
            Atualizar
          </Button>
        </div>

        <div className="mt-6 grid gap-5">
          {!loading && campaigns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-aqua-300 bg-white p-8 text-center text-sm leading-6 text-slate-600">
              Nenhuma campanha cadastrada.
            </div>
          ) : null}

          {campaigns.map((campaign) => {
            const partner = partnerCatalog.find(({ slug }) => slug === campaign.partnerSlug);
            return (
              <article
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
                key={campaign.id}
              >
                <div className="grid gap-0 sm:grid-cols-[9rem_1fr] xl:grid-cols-[8rem_1fr]">
                  <div className="relative aspect-[4/5] bg-slate-100 sm:aspect-auto">
                    <Image
                      alt={campaign.imageAlt}
                      className="object-cover"
                      fill
                      sizes="144px"
                      src={campaign.imageSrc}
                      unoptimized
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${campaign.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}
                      >
                        {campaign.status === "published" ? "Publicada" : "Rascunho"}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{partner?.name}</span>
                    </div>
                    <h3 className="mt-3 font-serif text-lg font-bold text-navy-950">
                      {campaign.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {campaign.summary}
                    </p>
                    <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
                      <CalendarClock aria-hidden="true" className="mt-0.5 shrink-0" size={15} />
                      <span>
                        Início: {formatDate(campaign.startsAt)}
                        <br />
                        Fim: {formatDate(campaign.endsAt)}
                      </span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button
                        onClick={() => void changeStatus(campaign)}
                        size="sm"
                        variant="subtle"
                      >
                        {campaign.status === "published" ? "Retirar do ar" : "Publicar"}
                      </Button>
                      <Button
                        className="text-red-700 hover:border-red-400 hover:bg-red-50"
                        onClick={() => void deleteCampaign(campaign)}
                        size="sm"
                        variant="subtle"
                      >
                        <Trash2 aria-hidden="true" size={16} /> Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
