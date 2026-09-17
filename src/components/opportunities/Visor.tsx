"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { MapaFicha } from "./MapaFicha";
import type { MediaItem } from "@/lib/domain/types";

/* ============================================================================
   VISOR DE LA FICHA
   ----------------------------------------------------------------------------
   Pantalla completa con tres pestañas —fotos, vídeos y mapa— y un botón para
   compartir. Se abre pulsando una foto o el mapa, y abre POR la pestaña de lo
   que se pulsó: quien pincha el mapa quiere el mapa, no empezar por la primera
   foto y tener que buscarlo.

   Las pestañas que no tienen contenido no se pintan. Una ficha sin vídeo no
   debe enseñar una pestaña vacía que invite a pulsarla para nada.

   Es un `<dialog>` con `showModal()`, no un div flotante: la tecla Escape, el
   foco atrapado dentro mientras está abierto, el foco devuelto al abridor al
   cerrar y el resto de la página inerte para los lectores de pantalla vienen
   dados. Lo que sí hay que añadir son las flechas para recorrer el carrete.
   ========================================================================== */

export type Pestana = "fotos" | "videos" | "mapa";

export function Visor({
  media,
  lat,
  lng,
  etiqueta,
  titulo,
  url,
  abierta,
  onCerrar,
  onCambiar,
}: {
  readonly media: readonly MediaItem[];
  readonly lat?: number | null;
  readonly lng?: number | null;
  readonly etiqueta: string;
  readonly titulo: string;
  /** Enlace absoluto de la ficha: es lo que se comparte. */
  readonly url: string;
  /** Pestaña visible, o `null` con el visor cerrado. */
  readonly abierta: Pestana | null;
  readonly onCerrar: () => void;
  readonly onCambiar: (pestana: Pestana) => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [copiado, setCopiado] = useState(false);

  const fotos = media.filter((item) => item.kind !== "video");
  const videos = media.filter((item) => item.kind === "video");
  const hayMapa = lat != null && lng != null;

  const pestanas: readonly { readonly clave: Pestana; readonly texto: string }[] = [
    ...(fotos.length > 0 ? [{ clave: "fotos" as const, texto: "Fotos" }] : []),
    ...(videos.length > 0 ? [{ clave: "videos" as const, texto: "Vídeos" }] : []),
    ...(hayMapa ? [{ clave: "mapa" as const, texto: "Mapa" }] : []),
  ];

  useEffect(() => {
    const dialog = dialogo.current;
    if (!dialog) return;

    if (abierta && !dialog.open) dialog.showModal();
    if (!abierta && dialog.open) dialog.close();
  }, [abierta]);

  // El aviso de «copiado» se retira solo: un cartel que se queda puesto deja de
  // significar «acabo de copiar» y pasa a ser parte del decorado.
  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

  async function compartir() {
    /*
      En móvil se abre la hoja del sistema, que es donde está WhatsApp. En
      escritorio casi ningún navegador la tiene, así que se copia el enlace: es
      lo que la persona iba a hacer a mano de todos modos.
    */
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch {
        // Cancelado por la persona o no permitido: se cae a copiar.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      // Sin portapapeles no se puede hacer más; el enlace está en la barra.
    }
  }

  return (
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      className="bg-surface text-fg h-dvh max-h-none w-screen max-w-none border-0 p-0 backdrop:bg-black/85"
    >
      <div className="flex h-full flex-col">
        <header className="border-line-soft flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-3 sm:px-6">
          {pestanas.map((pestana) => {
            const activa = pestana.clave === abierta;

            return (
              <button
                key={pestana.clave}
                type="button"
                onClick={() => onCambiar(pestana.clave)}
                aria-current={activa ? "true" : undefined}
                className={`eyebrow rounded-(--radius-card) border px-3 py-2 text-[0.75rem] transition-colors ${
                  activa
                    ? "border-accent/60 text-accent bg-accent/10"
                    : "border-transparent text-fg-muted hover:text-fg"
                }`}
              >
                {pestana.texto}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={compartir}
              className="eyebrow border-line text-fg-muted hover:text-fg inline-flex items-center gap-2 rounded-(--radius-card) border px-3 py-2 text-[0.75rem] transition-colors"
            >
              <IconoCompartir />
              {copiado ? "Enlace copiado" : "Compartir"}
            </button>

            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="text-fg-muted hover:text-fg grid h-9 w-9 place-items-center rounded-full text-xl transition-colors"
            >
              ×
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto">
          {abierta === "fotos" ? (
            /*
              Mosaico y no una foto cada vez: con doce fotos de un carro, pasar
              de una en una obliga a doce gestos para saber qué hay. En rejilla
              se ve todo de un vistazo y se baja a lo que interese.
            */
            <ul className="grid gap-2 p-2 sm:grid-cols-2 sm:gap-3 sm:p-3">
              {fotos.map((foto) => (
                <li key={foto.id} className="bg-surface-sunken overflow-hidden rounded-(--radius-card)">
                  {foto.src ? (
                    <Image
                      src={foto.src}
                      alt={foto.alt}
                      width={1600}
                      height={1200}
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="h-full w-full object-contain"
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {abierta === "videos" ? (
            <ul className="flex flex-col gap-3 p-2 sm:p-3">
              {videos.map((video) => (
                <li key={video.id}>
                  <video
                    src={video.src}
                    poster={video.poster}
                    controls
                    playsInline
                    preload="none"
                    className="bg-surface-sunken max-h-[80dvh] w-full rounded-(--radius-card)"
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {abierta === "mapa" && hayMapa ? (
            <div className="h-full w-full p-2 sm:p-3">
              <MapaFicha lat={lat!} lng={lng!} etiqueta={etiqueta} className="h-full min-h-80" />
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

function IconoCompartir() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        d="M11 5.5 8 2.5 5 5.5M8 2.5V11M3 9.5v3a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
