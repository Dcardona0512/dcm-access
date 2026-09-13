import { AdminButton, AdminHeading } from "@/components/admin/AdminUI";
import { DemoTag } from "@/components/ui/Tag";
import { getRepositories } from "@/lib/data";
import { leadSourceLabels, leadStatusLabels } from "@/lib/domain/labels";
import { leadStatuses, localized, type LeadStatus } from "@/lib/domain/types";
import { formatDateShort } from "@/lib/format";

import { advanceLead } from "../actions";

/**
 * Datos vivos: el panel refleja los leads, postulaciones y cambios de etapa
 * creados en ejecución, así que no puede prerenderizarse.
 */
export const dynamic = "force-dynamic";

/**
 * Tablero de leads (§23): NEW → QUALIFIED → CONTACTED → NEGOTIATION → CLOSED → COMMISSION.
 *
 * Sin arrastrar y soltar: cada tarjeta lleva un formulario con la siguiente
 * etapa. Es un `<form>` real, así que funciona sin JavaScript, es accesible
 * por teclado y cada movimiento queda registrado en el historial del lead.
 */
export default async function AdminLeadsPage() {
  const { leads } = getRepositories();
  const all = await leads.list();

  const nextOf = (status: LeadStatus): LeadStatus | null => {
    const index = leadStatuses.indexOf(status);
    return index >= 0 && index < leadStatuses.length - 1 ? leadStatuses[index + 1] : null;
  };

  return (
    <>
      <AdminHeading
        eyebrow="Captación"
        title="Leads"
        lede="Cada consulta, búsqueda privada, contacto y postulación entra aquí como oportunidad comercial."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {leadStatuses.map((status) => {
          const column = all.filter((lead) => lead.status === status);

          return (
            <section
              key={status}
              aria-label={localized(leadStatusLabels[status], "es")}
              className="border-line flex flex-col gap-3 rounded-(--radius-card) border p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="eyebrow text-accent text-[0.5625rem]">
                  {localized(leadStatusLabels[status], "es")}
                </h2>
                <span className="text-fg-muted/60 text-xs" data-numeric>
                  {column.length}
                </span>
              </div>

              {column.length === 0 ? (
                <p className="text-fg-muted/40 py-6 text-center text-xs">Sin leads</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {column.map((lead) => {
                    const next = nextOf(lead.status);

                    return (
                      <li
                        key={lead.id}
                        className="bg-surface-raised border-line-soft flex flex-col gap-3 rounded-(--radius-card) border p-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm leading-snug">{lead.contact.name}</span>
                          {lead.isDemo ? <DemoTag /> : null}
                        </div>

                        <dl className="text-fg-muted/60 flex flex-col gap-1 text-xs">
                          <div className="flex justify-between gap-3">
                            <dt>Origen</dt>
                            <dd className="text-right">
                              {localized(leadSourceLabels[lead.source], "es")}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt>Referencia</dt>
                            <dd data-numeric>{lead.reference}</dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt>Creado</dt>
                            <dd data-numeric>{formatDateShort(lead.createdAt, "es")}</dd>
                          </div>
                          {lead.confidentiality !== "standard" ? (
                            <div className="flex justify-between gap-3">
                              <dt>Confidencialidad</dt>
                              <dd className="text-accent-dim text-right">
                                {lead.confidentiality === "strictly_private"
                                  ? "Estricta"
                                  : "Discreta"}
                              </dd>
                            </div>
                          ) : null}
                        </dl>

                        {lead.message ? (
                          <p className="text-fg-muted/70 line-clamp-3 text-xs text-pretty">
                            {lead.message}
                          </p>
                        ) : null}

                        {next ? (
                          <form action={advanceLead} className="pt-1">
                            <input type="hidden" name="id" value={lead.id} />
                            <input type="hidden" name="status" value={next} />
                            <AdminButton tone="accent">
                              → {localized(leadStatusLabels[next], "es")}
                            </AdminButton>
                          </form>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
