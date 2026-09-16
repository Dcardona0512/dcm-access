"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { EditorialImage } from "@/components/ui/EditorialImage";
import type { MediaItem } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

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
}: {
  readonly media: readonly MediaItem[];
  /** Nombre accesible del grupo de radios. */
  readonly label: string;
  readonly className?: string;
}) {
  const items = media.slice(0, PEERS.length);

  /** Índice abierto a pantalla completa, o `null` si la lupa está cerrada. */
  const [ampliada, setAmpliada] = useState<number | null>(null);

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
              onClick={() => setAmpliada(index)}
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

      <Lupa items={items} indice={ampliada} onCerrar={() => setAmpliada(null)} onIr={setAmpliada} />
    </fieldset>
  );
}

/* ============================================================================
   LUPA
   ----------------------------------------------------------------------------
   La foto a pantalla completa, que es donde se ve el detalle: un rayón en la
   puerta o el estado de una llanta no se aprecian en un recuadro de 700px.

   `<dialog>` con `showModal()`, no un div flotante: la tecla Escape, el foco
   atrapado dentro y el resto de la página inerte para los lectores de pantalla
   vienen dados. Lo que sí hay que añadir son las flechas, para recorrer el
   carrete sin cerrar y volver a abrir.

   La imagen va con `object-contain` y sin recorte: a diferencia de la escena
   —que reencuadra a 16/9 para que la ficha tenga un ritmo— aquí manda la foto,
   sea vertical, cuadrada o apaisada.
   ========================================================================== */

function Lupa({
  items,
  indice,
  onCerrar,
  onIr,
}: {
  readonly items: readonly MediaItem[];
  readonly indice: number | null;
  readonly onCerrar: () => void;
  readonly onIr: (indice: number) => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const abierta = indice !== null;

  // `showModal()` no es un atributo: hay que llamarlo. El efecto sincroniza el
  // estado de React con el del elemento en los dos sentidos, incluido el cierre
  // por Escape, que ocurre sin pasar por aquí.
  useEffect(() => {
    const dialog = dialogo.current;
    if (!dialog) return;

    if (abierta && !dialog.open) dialog.showModal();
    if (!abierta && dialog.open) dialog.close();
  }, [abierta]);

  useEffect(() => {
    if (!abierta) return;

    function alPulsar(event: KeyboardEvent) {
      if (event.key === "ArrowRight") onIr(((indice ?? 0) + 1) % items.length);
      if (event.key === "ArrowLeft") onIr(((indice ?? 0) - 1 + items.length) % items.length);
    }

    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierta, indice, items.length, onIr]);

  const item = indice === null ? null : items[indice];

  return (
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      // Pulsar el fondo cierra. El diálogo modal ocupa la pantalla entera, así
      // que un clic fuera de la imagen llega aquí con `target` siendo él mismo.
      onClick={(event) => {
        if (event.target === dialogo.current) onCerrar();
      }}
      className="bg-surface/95 text-fg h-dvh max-h-none w-screen max-w-none border-0 p-0 backdrop:bg-black/80"
    >
      {item ? (
        <div className="relative grid h-full w-full place-items-center p-4 sm:p-10">
          {item.src ? (
            <Image
              src={item.src}
              alt={item.alt}
              width={2400}
              height={1600}
              sizes="100vw"
              className="max-h-[88dvh] w-auto max-w-full object-contain"
            />
          ) : null}

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="bg-surface/80 text-fg-muted hover:text-fg absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full text-xl backdrop-blur-sm transition-colors"
          >
            ×
          </button>

          {items.length > 1 ? (
            <>
              <Flecha
                hacia="anterior"
                onClick={() => onIr((indice! - 1 + items.length) % items.length)}
              />
              <Flecha hacia="siguiente" onClick={() => onIr((indice! + 1) % items.length)} />

              <span
                className="eyebrow bg-surface/80 text-fg-muted absolute bottom-4 left-1/2 -translate-x-1/2 rounded-(--radius-pill) px-3 py-1.5 text-[0.75rem] backdrop-blur-sm"
                data-numeric
              >
                {indice! + 1} / {items.length}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}

function Flecha({
  hacia,
  onClick,
}: {
  readonly hacia: "anterior" | "siguiente";
  readonly onClick: () => void;
}) {
  const anterior = hacia === "anterior";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={anterior ? "Foto anterior" : "Foto siguiente"}
      className={cn(
        "bg-surface/80 text-fg-muted hover:text-fg absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-2xl backdrop-blur-sm transition-colors",
        anterior ? "left-3 sm:left-6" : "right-3 sm:right-6",
      )}
    >
      {anterior ? "‹" : "›"}
    </button>
  );
}
