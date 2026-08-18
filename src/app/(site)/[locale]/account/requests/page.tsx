import { notFound } from "next/navigation";

import { ArrowEast, Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow } from "@/components/ui/Section";
import { DemoTag, Tag } from "@/components/ui/Tag";
import { getDictionary } from "@/content";
import { getRepositories } from "@/lib/data";
import { leadSourceLabels, leadStatusLabels } from "@/lib/domain/labels";
import { localized } from "@/lib/domain/types";
import { formatDate } from "@/lib/format";
import { isLocale, localizePath } from "@/lib/i18n/config";

/**
 * Datos vivos: el panel refleja los leads, postulaciones y cambios de etapa
 * creados en ejecución, así que no puede prerenderizarse.
 */
export const dynamic = "force-dynamic";

/**
 * Historial de solicitudes (§20).
 *
 * Sin autenticación no hay forma de saber qué leads pertenecen a quién, así
 * que aquí se listan los del repositorio de demostración y se dice
 * explícitamente. Cuando exista sesión, esto pasa a filtrarse por usuario y
 * nada más cambia.
 */
export default async function AccountRequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const { leads } = getRepositories();

  const all = await leads.list();
  const requests = all.filter(
    (lead) => lead.source === "private_request" || lead.source === "inquiry",
  );

  if (requests.length === 0) {
    return (
      <EmptyState
        heading={dict.account.nav.requests}
        body={dict.account.empty.requests}
        action={
          <Button href={localizePath("/private/request", locale)} variant="accent">
            {dict.privateRequest.submit}
            <ArrowEast />
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Eyebrow tone="muted">{dict.account.nav.requests}</Eyebrow>

      <ul className="flex flex-col gap-4">
        {requests.map((lead) => (
          <li
            key={lead.id}
            className="border-line flex flex-col gap-4 rounded-(--radius-card) border p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <Tag tone="champagne">{localized(leadSourceLabels[lead.source], locale)}</Tag>
                <Tag>{localized(leadStatusLabels[lead.status], locale)}</Tag>
                {lead.isDemo ? <DemoTag /> : null}
              </div>
              <span className="text-fg-muted/60 text-xs" data-numeric>
                {lead.reference}
              </span>
            </div>

            {lead.message ? (
              <p className="text-fg-muted line-clamp-3 text-sm text-pretty">{lead.message}</p>
            ) : null}

            <div className="border-line-soft flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <span className="text-fg-muted/60 text-xs" data-numeric>
                {formatDate(lead.createdAt, locale)}
              </span>
              {lead.confidentiality !== "standard" ? (
                <span className="eyebrow text-accent-dim text-[0.5rem]">
                  {
                    dict.privateRequest.confidentialityOptions.find(
                      (option) => option.value === lead.confidentiality,
                    )?.label
                  }
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
