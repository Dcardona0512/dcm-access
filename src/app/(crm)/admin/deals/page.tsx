import { AdminButton, AdminHeading } from "@/components/admin/AdminUI";
import { Tag } from "@/components/ui/Tag";
import { getRepositories } from "@/lib/data";
import { dealStageLabels, verticalLabels } from "@/lib/domain/labels";
import { dealStages, localized, type DealStage } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/format";

import { moveDeal } from "../actions";

/**
 * Datos vivos: el panel refleja los leads, postulaciones y cambios de etapa
 * creados en ejecución, así que no puede prerenderizarse.
 */
export const dynamic = "force-dynamic";

/**
 * Pipeline de brokerage (§5).
 *
 * Las seis etapas del proceso, con las operaciones colocadas en la suya. Mover
 * una operación a `close` la marca como ganada y su comisión pasa de proyectada
 * a liquidable en la vista de comisiones.
 */
export default async function AdminDealsPage() {
  const { deals, providers } = getRepositories();
  const [all, allProviders] = await Promise.all([deals.list(), providers.listAll()]);

  const providerName = (id?: string) =>
    id ? (allProviders.find((provider) => provider.id === id)?.name ?? "—") : "—";

  const nextOf = (stage: DealStage): DealStage | null => {
    const index = dealStages.indexOf(stage);
    return index >= 0 && index < dealStages.length - 1 ? dealStages[index + 1] : null;
  };

  return (
    <>
      <AdminHeading
        eyebrow="Operaciones"
        title="Pipeline"
        lede="Request → Source → Verify → Connect → Negotiate → Close. El mismo proceso para un apartamento que para una aeronave."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dealStages.map((stage) => {
          const column = all.filter((deal) => deal.stage === stage);

          return (
            <section
              key={stage}
              aria-label={localized(dealStageLabels[stage], "es")}
              className="border-line flex flex-col gap-3 rounded-(--radius-card) border p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="eyebrow text-accent text-[0.5625rem]">
                  {localized(dealStageLabels[stage], "es")}
                </h2>
                <span className="text-fg-muted/60 text-xs" data-numeric>
                  {column.length}
                </span>
              </div>

              {column.length === 0 ? (
                <p className="text-fg-muted/40 py-6 text-center text-xs">Sin operaciones</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {column.map((deal) => {
                    const next = nextOf(deal.stage);

                    return (
                      <li
                        key={deal.id}
                        className="bg-surface-raised border-line-soft flex flex-col gap-3 rounded-(--radius-card) border p-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm" data-numeric>
                            {deal.reference}
                          </span>
                          {deal.outcome === "won" ? (
                            <Tag tone="verified">Ganada</Tag>
                          ) : deal.outcome === "lost" ? (
                            <Tag tone="muted">Perdida</Tag>
                          ) : null}
                        </div>

                        <span className="font-display text-lg" data-numeric>
                          {formatCurrency(deal.value, deal.currency, "es", { compact: true })}
                        </span>

                        <dl className="text-fg-muted/60 flex flex-col gap-1 text-xs">
                          <div className="flex justify-between gap-3">
                            <dt>Categoría</dt>
                            <dd className="text-right">
                              {localized(verticalLabels[deal.vertical], "es")}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt>Proveedor</dt>
                            <dd className="truncate text-right">{providerName(deal.providerId)}</dd>
                          </div>
                        </dl>

                        {next ? (
                          <form action={moveDeal} className="pt-1">
                            <input type="hidden" name="id" value={deal.id} />
                            <input type="hidden" name="stage" value={next} />
                            <AdminButton tone="accent">
                              → {localized(dealStageLabels[next], "es")}
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
