"use client";

import { useState } from "react";

import { EditorialImage } from "@/components/ui/EditorialImage";
import type { MediaItem } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

import { Visor, type Pestana } from "./Visor";

/* ============================================================================
   GALERÍA DE MEDIOS
   ----------------------------------------------------------------------------
   Mosaico: una fotografía grande y dos al lado, como en los portales
   inmobiliarios. Antes había una escena y una tira de miniaturas debajo, y la
   tira tenía dos problemas. Empujaba hacia abajo todo lo que importa —precio,
   ficha técnica, contacto— y dejaba las fotos a tamaño de sello; y con las
   miniaturas ahí, nadie adivina que pulsando se abre el visor, porque parece
   que ya están todas a la vista.

   El mosaico enseña tres de golpe, a tamaño en que se ve algo, y la insignia
   «+N» de la última dice cuántas faltan: es lo que invita a abrirlo. Lo demás
   —el resto del carrete, los vídeos y el mapa— vive en el visor, y los atajos
   de la esquina llevan a cada pestaña sin tener que adivinar.

   EL CAMBIO TIENE UN COSTE Y CONVIENE ESCRIBIRLO. La versión anterior eran
   radios ocultos con selectores de hermano: se cambiaba de foto sin ejecutar
   una sola línea de JavaScript. Ahora, sin JavaScript, se ven tres fotos en
   vez de todas. Se acepta porque el visor —pestañas, mapa, compartir— ya
   exigía JavaScript de todos modos, y porque tres fotos grandes informan más
   que doce sellos de correo.
   ========================================================================== */

