import Link from "next/link";

import { DIAS_PARA_VETERANA, type ResumenPublicaciones } from "@/lib/data/supabase/panel";

/* ============================================================================
   RESUMEN DEL INVENTARIO
   ----------------------------------------------------------------------------
   Vive en la barra lateral, así que se ve desde cualquier pantalla del panel
   sin tener que ir a buscarlo.

   Los tres números son enlaces y no adornos: un contador que dice «3 llevan
   más de quince días» y no deja ver CUÁLES obliga a salir a buscarlas a mano,
   que es justo el trabajo que el contador venía a ahorrar.
   ========================================================================== */

export function PanelSummary({ resumen }: { readonly resumen: ResumenPublicaciones }) {
  const filas = [
    {
      vista: "disponibles",
      etiqueta: "Disponibles",
      valor: resumen.disponibles,
      tono: "text-fg",
    },
    {
      vista: "veteranas",
      etiqueta: `Más de ${DIAS_PARA_VETERANA} días`,
      valor: resumen.veteranas,
      // En ámbar solo cuando hay algo que mirar: una alerta que siempre está
      // encendida deja de leerse a la semana.
      tono: resumen.veteranas > 0 ? "text-accent" : "text-fg-muted/50",
    },
    {
      vista: "vendidas",
      etiqueta: "Vendidas",
      valor: resumen.vendidas,
      tono: resumen.vendidas > 0 ? "text-verified" : "text-fg-muted/50",
    },
  ] as const;

  return (
    <section aria-label="Resumen del inventario" className="border-line border-t pt-5">
      <h2 className="eyebrow text-fg-muted/60 mb-3 text-[0.75rem]">Inventario</h2>

      <ul className="flex flex-col">
        {filas.map((fila) => (
          <li key={fila.vista}>
            <Link
              href={`/admin/opportunities?vista=${fila.vista}`}
              className="hover:bg-surface-sunken -mx-2 flex items-baseline justify-between gap-3 rounded-(--radius-card) px-2 py-2 transition-colors"
            >
              <span className="text-fg-muted/70 text-xs text-pretty">{fila.etiqueta}</span>
              <span className={`font-display text-lg ${fila.tono}`} data-numeric>
                {fila.valor}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
