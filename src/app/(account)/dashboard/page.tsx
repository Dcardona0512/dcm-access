import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession, panelDe } from "@/lib/auth/session";
import { misConsultas } from "@/lib/data/supabase/account";
import { formatDateShort } from "@/lib/format";
import { localeDeCookie } from "@/lib/i18n/cookie";

/* ============================================================================
   PANEL DEL CLIENTE
   ----------------------------------------------------------------------------
   Lo mínimo que hace útil tener cuenta: qué he preguntado, cuándo y en qué
   estado va. Nada más, y a propósito: prometer secciones vacías —favoritos,
   mensajes, recomendaciones— es peor que no tenerlas, porque enseña una
   plataforma que no existe todavía.

   Las consultas se leen con la sesión de quien mira, así que la base solo
   devuelve las suyas aunque esta página pidiera todas.
   ========================================================================== */

const ESTADOS: Record<string, string> = {
  new: "Recibida",
  qualified: "En estudio",
  contacted: "Contactado",
  negotiation: "En negociación",
  closed: "Cerrada",
  commission: "Cerrada",
};

export default async function ClientDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Un partner o alguien del equipo que aterrice aquí va a su sitio.
  if (session.role !== "client") redirect(panelDe(session.role));

  const locale = await localeDeCookie();
  const consultas = await misConsultas();

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">
          {session.fullName ? `Hola, ${session.fullName}` : "Su cuenta"}
        </h1>
        <p className="text-fg-muted text-pretty">
          Aquí quedan las oportunidades por las que ha preguntado y en qué punto está cada una.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="eyebrow text-fg-muted text-[0.8rem]">Mis consultas</h2>

        {consultas.length === 0 ? (
          <div className="border-line flex flex-col items-center gap-4 rounded-(--radius-card) border border-dashed px-6 py-14 text-center">
            <p className="text-fg-muted text-pretty">
              Todavía no ha preguntado por ninguna oportunidad.
            </p>
            <Link
              href={`/${locale}/real-estate`}
              className="eyebrow border-accent/60 text-accent hover:bg-accent hover:text-surface rounded-(--radius-card) border px-5 py-2.5 text-[0.75rem] transition-colors"
            >
              Ver oportunidades
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {consultas.map((consulta) => (
              <li
                key={consulta.id}
                className="border-line bg-surface-raised flex flex-col gap-3 rounded-(--radius-card) border p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="eyebrow text-accent text-[0.75rem]" data-numeric>
                    {consulta.reference}
                  </span>
                  <span className="text-fg-muted/70 text-xs" data-numeric>
                    {formatDateShort(consulta.createdAt, locale)}
                  </span>
                </div>

                {consulta.message ? (
                  <p className="text-fg-muted line-clamp-2 text-sm text-pretty">
                    {consulta.message}
                  </p>
                ) : null}

                <span className="eyebrow border-line-soft text-fg-muted w-fit rounded-(--radius-card) border px-2.5 py-1 text-[0.7rem]">
                  {ESTADOS[consulta.status] ?? consulta.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
