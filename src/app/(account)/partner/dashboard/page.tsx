import { Country } from "country-state-city";
import { redirect } from "next/navigation";

import { getSession, panelDe } from "@/lib/auth/session";
import { miPartner, misFichas } from "@/lib/data/supabase/account";
import { formatCountry, formatDateShort } from "@/lib/format";
import { localeDeCookie } from "@/lib/i18n/cookie";

import { PartnerOnboarding } from "./PartnerOnboarding";

/* ============================================================================
   PANEL DEL PARTNER
   ----------------------------------------------------------------------------
   Dos pantallas en una, según dónde esté:

   · Sin ficha todavía → el alta. Quien se registró diciendo que tiene algo que
     ofrecer necesita decir QUÉ ofrece antes de que nadie pueda verificarlo.
   · Con ficha → en qué punto va la verificación y, si ya está verificado, sus
     publicaciones.

   Publicar todavía no está abierto al partner: hasta que lo esté, la pantalla
   lo dice en lugar de enseñar un botón que no lleva a ninguna parte.
   ========================================================================== */

const ESTADOS: Record<string, { readonly texto: string; readonly detalle: string }> = {
  pending: {
    texto: "Pendiente de revisión",
    detalle: "Hemos recibido sus datos. Le escribimos en cuanto revisemos la ficha.",
  },
  in_review: {
    texto: "En revisión",
    detalle: "Estamos comprobando la información. Puede que le pidamos algún documento.",
  },
  verified: {
    texto: "Verificado",
    detalle: "Su ficha está verificada por DCM ACCESS.",
  },
  rejected: {
    texto: "No aprobada",
    detalle: "La ficha no pasó la revisión. Escríbanos si cree que es un error.",
  },
  suspended: {
    texto: "Suspendida",
    detalle: "La ficha está suspendida temporalmente.",
  },
};

export default async function PartnerDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  /*
    Aquí entra quien YA es partner y también quien dijo que quería serlo y
    todavía es cliente: sin dejarle pasar no podría darse de alta nunca. Lo que
    no entra es el equipo, que tiene su propio panel.
  */
  if (session.role !== "partner" && session.role !== "client") {
    redirect(panelDe(session.role));
  }

  const locale = await localeDeCookie();
  const partner = await miPartner();

  if (!partner) {
    /*
      La lista entera de países va en el HTML —son unos pocos kilobytes— y lo
      que no cabe, las divisiones y las ciudades, se pide al servidor cuando
      hace falta. Mismo criterio que en el formulario de publicar.
    */
    const countries = Country.getAllCountries()
      .map((pais) => ({
        code: pais.isoCode,
        name: formatCountry(pais.isoCode, "es") || pais.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));

    return (
      <PartnerOnboarding nombre={session.fullName ?? session.email} countries={countries} />
    );
  }

  const estado = ESTADOS[partner.status] ?? ESTADOS.pending;
  const fichas = partner.status === "verified" ? await misFichas() : [];

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{partner.companyName}</h1>
        <p className="text-fg-muted text-pretty">Panel de partner de DCM ACCESS.</p>
      </header>

      <section className="border-line bg-surface-raised flex flex-col gap-3 rounded-(--radius-card) border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="eyebrow text-fg-muted text-[0.8rem]">Verificación</h2>
          <span
            className={`eyebrow rounded-(--radius-card) border px-3 py-1.5 text-[0.7rem] ${
              partner.status === "verified"
                ? "border-accent/60 text-accent"
                : "border-line-soft text-fg-muted"
            }`}
          >
            {estado.texto}
          </span>
        </div>

        <p className="text-fg-muted text-sm text-pretty">{estado.detalle}</p>

        {partner.verifiedAt ? (
          <p className="text-fg-muted/60 text-xs" data-numeric>
            Verificado el {formatDateShort(partner.verifiedAt, locale)}
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="eyebrow text-fg-muted text-[0.8rem]">Mis publicaciones</h2>

        {partner.status !== "verified" ? (
          <p className="border-line text-fg-muted rounded-(--radius-card) border border-dashed px-6 py-10 text-center text-sm text-pretty">
            Podrá publicar en cuanto su ficha esté verificada.
          </p>
        ) : fichas.length === 0 ? (
          <p className="border-line text-fg-muted rounded-(--radius-card) border border-dashed px-6 py-10 text-center text-sm text-pretty">
            Todavía no tiene publicaciones. Escríbanos y las damos de alta con usted mientras
            terminamos la publicación directa.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {fichas.map((ficha) => (
              <li
                key={ficha.id}
                className="border-line bg-surface-raised flex flex-wrap items-center justify-between gap-3 rounded-(--radius-card) border p-4"
              >
                <span className="text-sm">{ficha.title}</span>
                <span className="eyebrow text-fg-muted text-[0.7rem]">{ficha.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
