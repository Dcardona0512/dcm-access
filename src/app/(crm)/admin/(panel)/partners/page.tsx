import { AdminHeading } from "@/components/admin/AdminUI";
import { invitaciones } from "@/lib/data/supabase/invites";
import { partnersDelPanel, type PartnerStatus } from "@/lib/data/supabase/partners";
import { formatDateShort } from "@/lib/format";
import { siteUrl } from "@/lib/seo";

import { nuevoSocio, setPartnerStatus } from "./actions";
import { Invitacion } from "./Invitacion";

export const dynamic = "force-dynamic";

/* ============================================================================
   SOCIOS
   ----------------------------------------------------------------------------
   A DCM ACCESS no se entra: se entra INVITADO. Aquí se genera el código, se
   manda el enlace y quien lo abre entra con su correo de Google convertido ya
   en socio —porque el código se lo diste tú, y al dártelo ya confiaste—.

   El código vive quince minutos. Es corto a propósito: el enlace se manda
   cuando la persona está al otro lado esperando, no la víspera. Generar otro
   cuesta un clic.
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
  const [partners, invites] = await Promise.all([partnersDelPanel(), invitaciones(8)]);

  const pendientes = partners.filter((p) => p.status === "pending" || p.status === "in_review");
  const resto = partners.filter((p) => p.status !== "pending" && p.status !== "in_review");

  return (
    <>
      <AdminHeading
        title="Socios"
        lede="Se entra por invitación. El código vive quince minutos y sirve una sola vez."
      />

      <section className="border-line bg-surface-raised mb-10 flex flex-col gap-5 rounded-(--radius-card) border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base">Nuevo socio</h2>

          <form action={nuevoSocio}>
            <button
              type="submit"
              className="eyebrow border-accent/60 text-accent hover:bg-accent hover:text-surface cursor-pointer rounded-(--radius-card) border px-4 py-2 text-[0.7rem] transition-colors"
            >
              Crear código
            </button>
          </form>
        </div>

        {invites.length === 0 ? (
          <p className="text-fg-muted/70 text-sm text-pretty">
            Todavía no ha generado ninguna invitación.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {invites.map((invite) => (
              <li key={invite.id}>
                {invite.usedAt ? (
                  <p className="border-line-soft text-fg-muted/70 flex flex-wrap items-center justify-between gap-2 rounded-(--radius-card) border px-4 py-3 text-xs">
                    <span data-numeric>{invite.code}</span>
                    <span>
                      Usado por {invite.usedByEmail ?? "una cuenta"} el{" "}
                      {formatDateShort(invite.usedAt, "es")}
                    </span>
                  </p>
                ) : (
                  <Invitacion
                    codigo={invite.code}
                    caducaEn={invite.expiresAt}
                    origen={siteUrl}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {partners.length === 0 ? (
        <p className="border-line text-fg-muted rounded-(--radius-card) border border-dashed px-6 py-14 text-center text-sm">
          Todavía no hay socios. Genere un código y envíe el enlace.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          <Grupo titulo="Esperando revisión" partners={pendientes} />
          <Grupo titulo="Socios" partners={resto} />
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
