"use client";

import "leaflet/dist/leaflet.css";

import type { DivIcon, Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";

/* ============================================================================
   SELECTOR DE UBICACIÓN
   ----------------------------------------------------------------------------
   Leaflet sobre mosaicos de OpenStreetMap: sin claves, sin cuentas y sin
   tarjeta. Para un formulario interno que se usa unas cuantas veces al día es
   de sobra, y evita atar el proyecto a la facturación de un proveedor.

   Leaflet toca `window` al importarse, así que se carga con `import()` dentro
   de un efecto. Importarlo arriba rompería el renderizado en servidor.

   El punto exacto se guarda, pero la ficha pública solo muestra la ciudad. La
   dirección de un vehículo o una vivienda no es información de catálogo.
   ========================================================================== */

const MEDELLIN: [number, number] = [6.2442, -75.5812];

export type PickedPoint = { readonly lat: number; readonly lng: number; readonly label?: string };

/**
 * Geocodificación inversa con Nominatim, el servicio del propio OpenStreetMap.
 *
 * Es cortesía pública y va limitada, así que se consulta solo al soltar un
 * punto —nunca mientras se arrastra el mapa—. Si falla no pasa nada: la ciudad
 * se escribe a mano, que es justamente por qué el campo sigue siendo editable.
 */
async function lookupCity(lat: number, lng: number): Promise<string | undefined> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=es`,
    );
    if (!response.ok) return undefined;

    const data = (await response.json()) as { address?: Record<string, string> };
    const address = data.address ?? {};

    return (
      address.city ?? address.town ?? address.village ?? address.municipality ?? address.county
    );
  } catch {
    return undefined;
  }
}

export function LocationPicker({
  center,
  marca,
  onChange,
}: {
  /** Ciudad elegida arriba. El mapa la sigue en vez de obligar a buscarla. */
  readonly center?: { readonly lat: number; readonly lng: number } | null;
  /**
   * Punto que viene de buscar una dirección. Distinto de `center` a propósito:
   * una ciudad se mira desde arriba y no lleva pin —no es un punto, es un
   * área—, mientras que una dirección SÍ es un punto y hay que marcarlo.
   */
  readonly marca?: { readonly lat: number; readonly lng: number } | null;
  readonly onChange: (point: PickedPoint) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);

  /**
   * El módulo y el icono se guardan al montar.
   *
   * Antes el pin se creaba DENTRO del manejador del clic, así que solo existía
   * si alguien hacía clic: al elegir una dirección el mapa volaba hasta ella y
   * no marcaba nada. Guardarlos aquí permite colocar el pin desde cualquier
   * sitio, venga de un clic o de una búsqueda.
   */
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const icon = useRef<DivIcon | null>(null);

  /**
   * El mapa se monta una sola vez, así que el efecto capturaría el `onChange`
   * del primer render. La referencia hace que siempre llame al actual, y se
   * actualiza dentro de un efecto: escribir en una ref durante el render es un
   * efecto secundario en mitad de una fase que debe ser pura.
   */
  const notify = useRef(onChange);
  useEffect(() => {
    notify.current = onChange;
  }, [onChange]);

  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [looking, setLooking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !container.current || map.current) return;

      const instance = L.map(container.current).setView(MEDELLIN, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(instance);

      /**
       * El icono por defecto de Leaflet apunta a imágenes por ruta relativa que
       * el empaquetador no resuelve, y salen marcadores rotos. Un `divIcon` es
       * HTML propio: sin assets que perder y con el color de la marca.
       */
      leaflet.current = L;

      const pin = L.divIcon({
        className: "",
        html: '<span style="display:block;width:14px;height:14px;border-radius:999px;background:#c9a96a;box-shadow:0 0 0 4px rgba(201,169,106,.3)"></span>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      icon.current = pin;

      instance.on("click", (event) => {
        const { lat, lng } = event.latlng;

        if (marker.current) marker.current.setLatLng(event.latlng);
        else marker.current = L.marker(event.latlng, { icon: pin }).addTo(instance);

        setPoint({ lat, lng });
        setLooking(true);

        void lookupCity(lat, lng).then((label) => {
          setLooking(false);
          notify.current({ lat, lng, label });
        });
      });

      map.current = instance;
    })();

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Al elegir ciudad arriba, el mapa vuela hasta ella. Sin esto habría que
  // arrastrar el mundo entero desde Medellín cada vez. Zoom de ciudad: se
  // quiere ver el municipio entero, no una esquina.
  useEffect(() => {
    if (!center || !map.current) return;
    map.current.setView([center.lat, center.lng], 12);
  }, [center]);

  /**
   * Al elegir una dirección, el pin se coloca solo.
   *
   * Y con zoom de calle, no de ciudad: a zoom 12 el punto exacto es un píxel
   * perdido en el municipio, imposible de afinar arrastrando. A 17 se ven las
   * manzanas, que es donde se corrige lo que la búsqueda no supo precisar.
   */
  useEffect(() => {
    const L = leaflet.current;
    if (!marca || !map.current || !L || !icon.current) return;

    const posicion: [number, number] = [marca.lat, marca.lng];

    if (marker.current) marker.current.setLatLng(posicion);
    else marker.current = L.marker(posicion, { icon: icon.current }).addTo(map.current);

    map.current.setView(posicion, 17);
    setPoint({ lat: marca.lat, lng: marca.lng });
  }, [marca]);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={container}
        role="application"
        aria-label="Mapa para marcar la ubicación"
        className="border-line h-72 w-full overflow-hidden rounded-(--radius-card) border"
      />
      <p className="text-fg-muted/70 text-xs">
        {point
          ? looking
            ? "Buscando la ciudad…"
            : `Marcado en ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}. Al público solo se le muestra la ciudad.`
          : "Opcional: haga clic para marcar el punto exacto. La ciudad ya se tomó del desplegable."}
      </p>
    </div>
  );
}
