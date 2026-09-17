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

   SE ENSEÑA EL PUNTO EXACTO, con marcador y a zoom de calle, que es como lo
   hace FincaRaíz y lo que se pidió expresamente. Hubo una versión con un
   círculo de 300 metros y sin pin, por no publicar dónde está parqueado un
   carro; se descartó a favor de enseñar lo mismo que enseña el portal con el
   que se compara. Queda dicho aquí porque es una decisión de negocio, no un
   descuido: lo que se publica es la dirección real del activo.
   ========================================================================== */

/** Zoom de calle: se leen los nombres de las vías y se sitúa la manzana. */
const ZOOM = 16;

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
      }).setView([lat, lng], ZOOM);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(instancia);

      /*
        El mismo marcador rojo del formulario: lo que el administrador coloca
        al publicar es exactamente lo que ve quien mira la ficha, y no hay dos
        símbolos distintos para la misma cosa.

        Anclado en la PUNTA, que es la que señala la coordenada.
      */
      const pin = L.divIcon({
        className: "",
        html:
          '<svg viewBox="0 0 28 36" width="28" height="36" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0Z" fill="#e5484d"/>' +
          '<circle cx="14" cy="13.5" r="5" fill="#ffffff"/>' +
          "</svg>",
        iconSize: [28, 36],
        iconAnchor: [14, 36],
      });

      L.marker([lat, lng], { icon: pin, keyboard: false }).addTo(instancia);

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
        className="bg-surface-raised border-line text-fg m-auto w-[min(72rem,calc(100vw-2rem))] rounded-(--radius-media) border p-0 backdrop:bg-black/80"
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
            className="bg-surface-sunken h-[min(72vh,34rem)] w-full"
          />
        </div>
      </dialog>
    </>
  );
}
