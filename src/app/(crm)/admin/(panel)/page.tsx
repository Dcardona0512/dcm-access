import Link from "next/link";

import { AdminHeading } from "@/components/admin/AdminUI";
import { DIAS_PARA_VETERANA } from "@/lib/data/panel-shared";
import { resumenPublicaciones } from "@/lib/data/supabase/panel";

export const dynamic = "force-dynamic";

/* ============================================================================
   RESUMEN
   ----------------------------------------------------------------------------
   La primera pantalla del panel. Responde a lo único que se pregunta al
   entrar: qué hay publicado, qué lleva demasiado tiempo parado y qué se
   vendió.

   Los tres números son enlaces, no adornos. Un contador que dice «tres llevan
   más de quince días» y no deja ver CUÁLES obliga a salir a buscarlas a mano,
   que es justo el trabajo que el contador venía a ahorrar.

   Las de demostración quedan fuera de todas las cuentas: son dieciséis contra
   las reales, e incluirlas convertiría el resumen en un número que no habla
   del negocio de nadie.
   ========================================================================== */

const FILAS = [
  {
    vista: "disponibles",
    etiqueta: "Disponibles",
    pie: "Publicadas y a la venta.",
  },
  {
    vista: "veteranas",
    etiqueta: `Más de ${DIAS_PARA_VETERANA} días`,
    pie: "Llevan tiempo sin moverse.",
  },
  {
    vista: "vendidas",
    etiqueta: "Vendidas",
    pie: "Fuera del catálogo, aquí para el historial.",
  },
] as const;

export default async function AdminHomePage() {
  const resumen = await resumenPublicaciones();

  return (
    <>
      <AdminHeading title="Resumen" />

      {resumen ? (
        <ul className="grid gap-5 sm:grid-cols-3">
          {FILAS.map((fila) => {
            const valor = resumen[fila.vista];

            // En color solo cuando hay algo que mirar: un aviso siempre
            // encendido deja de leerse a la semana.
            const tono =
              fila.vista === "disponibles"
                ? "text-fg"
                : valor === 0
                  ? "text-fg-muted/40"
                  : fila.vista === "veteranas"
                    ? "text-accent"
                    : "text-verified";

            return (
              <li key={fila.vista}>
                <Link
                  href={`/admin/opportunities?vista=${fila.vista}`}
                  className="dcm-card-media border-line bg-surface-raised group flex h-full flex-col gap-2 rounded-(--radius-media) border p-6"
                >
                  <span className={`font-display text-5xl ${tono}`} data-numeric>
                    {valor}
                  </span>
                  <span className="group-hover:text-accent text-sm transition-colors">
                    {fila.etiqueta}
                  </span>
                  <span className="text-fg-muted/60 text-xs text-pretty">{fila.pie}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p
          role="alert"
          className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm text-pretty"
        >
          No se pudo leer el inventario. Falta <code>SUPABASE_SECRET_KEY</code> en este entorno, o
          la consulta no respondió.
        </p>
      )}

      <div className="border-line-soft mt-10 border-t pt-8">
        <Link
          href="/admin/publicar"
          className="eyebrow border-accent/50 text-accent hover:bg-accent/10 inline-flex rounded-(--radius-card) border px-4 py-2.5 text-[0.75rem] transition-colors"
        >
          Crear publicación
        </Link>
      </div>
    </>
  );
}
