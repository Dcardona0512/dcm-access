import Link from "next/link";

import { AdminButton, AdminHeading } from "@/components/admin/AdminUI";
import { getRepositories } from "@/lib/data";
import { leadSourceLabels, leadStatusLabels } from "@/lib/domain/labels";
import { localized, type Lead, type Opportunity } from "@/lib/domain/types";
import { formatDateShort } from "@/lib/format";

import { advanceLead } from "../actions";

/* ============================================================================
   SOLICITUDES
   ----------------------------------------------------------------------------
   Lo que deja quien pulsa CONTACTAR en una ficha. Antes caía en el tablero de
   leads, que está pensado para mover una oportunidad por seis etapas; aquí la
   pregunta es otra y mucho más corta: QUÉ HAY SIN CONTESTAR.

   Por eso la pantalla tiene dos mitades y no seis columnas. Arriba lo
   pendiente, con el teléfono y el correo a un clic y el enlace a la ficha por
   la que preguntan —sin ella la solicitud no se puede atender, porque no se
   sabe de qué habla—. Abajo, lo ya atendido, en una lista tranquila que sirve
   de memoria y no compite por la atención.

   Atender es un solo botón: pasa la solicitud de «Nuevo» a «Contactado», que
   es lo que de verdad ocurre cuando se coge el teléfono. El resto del
   recorrido comercial sigue viviendo en /admin/leads para quien lo necesite.
   ========================================================================== */

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const { leads, opportunities } = getRepositories();
  const todas = await leads.list();

  const pendientes = todas.filter((lead) => lead.status === "new");
  const atendidas = todas.filter((lead) => lead.status !== "new");

  /*
    Las fichas por las que preguntan, en una sola tanda y sin repetir: una
    misma publicación suele tener varias solicitudes, y pedirla una vez por
    tarjeta multiplicaría las consultas sin cambiar el resultado.
  */
  const ids = [...new Set(todas.map((lead) => lead.opportunityId).filter(Boolean))] as string[];
  const fichas = new Map<string, Opportunity>();

  for (const encontrada of await Promise.all(ids.map((id) => opportunities.byId(id)))) {
    if (encontrada) fichas.set(encontrada.id, encontrada);
  }

  return (
    <>
      <AdminHeading
        title="Solicitudes"
        lede="Quien pulsa «Contactar» en una publicación aparece aquí con sus datos. Lo pendiente va primero."
        action={
          <span className="eyebrow text-accent text-[0.8rem]" data-numeric>
            {pendientes.length} por revisar
          </span>
        }
      />

      <section className="flex flex-col gap-4">
        <h2 className="eyebrow text-fg-muted text-[0.8rem]">Pendientes</h2>

        {pendientes.length === 0 ? (
          <p className="border-line text-fg-muted rounded-(--radius-card) border border-dashed px-6 py-12 text-center text-sm text-pretty">
            No hay solicitudes por revisar. Las nuevas entran aquí en cuanto alguien deja sus datos
            en una ficha.
          </p>
        ) : (
          <ul className="grid gap-4 xl:grid-cols-2">
            {pendientes.map((lead) => (
              <li key={lead.id}>
                <Tarjeta lead={lead} ficha={fichaDe(lead, fichas)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {atendidas.length > 0 ? (
        <section className="mt-12 flex flex-col gap-4">
          <h2 className="eyebrow text-fg-muted text-[0.8rem]">Atendidas</h2>

          <ul className="border-line divide-line-soft divide-y rounded-(--radius-card) border">
            {atendidas.slice(0, 20).map((lead) => {
              const publicacion = fichaDe(lead, fichas);

              return (
                <li
                  key={lead.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3 text-sm"
                >
                  <span>{lead.contact.name}</span>

                  <span className="text-fg-muted/70 min-w-0 flex-1 truncate text-xs">
                    {publicacion ? localized(publicacion.title, "es") : "Contacto general"}
                  </span>

                  <span className="eyebrow text-fg-muted/60 text-[0.7rem]">
                    {localized(leadStatusLabels[lead.status], "es")}
                  </span>

                  <span className="text-fg-muted/50 text-xs" data-numeric>
                    {formatDateShort(lead.createdAt, "es")}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function fichaDe(lead: Lead, fichas: Map<string, Opportunity>): Opportunity | undefined {
  return lead.opportunityId ? fichas.get(lead.opportunityId) : undefined;
}

function Tarjeta({
  lead,
  ficha,
}: {
  readonly lead: Lead;
  readonly ficha: Opportunity | undefined;
}) {
  // wa.me solo entiende dígitos: ni espacios, ni signos, ni el más.
  const digitos = lead.contact.phone?.replace(/\D/g, "");

  return (
    <article className="border-line bg-surface-raised flex h-full flex-col gap-4 rounded-(--radius-card) border p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-display text-xl">{lead.contact.name}</span>
          <span className="eyebrow text-fg-muted/60 text-[0.7rem]">
            {localized(leadSourceLabels[lead.source], "es")} · {lead.reference}
          </span>
        </div>

        <span className="text-fg-muted/60 text-xs" data-numeric>
          {formatDateShort(lead.createdAt, "es")}
        </span>
      </header>

      {ficha ? (
        <Link
          href={`/es/${ficha.vertical}/${ficha.slug}`}
          className="border-line-soft text-fg-muted hover:border-accent/50 hover:text-accent rounded-(--radius-card) border px-3 py-2 text-sm transition-colors"
        >
          {localized(ficha.title, "es")}
        </Link>
      ) : null}

      {lead.message ? <p className="text-fg-muted text-sm text-pretty">{lead.message}</p> : null}

      {/*
        Los datos por los que existe esta pantalla, y como enlaces: lo que
        sigue a leer una solicitud es llamar o escribir, y copiar un número a
        mano desde una tabla es justo el paso donde se pierden.
      */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {digitos ? (
          <>
            <a
              href={`https://wa.me/${digitos}`}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow border-accent/50 text-accent hover:bg-accent/10 rounded-(--radius-card) border px-2.5 py-1.5 text-[0.7rem] transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${lead.contact.phone?.replace(/[^\d+]/g, "")}`}
              className="border-line-soft text-fg hover:border-fg-muted rounded-(--radius-card) border px-2.5 py-1.5"
              data-numeric
            >
              {lead.contact.phone}
            </a>
          </>
        ) : null}

        <a
          href={`mailto:${lead.contact.email}`}
          className="text-fg-muted hover:text-fg truncate underline-offset-2 hover:underline"
        >
          {lead.contact.email}
        </a>
      </div>

      <form action={advanceLead} className="mt-auto pt-1">
        <input type="hidden" name="id" value={lead.id} />
        <input type="hidden" name="status" value="contacted" />
        <AdminButton tone="accent">Marcar como atendida</AdminButton>
      </form>
    </article>
  );
}
