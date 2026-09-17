"use client";

import Image from "next/image";
import { useState } from "react";

import { EditorialImage } from "@/components/ui/EditorialImage";
import type { MediaItem } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

import { Visor, type Pestana } from "./Visor";

/* ============================================================================
   GALERÍA DE MEDIOS
   ----------------------------------------------------------------------------
   Radios ocultos más selectores de hermano: cambiar de foto no ejecuta una
   sola línea de JavaScript, y sin embargo funciona con teclado —un grupo de
   radios se recorre con las flechas de forma nativa—, lo anuncia un lector de
   pantalla y el foco cae donde debe.

   La alternativa habitual, anclas con `:target`, también sería cero JS, pero
   ensucia la URL con hashes y rompe el botón atrás. Los radios no.

   Con un solo medio no hay galería: se cae a la placa de siempre, así que las
   fichas que aún no tienen fotografía se ven exactamente igual que antes.

   EL COMPONENTE ES DE CLIENTE, y solo por la lupa. Cambiar de foto sigue sin
   ejecutar JavaScript: los radios y el CSS se sirven ya renderizados y
   funcionan desde el primer byte, antes de que React hidrate. Lo único que
   espera a la hidratación es abrir la foto a pantalla completa, que es una
   mejora y no la función principal. Si el JavaScript no llega, la galería
   sigue entera.
   ========================================================================== */

/**
 * Tailwind necesita ver las clases completas para generarlas: construirlas
 * como `peer-checked/${i}:block` no produce CSS. Doce posiciones cubren el
 * límite de subida (12 fotos + 2 vídeos se recorta a este máximo).
 */
const PEERS = [
  "peer/m0",
  "peer/m1",
  "peer/m2",
  "peer/m3",
  "peer/m4",
  "peer/m5",
  "peer/m6",
  "peer/m7",
  "peer/m8",
  "peer/m9",
  "peer/m10",
  "peer/m11",
] as const;

const PANELS = [
  "peer-checked/m0:block",
  "peer-checked/m1:block",
  "peer-checked/m2:block",
  "peer-checked/m3:block",
  "peer-checked/m4:block",
  "peer-checked/m5:block",
  "peer-checked/m6:block",
  "peer-checked/m7:block",
  "peer-checked/m8:block",
  "peer-checked/m9:block",
  "peer-checked/m10:block",
  "peer-checked/m11:block",
] as const;

const THUMBS = [
  "peer-checked/m0:border-accent",
  "peer-checked/m1:border-accent",
  "peer-checked/m2:border-accent",
  "peer-checked/m3:border-accent",
  "peer-checked/m4:border-accent",
  "peer-checked/m5:border-accent",
  "peer-checked/m6:border-accent",
  "peer-checked/m7:border-accent",
  "peer-checked/m8:border-accent",
  "peer-checked/m9:border-accent",
  "peer-checked/m10:border-accent",
  "peer-checked/m11:border-accent",
] as const;

export function MediaGallery({
  media,
  label,
  className,
  lat,
  lng,
  etiqueta,
  titulo,
  url,
}: {
  readonly media: readonly MediaItem[];
  /** Nombre accesible del grupo de radios. */
  readonly label: string;
  readonly className?: string;
  /** Lo que el visor necesita para su pestaña de mapa y para compartir. */
  readonly lat?: number | null;
  readonly lng?: number | null;
  readonly etiqueta: string;
  readonly titulo: string;
  readonly url: string;
}) {
  const items = media.slice(0, PEERS.length);

  /** Pestaña del visor, o `null` con el visor cerrado. */
  const [pestana, setPestana] = useState<Pestana | null>(null);

  if (items.length <= 1) {
    return (
      <EditorialImage
        media={items[0]}
        ratio="16/9"
        priority
        sizes="(max-width: 1024px) 100vw, 62vw"
        className={className}
      />
    );
  }

  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className="sr-only">{label}</legend>

      {/*
        Los radios van ANTES de todo lo que dependa de ellos: `peer` solo
        alcanza a los hermanos POSTERIORES. Por eso la escena y las miniaturas
        cuelgan del mismo nivel y no de un contenedor intermedio.
      */}
      {items.map((item, index) => (
        <input
          key={`radio-${item.id}`}
          type="radio"
          name="dcm-gallery"
          id={`dcm-media-${item.id}`}
          defaultChecked={index === 0}
          className={cn("sr-only", PEERS[index])}
        />
      ))}

      {items.map((item, index) => (
        <div key={`panel-${item.id}`} className={cn("hidden", PANELS[index])}>
          {item.kind === "video" && item.src ? (
            /*
              `preload="none"`: el vídeo de fondo de la vertical ya viene con
              `preload="auto"`, y un segundo vídeo precargando le pelearía el
              ancho de banda en la misma página sin que nadie lo haya pedido.
            */
            <video
              controls
              preload="none"
              playsInline
              poster={item.poster}
              className="bg-surface-sunken aspect-video w-full rounded-(--radius-card) object-cover"
            >
              <source src={item.src} type="video/mp4" />
            </video>
          ) : (
            /*
              La escena entera es el botón que abre la lupa. Un icono en una
              esquina obligaría a apuntar; aquí se pulsa donde uno ya está
              mirando, que es lo que se hace por instinto con una foto.
            */
            <button
              type="button"
              onClick={() => setPestana(item.kind === "video" ? "videos" : "fotos")}
              aria-label={`Ampliar: ${item.alt}`}
              className="focus-visible:outline-accent block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <EditorialImage
                media={item}
                ratio="16/9"
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 62vw"
              />
            </button>
          )}
        </div>
      ))}

      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {items.map((item, index) => {
          const thumb = item.kind === "video" ? item.poster : item.src;

          return (
            <li key={`thumb-${item.id}`}>
              <label
                htmlFor={`dcm-media-${item.id}`}
                className={cn(
                  "border-line-soft hover:border-fg-muted/60 bg-surface-sunken relative block aspect-square",
                  "cursor-pointer overflow-hidden rounded-(--radius-card) border transition-colors",
                  THUMBS[index],
                )}
              >
                <span className="sr-only">{item.alt}</span>

                {thumb ? (
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 25vw, 12vw"
                    className="object-cover"
                  />
                ) : null}

                {item.kind === "video" ? (
                  <span
                    aria-hidden="true"
                    className="bg-surface/70 text-fg absolute inset-0 grid place-items-center"
                  >
                    <svg viewBox="0 0 12 12" className="h-3 w-3">
                      <path d="M3 2.2 10 6l-7 3.8Z" fill="currentColor" />
                    </svg>
                  </span>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>

      <Visor
        media={items}
        lat={lat}
        lng={lng}
        etiqueta={etiqueta}
        titulo={titulo}
        url={url}
        abierta={pestana}
        onCerrar={() => setPestana(null)}
        onCambiar={setPestana}
      />
    </fieldset>
  );
}
