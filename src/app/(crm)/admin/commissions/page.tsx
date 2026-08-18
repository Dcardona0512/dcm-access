import { AdminHeading, Panel } from "@/components/admin/AdminUI";
import { Eyebrow } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import {
  commissionTypeLabels,
  computeCommission,
  type CommissionBreakdown,
} from "@/lib/commerce/commissions";
import { getRepositories } from "@/lib/data";
import { demoRates } from "@/lib/data/demo/seed/pipeline";
import { localized } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/format";

/**
 * Datos vivos: el panel refleja los leads, postulaciones y cambios de etapa
 * creados en ejecución, así que no puede prerenderizarse.
 */
export const dynamic = "force-dynamic";

/**
 * Comisiones (§24).
 *
 * Esta pantalla existe para hacer auditable el motor: por cada operación se
 * muestran las líneas que aplicaron, la base de cálculo de cada una y las
 * reglas que se descartaron con su motivo. Si un número no cuadra, aquí se ve
 * exactamente por qué — que es lo que separa un cálculo de comisiones usable
 * de una caja negra.
 */
export default async function AdminCommissionsPage() {
  const { deals, commissions } = getRepositories();
  const [allDeals, plans] = await Promise.all([deals.list(), commissions.listPlans()]);

  const planById = new Map(plans.map((plan) => [plan.id, plan]));

  const rows = allDeals.map((deal) => {
    const plan = planById.get(deal.commissionPlanId);
    const breakdown: CommissionBreakdown | null = plan
      ? computeCommission(plan, { deal, rates: demoRates, currency: "USD" })
      : null;

    return { deal, plan, breakdown };
  });

  const total = rows.reduce((sum, row) => sum + (row.breakdown?.total ?? 0), 0);
  const won = rows
    .filter((row) => row.deal.outcome === "won")
    .reduce((sum, row) => sum + (row.breakdown?.total ?? 0), 0);

  return (
    <>
      <AdminHeading
        eyebrow="Monetización"
        title="Comisiones"
        lede="Comisión fija, porcentual, referido, fee por lead, revenue share, suscripción y publicación destacada conviven en el mismo plan. Añadir un modelo nuevo es una regla más, no una migración."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Panel className="flex flex-col gap-2">
          <span className="eyebrow text-fg-muted text-[0.5rem]">Total calculado</span>
          <span className="font-display text-3xl" data-numeric>
            {formatCurrency(total, "USD", "es")}
          </span>
          <span className="text-fg-muted/60 text-xs">Todas las operaciones registradas</span>
        </Panel>
        <Panel className="flex flex-col gap-2">
          <span className="eyebrow text-fg-muted text-[0.5rem]">Liquidable</span>
          <span className="font-display text-accent text-3xl" data-numeric>
            {formatCurrency(won, "USD", "es")}
          </span>
          <span className="text-fg-muted/60 text-xs">Solo operaciones cerradas como ganadas</span>
        </Panel>
      </div>

      <div className="flex flex-col gap-5">
        {rows.map(({ deal, plan, breakdown }) => (
          <Panel key={deal.id} className="flex flex-col gap-5">
            <div className="border-line-soft flex flex-wrap items-start justify-between gap-4 border-b pb-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm" data-numeric>
                  {deal.reference}
                </span>
                <span className="text-fg-muted/60 text-xs">
                  {plan ? localized(plan.name, "es") : "Sin plan asignado"} ·{" "}
                  {formatCurrency(deal.value, deal.currency, "es")}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {deal.outcome === "won" ? <Tag tone="verified">Ganada</Tag> : null}
                <span className="font-display text-2xl" data-numeric>
                  {breakdown ? formatCurrency(breakdown.total, breakdown.currency, "es") : "—"}
                </span>
              </div>
            </div>

            {breakdown && breakdown.lines.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {breakdown.lines.map((line) => (
                  <li
                    key={line.ruleId}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm">
                        {localized(line.label, "es")}{" "}
                        <span className="text-fg-muted/50 text-xs">
                          ({localized(commissionTypeLabels[line.type], "es")})
                        </span>
                      </span>
                      {/* La base de cálculo es el dato que hace auditable la cifra. */}
                      <span className="text-fg-muted/50 text-xs">{line.basis}</span>
                    </div>
                    <span className="text-fg-muted shrink-0 text-sm" data-numeric>
                      {formatCurrency(line.amount, line.currency, "es")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-fg-muted/50 text-xs">Ninguna regla aplicó a esta operación.</p>
            )}

            {breakdown && breakdown.skipped.length > 0 ? (
              <div className="border-line-soft flex flex-col gap-2 border-t pt-4">
                <Eyebrow tone="muted">Reglas descartadas</Eyebrow>
                <ul className="flex flex-col gap-1">
                  {breakdown.skipped.map((skipped) => (
                    <li key={skipped.ruleId} className="text-fg-muted/40 text-xs">
                      {skipped.ruleId} — {skipped.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Panel>
        ))}
      </div>
    </>
  );
}
