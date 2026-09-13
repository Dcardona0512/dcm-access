import Link from "next/link";

import { AdminHeading, Panel, Stat } from "@/components/admin/AdminUI";
import { Eyebrow } from "@/components/ui/Section";
import { computeCommission } from "@/lib/commerce/commissions";
import { getRepositories, isDemoData } from "@/lib/data";
import { demoRates } from "@/lib/data/demo/seed/pipeline";
import { dealStageLabels, leadStatusLabels } from "@/lib/domain/labels";
import { dealStages, leadStatuses, localized } from "@/lib/domain/types";
import { formatCurrency, formatDateShort } from "@/lib/format";

/**
 * Datos vivos: el panel refleja los leads, postulaciones y cambios de etapa
 * creados en ejecución, así que no puede prerenderizarse.
 */
export const dynamic = "force-dynamic";

/**
 * Resumen del CRM.
 *
 * Responde a la pregunta de §41 y §44: qué está generando ingresos. Por eso la
 * cifra principal no es "leads totales" sino la comisión proyectada del
 * pipeline abierto, calculada con el mismo motor que liquida las operaciones.
 */
export default async function AdminOverviewPage() {
  const { leads, deals, providers, commissions } = getRepositories();

  const [allLeads, allDeals, allProviders, plans] = await Promise.all([
    leads.list(),
    deals.list(),
    providers.listAll(),
    commissions.listPlans(),
  ]);

  const planById = new Map(plans.map((plan) => [plan.id, plan]));

  const openDeals = allDeals.filter((deal) => deal.outcome === "open");

  const projected = openDeals.reduce((total, deal) => {
    const plan = planById.get(deal.commissionPlanId);
    if (!plan) return total;

    const breakdown = computeCommission(plan, {
      deal,
      rates: demoRates,
      currency: "USD",
    });
    return total + breakdown.total;
  }, 0);

  const pending = allProviders.filter(
    (provider) => provider.status === "applied" || provider.status === "in_review",
  );

  const newLeads = allLeads.filter((lead) => lead.status === "new");

  return (
    <>
      <AdminHeading
        eyebrow="CRM"
        title="Resumen"
        lede={
          isDemoData()
            ? "Fuente de datos: demo en memoria. Los cambios que haga aquí se pierden al reiniciar el servidor."
            : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Comisión proyectada"
          value={formatCurrency(projected, "USD", "es")}
          note={`Pipeline abierto · ${openDeals.length} operación(es)`}
        />
        <Stat
          label="Leads sin atender"
          value={String(newLeads.length)}
          note={`${allLeads.length} en total`}
        />
        <Stat
          label="Operaciones abiertas"
          value={String(openDeals.length)}
          note={`${allDeals.length} registradas`}
        />
        <Stat
          label="Proveedores en revisión"
          value={String(pending.length)}
          note={`${allProviders.filter((p) => p.status === "approved").length} aprobados`}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* --- Embudo de leads (§23) ------------------------------------- */}
        <Panel className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between gap-4">
            <Eyebrow tone="muted">Embudo de leads</Eyebrow>
            <Link href="/admin/leads" className="eyebrow text-accent text-[0.5rem]">
              Ver todos
            </Link>
          </div>

          <ul className="flex flex-col gap-2.5">
            {leadStatuses.map((status) => {
              const count = allLeads.filter((lead) => lead.status === status).length;
              const share = allLeads.length ? (count / allLeads.length) * 100 : 0;

              return (
                <li key={status} className="flex items-center gap-4">
                  <span className="text-fg-muted w-28 shrink-0 text-xs">
                    {localized(leadStatusLabels[status], "es")}
                  </span>
                  <span className="bg-surface-sunken h-1.5 flex-1 overflow-hidden rounded-(--radius-pill)">
                    <span
                      className="bg-accent-dim block h-full"
                      style={{ width: `${share}%` }}
                    />
                  </span>
                  <span className="text-fg-muted w-6 shrink-0 text-right text-xs" data-numeric>
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* --- Pipeline por etapa (§5) ----------------------------------- */}
        <Panel className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between gap-4">
            <Eyebrow tone="muted">Pipeline de brokerage</Eyebrow>
            <Link href="/admin/deals" className="eyebrow text-accent text-[0.5rem]">
              Ver pipeline
            </Link>
          </div>

          <ul className="flex flex-col gap-2.5">
            {dealStages.map((stage) => {
              const stageDeals = allDeals.filter((deal) => deal.stage === stage);
              const value = stageDeals.reduce(
                (total, deal) =>
                  total + deal.value / (demoRates[deal.currency] ?? 1),
                0,
              );

              return (
                <li
                  key={stage}
                  className="border-line-soft flex items-center justify-between gap-4 border-b pb-2.5 last:border-0"
                >
                  <span className="eyebrow text-fg-muted text-[0.5rem]">
                    {localized(dealStageLabels[stage], "es")}
                  </span>
                  <span className="text-fg-muted text-xs" data-numeric>
                    {stageDeals.length} · {formatCurrency(value, "USD", "es", { compact: true })}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      {/* --- Últimos leads --------------------------------------------- */}
      <Panel className="mt-6 flex flex-col gap-5">
        <Eyebrow tone="muted">Últimos leads</Eyebrow>

        <ul className="flex flex-col">
          {allLeads.slice(0, 6).map((lead) => (
            <li
              key={lead.id}
              className="border-line-soft flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm">{lead.contact.name}</span>
                <span className="text-fg-muted/60 text-xs">
                  {lead.reference} · {localized(leadStatusLabels[lead.status], "es")}
                </span>
              </div>
              <span className="text-fg-muted/60 shrink-0 text-xs" data-numeric>
                {formatDateShort(lead.createdAt, "es")}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
