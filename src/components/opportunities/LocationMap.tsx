"use client";

import "leaflet/dist/leaflet.css";

import type { Map as LeafletMap } from "leaflet";
import { useEffect, useRef, useState } from "react";

/* ============================================================================
   EL MAPA DE LA FICHA
   ----------------------------------------------------------------------------
   Se pulsa la ubicación y se abre el mapa. Es exactamente lo que hace
   FincaRaíz en sus fichas, y con la misma librería: cargan `leaflet@1.5.1`,
   nosotros vamos por la 1.9.4.

   Aquí NO se paga nada, y conviene tener clara la diferencia con el formulario
   de publicación: dibujar un mapa es gratis —Leaflet es una librería y los
   mosaicos los da OpenStreetMap—; lo que cuesta es convertir una dirección
   escrita en coordenadas, y eso pasa una sola vez, al publicar. Quien mira la
   ficha no consulta ningún servicio de direcciones.

   SOLO SE ENSEÑA LA ZONA. El punto guardado centra el mapa, pero encima va un
   círculo de 300 metros en lugar de un pin: una ficha pública no tiene por qué
   decir en qué portal está parqueado un carro ni cuál de las tres casas de la
   cuadra se vende. El zoom se queda en 15, que enseña el barrio y no la
   fachada.
   ========================================================================== */

/** Radio del círculo, en metros. Un barrio, no una puerta. */
const RADIO = 300;

export function LocationMap({
  lat,
  lng,
  etiqueta,
  cerrar,
}: {
  readonly lat: number;
  readonly lng: number;
  /** Texto que ya se muestra en la ficha: ciudad, región y país. */
  readonly etiqueta: string;
  readonly cerrar: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<LeafletMap | null>(null);

  useEffect(() => {
    const dialog = dialogo.current;
    if (!dialog) return;

    if (abierto && !dialog.open) dialog.showModal();
    if (!abierto && dialog.open) dialog.close();
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;

    let cancelado = false;

    void (async () => {
      const L = await import("leaflet");
      if (cancelado || !contenedor.current || mapa.current) return;

      const instancia = L.map(contenedor.current, {
        // Sin `scrollWheelZoom`: dentro de una ventana, la rueda debe seguir
        // desplazando la página y no tragarse el gesto.
        scrollWheelZoom: false,
      }).setView([lat, lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(instancia);

      L.circle([lat, lng], {
        radius: RADIO,
        color: "#c9a96a",
        weight: 1,
        fillColor: "#c9a96a",
        fillOpacity: 0.18,
      }).addTo(instancia);

      mapa.current = instancia;
    })();

    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
    };
  }, [abierto, lat, lng]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="hover:text-accent text-right underline decoration-dotted underline-offset-4 transition-colors"
      >
        {etiqueta}
      </button>

      <dialog
        ref={dialogo}
        onClose={() => setAbierto(false)}
        onClick={(evento) => {
          if (evento.target === dialogo.current) setAbierto(false);
        }}
        className="bg-surface-raised border-line text-fg m-auto w-[min(56rem,calc(100vw-2rem))] rounded-(--radius-media) border p-0 backdrop:bg-black/80"
      >
        <div className="flex flex-col">
          <header className="border-line-soft flex items-center justify-between gap-4 border-b px-6 py-4">
            <span className="text-sm">{etiqueta}</span>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label={cerrar}
              className="text-fg-muted hover:text-fg -mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg transition-colors"
            >
              ×
            </button>
          </header>

          <div
            ref={contenedor}
            role="application"
            aria-label={etiqueta}
            className="bg-surface-sunken h-[min(60vh,28rem)] w-full"
          />
        </div>
      </dialog>
    </>
  );
}
