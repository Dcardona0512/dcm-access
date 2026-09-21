import { AdminHeading } from "@/components/admin/AdminUI";
import { partnersDelPanel, type PartnerStatus } from "@/lib/data/supabase/partners";
import { formatDateShort } from "@/lib/format";

import { setPartnerStatus } from "./actions";

export const dynamic = "force-dynamic";

/* ============================================================================
   VERIFICACIÓN DE PARTNERS
   ----------------------------------------------------------------------------
   La pantalla que convierte una solicitud en un proveedor con permiso para
   publicar. Es el cuello de botella del catálogo a propósito: si cualquiera
   pudiera publicar, «verificado» dejaría de significar nada y con ello se cae
   la razón por la que un cliente se fía de lo que ve aquí.
   ========================================================================== */

const ETIQUETAS: Record<PartnerStatus, string> = {
  pending: "Pendiente",
  in_review: "En revisión",
  verified: "Verificado",
  rejected: "Rechazado",
  suspended: "Suspendido",
};

/** Lo que tiene sentido hacer desde cada estado. */
const SIGUIENTES: Record<PartnerStatus, readonly PartnerStatus[]> = {
  pending: ["in_review", "verified", "rejected"],
  in_review: ["verified", "rejected"],
  verified: ["suspended"],
  rejected: ["in_review"],
  suspended: ["verified", "rejected"],
};

export default async function AdminPartnersPage() {
  const partners = await partnersDelPanel();

  const pendientes = partners.filter((p) => p.status === "pending" || p.status === "in_review");
  const resto = partners.filter((p) => p.status !== "pending" && p.status !== "in_review");

  return (
    <>
      <AdminHeading
        title="Partners"
        lede="Cada solicitud se revisa a mano. Verificar concede el rol y habilita la publicación; retirarlo lo quita."
      />

      {partners.length === 0 ? (
        <p className="border-line text-fg-muted rounded-(--radius-card) border border-dashed px-6 py-14 text-center text-sm">
          Todavía no hay solicitudes de partner.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          <Grupo titulo="Esperando revisión" partners={pendientes} />
          <Grupo titulo="Resueltos" partners={resto} />
        </div>
      )}
    </>
  );
}

function Grupo({
  titulo,
  partners,
}: {
  readonly titulo: string;
  readonly partners: readonly Awaited<ReturnType<typeof partnersDelPanel>>[number][];
}) {
  if (partners.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="eyebrow text-fg-muted text-[0.8rem]">
        {titulo} · {partners.length}
      </h2>

      <ul className="flex flex-col gap-4">
        {partners.map((partner) => (
          <li
            key={partner.id}
            className="border-line bg-surface-raised flex flex-col gap-4 rounded-(--radius-card) border p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-base">{partner.companyName}</h3>
                <p className="text-fg-muted/70 text-xs">
                  {partner.email ?? "sin correo"}
                  {partner.city ? ` · ${partner.city}` : ""}
                  {partner.country ? `, ${partner.country}` : ""}
                </p>
              </div>

              <span className="eyebrow border-line-soft text-fg-muted rounded-(--radius-card) border px-2.5 py-1 text-[0.7rem]">
                {ETIQUETAS[partner.status]}
              </span>
            </div>

            {partner.description ? (
              <p className="text-fg-muted line-clamp-3 text-sm text-pretty">
                {partner.description}
              </p>
            ) : null}

            <div className="text-fg-muted/60 flex flex-wrap gap-4 text-xs">
              {partner.website ? <span className="break-all">{partner.website}</span> : null}
              {partner.category ? <span>{partner.category}</span> : null}
              <span data-numeric>Solicitado el {formatDateShort(partner.createdAt, "es")}</span>
            </div>

            <div className="border-line-soft flex flex-wrap gap-2 border-t pt-4">
              {SIGUIENTES[partner.status].map((siguiente) => (
                <form key={siguiente} action={setPartnerStatus}>
                  <input type="hidden" name="id" value={partner.id} />
                  <input type="hidden" name="status" value={siguiente} />
                  <button
                    type="submit"
                    className={`eyebrow rounded-(--radius-card) border px-3 py-1.5 text-[0.7rem] transition-colors ${
                      siguiente === "verified"
                        ? "border-accent/60 text-accent hover:bg-accent hover:text-surface"
                        : "border-line text-fg-muted hover:text-fg"
                    }`}
                  >
                    {ETIQUETAS[siguiente]}
                  </button>
                </form>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
