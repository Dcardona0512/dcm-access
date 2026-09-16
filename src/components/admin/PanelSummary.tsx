"use client";

import Link from "next/link";
import { useRef } from "react";

import { DIAS_PARA_VETERANA, type ResumenPublicaciones } from "@/lib/data/panel-shared";

/* ============================================================================
   RESUMEN DEL INVENTARIO
   ----------------------------------------------------------------------------
   Una entrada más de la barra que abre una ventana, y no un bloque de números
   siempre encendido debajo del menú. La diferencia importa: el resumen se
   consulta de vez en cuando, y lo que se consulta de vez en cuando no debe
   ocupar sitio permanente en la única barra que hay.

   Se usa `<dialog>` del navegador con `showModal()`, no un div flotante. Sale
   gratis todo lo que un modal hecho a mano suele olvidar: la tecla Escape, el
   foco atrapado dentro mientras está abierto, el foco devuelto al botón al
   cerrar, y el resto de la página marcado como inerte para los lectores de
   pantalla.
   ========================================================================== */

export function PanelSummary({ resumen }: { readonly resumen: ResumenPublicaciones }) {
  const dialogo = useRef<HTMLDialogElement>(null);

  const filas = [
    {
      vista: "disponibles",
      etiqueta: "Disponibles",
      pie: "Publicadas y a la venta.",
      valor: resumen.disponibles,
      tono: "text-fg",
    },
    {
      vista: "veteranas",
      etiqueta: `Más de ${DIAS_PARA_VETERANA} días`,
      pie: "Llevan tiempo sin moverse.",
      valor: resumen.veteranas,
      // En ámbar solo cuando hay algo que mirar: una alerta siempre encendida
      // deja de leerse a la semana.
      tono: resumen.veteranas > 0 ? "text-accent" : "text-fg-muted/50",
    },
    {
      vista: "vendidas",
      etiqueta: "Vendidas",
      pie: "Fuera del catálogo, aquí para el historial.",
      valor: resumen.vendidas,
      tono: resumen.vendidas > 0 ? "text-verified" : "text-fg-muted/50",
    },
  ] as const;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className="eyebrow text-fg-muted hover:text-fg block w-full rounded-(--radius-card) px-3 py-2.5 text-left text-[0.75rem] transition-colors"
      >
        Resumen
      </button>

      <dialog
        ref={dialogo}
        // Cerrar al pulsar fuera. El `<dialog>` ocupa toda la pantalla cuando
        // es modal, así que un clic en el fondo llega aquí con `target` siendo
        // el propio diálogo; si el clic fue en el contenido, el `target` es
        // otro y no se cierra.
        onClick={(event) => {
          if (event.target === dialogo.current) dialogo.current?.close();
        }}
        className="bg-surface-raised border-line text-fg m-auto w-[min(26rem,calc(100vw-2rem))] rounded-(--radius-media) border p-0 backdrop:bg-black/70"
      >
        <div className="flex flex-col gap-6 p-7">
          <header className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-xl tracking-[0.02em] uppercase">Inventario</h2>
              <p className="text-fg-muted/60 text-xs">Solo sus publicaciones, sin las de demostración.</p>
            </div>

            <button
              type="button"
              onClick={() => dialogo.current?.close()}
              aria-label="Cerrar"
              className="text-fg-muted hover:text-fg -mt-1 -mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg transition-colors"
            >
              ×
            </button>
          </header>

          {/*
            Los números son enlaces, no adornos. Un contador que dice «tres
            llevan más de quince días» y no deja ver CUÁLES obliga a salir a
            buscarlas a mano, que es el trabajo que venía a ahorrar.
          */}
          <ul className="border-line-soft divide-line-soft flex flex-col divide-y border-y">
            {filas.map((fila) => (
              <li key={fila.vista}>
                <Link
                  href={`/admin/opportunities?vista=${fila.vista}`}
                  onClick={() => dialogo.current?.close()}
                  className="hover:bg-surface-sunken flex items-center justify-between gap-4 px-2 py-4 transition-colors"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm">{fila.etiqueta}</span>
                    <span className="text-fg-muted/50 text-xs text-pretty">{fila.pie}</span>
                  </span>
                  <span className={`font-display text-2xl ${fila.tono}`} data-numeric>
                    {fila.valor}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
