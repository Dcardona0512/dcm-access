"use client";

import "leaflet/dist/leaflet.css";

import type { Map as LeafletMap } from "leaflet";

import { PIN_ANCHOR, PIN_HTML, PIN_SIZE } from "@/components/ui/mapPin";
import { useEffect, useRef } from "react";

/* ============================================================================
   EL MAPA DE LA FICHA
   ----------------------------------------------------------------------------
   Va incrustado en la página, no tras un clic. Es como lo hace FincaRaíz —y
   con la misma librería: cargan `leaflet@1.5.1`, nosotros vamos por la 1.9.4—
   y tiene una razón: dónde está algo es de las primeras preguntas que se hace
   quien mira, y esconderla tras un botón obliga a preguntar antes de ver.

   Aquí no se paga nada, y la diferencia con el formulario conviene tenerla
   clara: dibujar un mapa es gratis —Leaflet es una librería y los mosaicos los
   da OpenStreetMap—; lo que cuesta es convertir una dirección escrita en
   coordenadas, y eso pasa una sola vez, al publicar. Quien mira la ficha no
   consulta ningún servicio de direcciones.

   Se enseña el punto exacto, con marcador y a zoom de calle. Quien publique
   debe saberlo: la dirección que marque en el formulario es la que verá
   cualquiera.

   SE MONTA AL ASOMARSE. Un mapa pide una docena de imágenes al servidor de
   mosaicos, y la mayoría de quien abre una ficha no baja hasta aquí. El
   observador espera a que la sección se acerque; hasta entonces no se descarga
   ni un byte.
   ========================================================================== */

/** Zoom de calle: se leen los nombres de las vías y se sitúa la manzana. */
const ZOOM = 16;

export function MapaFicha({
  lat,
  lng,
  etiqueta,
  className,
  interactivo = true,
}: {
  readonly lat: number;
  readonly lng: number;
  /** Texto que acompaña al mapa: ciudad, región y país. */
  readonly etiqueta: string;
  /** Alto propio. El de la ficha y el del visor no miden igual. */
  readonly className?: string;
  /**
   * En la ficha va APAGADO: el mapa es una vista previa que se pulsa para
   * abrir el visor, y si arrastrara se quedaría con el gesto en vez de dejarlo
   * llegar al botón que lo envuelve. Dentro del visor va encendido, que es
   * donde de verdad se explora.
   */
  readonly interactivo?: boolean;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<LeafletMap | null>(null);
  const tamano = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const nodo = contenedor.current;
    if (!nodo) return;

    let cancelado = false;

    async function montar() {
      const L = await import("leaflet");
      if (cancelado || !nodo || mapa.current) return;

      const instancia = L.map(nodo, {
        // Sin zoom con la rueda ni en el visor: al bajar por la página el
        // gesto debe seguir desplazándola y no quedarse atrapado en el mapa.
        scrollWheelZoom: false,
        dragging: interactivo,
        touchZoom: interactivo,
        doubleClickZoom: interactivo,
        boxZoom: interactivo,
        keyboard: interactivo,
        zoomControl: interactivo,
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
        html: PIN_HTML,
        iconSize: PIN_SIZE,
        iconAnchor: PIN_ANCHOR,
      });

      L.marker([lat, lng], { icon: pin, keyboard: false }).addTo(instancia);
      mapa.current = instancia;

      /*
        Leaflet mide el contenedor al crearse y no vuelve a mirar. Dentro del
        visor el mapa nace en una ventana que se acaba de abrir, cuyo alto
        todavía se está resolviendo, así que se queda con una medida que no es
        la definitiva: los mosaicos se piden para un recuadro equivocado y lo
        que se ve es un gris uniforme con el pin en medio.

        `invalidateSize` le dice que vuelva a medir. Se llama una vez en el
        siguiente fotograma y luego cada vez que el contenedor cambie de
        tamaño, que además cubre el giro del teléfono.
      */
      requestAnimationFrame(() => instancia.invalidateSize());

      const observadorTamano = new ResizeObserver(() => instancia.invalidateSize());
      observadorTamano.observe(nodo);
      tamano.current = observadorTamano;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();
        void montar();
      },
      // Margen generoso: arranca poco antes de que asome, para que al llegar
      // ya haya mapa y no un rectángulo vacío.
      { rootMargin: "400px 0px" },
    );

    observador.observe(nodo);

    return () => {
      cancelado = true;
      observador.disconnect();
      tamano.current?.disconnect();
      tamano.current = null;
      mapa.current?.remove();
      mapa.current = null;
    };
  }, [lat, lng, interactivo]);

  return (
    <div
      ref={contenedor}
      role="application"
      aria-label={etiqueta}
      className={`border-line bg-surface-sunken w-full overflow-hidden rounded-(--radius-media) border ${className ?? "h-[min(55vh,26rem)]"}`}
    />
  );
}
