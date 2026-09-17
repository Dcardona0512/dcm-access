"use client";

import { useState } from "react";

import { MapaFicha } from "./MapaFicha";
import { Visor, type Pestana } from "./Visor";
import type { MediaItem } from "@/lib/domain/types";

/* ============================================================================
   UBICACIÓN, EN LA FICHA
   ----------------------------------------------------------------------------
   Título, dirección y mapa, uno debajo del otro. El mapa se ve sin pulsar
   nada: dónde está algo es de las primeras preguntas de quien mira, y
   esconderla tras un botón obliga a preguntar antes de ver.

   El mapa de aquí es una VISTA PREVIA y no se arrastra. Si lo hiciera, el
   gesto se quedaría dentro del mapa en lugar de llegar al botón que lo
   envuelve, y pulsarlo para ampliar dejaría de funcionar. Dentro del visor sí
   se arrastra, que es donde se explora de verdad.
   ========================================================================== */

export function SeccionUbicacion({
  titulo,
  etiqueta,
  lat,
  lng,
  media,
  tituloFicha,
  url,
}: {
  readonly titulo: string;
  readonly etiqueta: string;
  readonly lat: number;
  readonly lng: number;
  /** El visor es el mismo para todo, así que también necesita los medios. */
  readonly media: readonly MediaItem[];
  readonly tituloFicha: string;
  readonly url: string;
}) {
  const [pestana, setPestana] = useState<Pestana | null>(null);

  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-2xl">{titulo}</h2>
      <p className="text-fg-muted text-sm">{etiqueta}</p>

      <button
        type="button"
        onClick={() => setPestana("mapa")}
        aria-label={`Ampliar el mapa: ${etiqueta}`}
        className="focus-visible:outline-accent block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <MapaFicha lat={lat} lng={lng} etiqueta={etiqueta} interactivo={false} />
      </button>

      <Visor
        media={media}
        lat={lat}
        lng={lng}
        etiqueta={etiqueta}
        titulo={tituloFicha}
        url={url}
        abierta={pestana}
        onCerrar={() => setPestana(null)}
        onCambiar={setPestana}
      />
    </section>
  );
}