/** Tope de subida: 12 fotos + 2 vídeos se recortan a este máximo. */
const MAXIMO = 12;

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
  /** Nombre accesible del bloque. */
  readonly label: string;
  readonly className?: string;
  /** Lo que el visor necesita para su pestaña de mapa y para compartir. */
  readonly lat?: number | null;
  readonly lng?: number | null;
  readonly etiqueta: string;
  readonly titulo: string;
  readonly url: string;
}) {
  const items = media.slice(0, MAXIMO);

  /** Pestaña del visor, o `null` con el visor cerrado. */
  const [pestana, setPestana] = useState<Pestana | null>(null);

  /*
    Solo cuenta lo que tiene archivo. Un medio sin `src` se pinta como placa
    editorial —nunca como cuadro roto—, y contarlo prometería en el atajo una
    galería que al abrirse estaría vacía.
  */
  const fotos = items.filter((item) => item.kind !== "video" && item.src);
  const videos = items.filter((item) => item.kind === "video" && item.src);
  const hayMapa = lat != null && lng != null;

  // Una ficha sin nada que enseñar se queda con la placa editorial, sin cursor
  // de mano ni atajos: no hay visor que abrir.
  if (fotos.length === 0 && videos.length === 0) {
    return <EditorialImage media={items[0]} ratio="16/9" className={className} />;
  }

  /*
    La portada es la primera FOTO, y solo si no hay ninguna manda el vídeo: una
    ficha que abre con el fotograma congelado de un vídeo se ve peor que la
    misma ficha abriendo con su mejor fotografía.
  */
  const portada = fotos[0] ?? videos[0];
  const laterales = fotos.slice(1, 3);
  const ocultas = fotos.length - 1 - laterales.length;
  const mosaico = laterales.length > 0;

  const atajos: readonly { readonly clave: Pestana; readonly texto: string }[] = [
    ...(fotos.length > 0 ? [{ clave: "fotos" as const, texto: `Galería · ${fotos.length}` }] : []),
    ...(videos.length > 0 ? [{ clave: "videos" as const, texto: "Vídeo" }] : []),
    ...(hayMapa ? [{ clave: "mapa" as const, texto: "Mapa" }] : []),
  ];

  return (
    <section aria-label={label} className={cn("relative", className)}>
      {/*
        El realce es de TODO el mosaico, no de la pieza que hay debajo del
        ratón. Pieza a pieza, mover el ratón por las tres fotos las encendía y
        apagaba por turnos, y eso las hacía parecer tres botones distintos
        —como si cada una llevara a otro sitio— cuando las tres abren lo mismo.
        El grupo vive aquí, en la rejilla, y no en la sección entera: los
        atajos de la esquina son otra cosa y no deben encender las fotos.
      */}
      <div
        className={cn(
          "group/galeria grid gap-2",
          mosaico && "grid-cols-2 sm:grid-cols-3 sm:grid-rows-2",
        )}
      >
        <Placa
          item={portada}
          prioritaria
          sizes={mosaico ? "(max-width: 640px) 100vw, 41vw" : "(max-width: 1024px) 100vw, 62vw"}
          onAbrir={() => setPestana(portada.kind === "video" ? "videos" : "fotos")}
          className={mosaico ? "col-span-2 aspect-[4/3] sm:row-span-2" : "aspect-video"}
        />

        {laterales.map((foto, indice) => (
          <Placa
            key={foto.id}
            item={foto}
            sizes="(max-width: 640px) 50vw, 21vw"
            onAbrir={() => setPestana("fotos")}
            insignia={indice === laterales.length - 1 && ocultas > 0 ? ocultas : undefined}
            /*
              En móvil las dos laterales van una al lado de otra con su propia
              proporción; en pantalla ancha se estiran a la altura que les deja
              la portada, que es la que manda la forma del mosaico.
            */
            className={cn("aspect-[4/3] sm:aspect-auto", laterales.length === 1 && "sm:row-span-2")}
          />
        ))}
      </div>

      {/*
        Los atajos flotan sobre la esquina, no debajo del mosaico: debajo
        volverían a empujar la ficha hacia abajo, que es justo lo que se quitó.
        `pointer-events-none` en la banda para no robarle el clic a la foto, y
        de vuelta en cada botón.
      */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap justify-end gap-2 p-3">
        {atajos.map((atajo) => (
          <button
            key={atajo.clave}
            type="button"
            onClick={() => setPestana(atajo.clave)}
            className="eyebrow border-line-soft bg-surface/90 text-fg hover:border-fg-muted pointer-events-auto cursor-pointer rounded-(--radius-card) border px-3 py-1.5 text-[0.7rem] backdrop-blur transition-colors"
          >
            {atajo.texto}
          </button>
        ))}
      </div>

      <Visor
        /* Lo mismo que arriba: al visor solo van los medios con archivo. */
        media={[...fotos, ...videos]}
        lat={lat}
        lng={lng}
        etiqueta={etiqueta}
        titulo={titulo}
        url={url}
        abierta={pestana}
        onCerrar={() => setPestana(null)}
        onCambiar={setPestana}
      />
    </section>
  );
}

/**
 * Una pieza del mosaico.
 *
 * Es un `<button>` entero, no un icono en una esquina: se pulsa donde uno ya
 * está mirando. De ahí el cursor de mano —lo que se espera de algo que se
 * pulsa— y el realce al pasar por encima, que es lo que avisa de que la foto
 * hace algo antes de que nadie pruebe a pulsarla.
 */
function Placa({
  item,
  className,
  sizes,
  prioritaria = false,
  insignia,
  onAbrir,
}: {
  readonly item: MediaItem;
  readonly className?: string;
  readonly sizes: string;
  readonly prioritaria?: boolean;
  /** Cuántas fotos quedan fuera del mosaico; solo en la última pieza. */
  readonly insignia?: number;
  readonly onAbrir: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={insignia ? `Ver las ${insignia} fotos restantes` : `Ampliar: ${item.alt}`}
      className={cn(
        "focus-visible:outline-accent relative block w-full cursor-pointer",
        "overflow-hidden rounded-(--radius-card) focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      <EditorialImage
        media={item}
        ratio="fill"
        priority={prioritaria}
        sizes={sizes}
        className="transition-transform duration-(--duration-slow) ease-(--ease-brand) group-hover/galeria:scale-[1.04]"
      />

      {/* Velo de realce: oscurece apenas lo justo para que se note el paso del ratón. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-black/0 transition-colors duration-(--duration-fast) group-hover/galeria:bg-black/15"
      />

      {item.kind === "video" ? (
        <span
          aria-hidden="true"
          className="bg-surface/70 text-fg absolute inset-0 grid place-items-center"
        >
          <svg viewBox="0 0 12 12" className="h-8 w-8">
            <path d="M3 2.2 10 6l-7 3.8Z" fill="currentColor" />
          </svg>
        </span>
      ) : null}

      {/*
        Marca de esquina y no un velo sobre la foto entera: tapar la tercera
        fotografía para avisar de que hay más es pagar con lo que se venía a
        enseñar. Pequeña basta, porque el atajo «Galería» ya lleva la cuenta.
      */}
      {insignia ? (
        <span
          aria-hidden="true"
          className="bg-surface/85 text-fg absolute top-2 right-2 rounded-(--radius-card) px-2 py-1 text-[0.7rem] font-semibold backdrop-blur"
        >
          +{insignia}
        </span>
      ) : null}
    </button>
  );
}
