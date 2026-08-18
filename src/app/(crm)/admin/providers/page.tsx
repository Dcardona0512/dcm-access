import { AdminButton, AdminHeading, Cell, DataTable, Panel, Row } from "@/components/admin/AdminUI";
import { Eyebrow } from "@/components/ui/Section";
import { DemoTag, Tag } from "@/components/ui/Tag";
import { getRepositories } from "@/lib/data";
import { verticalLabels } from "@/lib/domain/labels";
import { localized, type Provider } from "@/lib/domain/types";
import { formatDateShort, formatLocation } from "@/lib/format";

import { decideProvider } from "../actions";

/**
 * Datos vivos: el panel refleja los leads, postulaciones y cambios de etapa
 * creados en ejecución, así que no puede prerenderizarse.
 */
export const dynamic = "force-dynamic";

/**
 * Cola de aprobación de proveedores (§18, §19).
 *
 * La curaduría es el producto: nada se publica solo. Esta pantalla es el punto
 * donde una postulación se convierte —o no— en un perfil visible, y separa
 * visualmente lo pendiente de lo ya resuelto para que la bandeja se vacíe.
 */
export default async function AdminProvidersPage() {
  const { providers } = getRepositories();
  const all = await providers.listAll();

  const pending = all.filter(
    (provider) => provider.status === "applied" || provider.status === "in_review",
  );
  const resolved = all.filter(
    (provider) => provider.status !== "applied" && provider.status !== "in_review",
  );

  return (
    <>
      <AdminHeading
        eyebrow="Red"
        title="Proveedores"
        lede="Ninguna postulación se publica automáticamente. Los servicios regulados exigen acreditación vigente antes de aprobarse."
      />

      <section className="mb-10 flex flex-col gap-4">
        <Eyebrow tone="muted">Pendientes de revisión · {pending.length}</Eyebrow>

        {pending.length === 0 ? (
          <Panel>
            <p className="text-fg-muted/50 py-4 text-center text-sm">La bandeja está vacía.</p>
          </Panel>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {pending.map((provider) => (
              <Panel key={provider.id} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-lg">{provider.name}</h3>
                    <span className="text-fg-muted/60 text-xs">
                      {provider.locations[0]
                        ? formatLocation(provider.locations[0], "es")
                        : null}{" "}
                      · {formatDateShort(provider.appliedAt, "es")}
                    </span>
                  </div>
                  {provider.isDemo ? <DemoTag /> : null}
                </div>

                <p className="text-fg-muted/80 text-sm text-pretty">
                  {localized(provider.description, "es")}
                </p>

                <div className="flex flex-wrap gap-2">
                  {provider.verticals.map((vertical) => (
                    <Tag key={vertical}>{localized(verticalLabels[vertical], "es")}</Tag>
                  ))}
                </div>

                <CertificationList provider={provider} />

                <div className="border-line-soft flex flex-wrap gap-2 border-t pt-4">
                  <form action={decideProvider}>
                    <input type="hidden" name="id" value={provider.id} />
                    <input type="hidden" name="decision" value="approved" />
                    <AdminButton tone="accent">Aprobar y publicar</AdminButton>
                  </form>

                  {provider.status === "applied" ? (
                    <form action={decideProvider}>
                      <input type="hidden" name="id" value={provider.id} />
                      <input type="hidden" name="decision" value="in_review" />
                      <AdminButton>Pasar a revisión</AdminButton>
                    </form>
                  ) : null}

                  <form action={decideProvider}>
                    <input type="hidden" name="id" value={provider.id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <AdminButton tone="danger">Rechazar</AdminButton>
                  </form>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <Eyebrow tone="muted">Resueltos · {resolved.length}</Eyebrow>

        <DataTable headers={["Empresa", "Categorías", "Ubicación", "Verificación", "Estado", ""]}>
          {resolved.map((provider) => (
            <Row key={provider.id}>
              <Cell>
                <span className="flex items-center gap-2">
                  {provider.name}
                  {provider.isDemo ? <DemoTag /> : null}
                </span>
              </Cell>
              <Cell className="text-fg-muted/70 text-xs">
                {provider.verticals
                  .map((vertical) => localized(verticalLabels[vertical], "es"))
                  .join(" · ")}
              </Cell>
              <Cell className="text-fg-muted/70 text-xs">
                {provider.locations[0] ? formatLocation(provider.locations[0], "es") : "—"}
              </Cell>
              <Cell>
                <Tag
                  tone={
                    provider.verification === "verified"
                      ? "verified"
                      : provider.verification === "documents_pending"
                        ? "pending"
                        : "muted"
                  }
                >
                  {provider.verification === "verified"
                    ? "Verificado"
                    : provider.verification === "documents_pending"
                      ? "En curso"
                      : "Sin verificar"}
                </Tag>
              </Cell>
              <Cell>
                <Tag tone={provider.status === "approved" ? "verified" : "muted"}>
                  {provider.status === "approved"
                    ? "Aprobado"
                    : provider.status === "suspended"
                      ? "Suspendido"
                      : "Rechazado"}
                </Tag>
              </Cell>
              <Cell>
                {provider.status === "approved" ? (
                  <form action={decideProvider}>
                    <input type="hidden" name="id" value={provider.id} />
                    <input type="hidden" name="decision" value="suspended" />
                    <AdminButton tone="danger">Suspender</AdminButton>
                  </form>
                ) : (
                  <form action={decideProvider}>
                    <input type="hidden" name="id" value={provider.id} />
                    <input type="hidden" name="decision" value="approved" />
                    <AdminButton>Reactivar</AdminButton>
                  </form>
                )}
              </Cell>
            </Row>
          ))}
        </DataTable>
      </section>
    </>
  );
}

/**
 * Acreditaciones declaradas frente a comprobadas (§26). En servicios regulados
 * esta distinción es la que decide si el perfil puede aprobarse.
 */
function CertificationList({ provider }: { readonly provider: Provider }) {
  if (provider.certifications.length === 0) {
    return <p className="text-fg-muted/40 text-xs">Sin acreditaciones declaradas.</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {provider.certifications.map((certification) => (
        <li key={certification.name} className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-fg-muted/80">{certification.name}</span>
          <Tag tone={certification.verified ? "verified" : "pending"}>
            {certification.verified ? "Comprobada" : "Declarada"}
          </Tag>
        </li>
      ))}
    </ul>
  );
}
