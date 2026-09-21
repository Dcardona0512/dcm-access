import Image from "next/image";

import { Monograma } from "@/components/brand/Monograma";
import type { MediaItem, MediaTone } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

/* ============================================================================
   IMAGEN EDITORIAL
   ----------------------------------------------------------------------------
   §36 pide fotografía editorial premium y prohíbe el stock genérico. Todavía
   no hay biblioteca fotográfica, y inventar imágenes de activos que no existen
   sería exactamente lo que §48 prohíbe.

   Así que este componente hace dos cosas: si `media.src` apunta a un archivo
   real bajo `/public/media`, lo sirve optimizado con `next/image`; si no,
   dibuja una placa editorial sobria — nunca un cuadro roto ni un "no image".

   Para incorporar fotografía real basta con dejar los archivos en
   `public/media/` y rellenar `src` en los datos. Nada más cambia.
   ========================================================================== */

type EditorialImageProps = {
  readonly media?: MediaItem;
  readonly className?: string;
  readonly sizes?: string;
  readonly priority?: boolean;
  /** Proporción del marco. Las cards usan 4/3; los héroes, 16/9 o 21/9. */
  readonly ratio?: "square" | "4/3" | "3/2" | "16/9" | "21/9" | "fill";
};

const ratios = {
  square: "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
  fill: "h-full w-full",
} as const;

/** Inclinación del degradado por familia temática: da variedad sin ruido. */
const toneAngles: Record<MediaTone, string> = {
  architecture: "135deg",
  motors: "115deg",
  aviation: "155deg",
  services: "100deg",
  business: "125deg",
};

export function EditorialImage({
  media,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  priority = false,
  ratio = "4/3",
}: EditorialImageProps) {
  const angle = toneAngles[media?.tone ?? "architecture"];

  /**
   * Un vídeo no se sirve por `next/image`: su `src` es un `.mp4` y el
   * optimizador no sabe qué hacer con él. Lo que sí es una imagen es su
   * fotograma de portada, así que un vídeo se representa por su póster y, si
   * no lo tiene, por la placa editorial. Reproducirlo es cosa de la galería.
   */
  const imageSrc = media?.kind === "video" ? media.poster : media?.src;

  return (
    <div
      className={cn(
        "bg-surface-sunken relative isolate overflow-hidden",
        "rounded-(--radius-card)",
        ratios[ratio],
        className,
      )}
    >
      {imageSrc && media ? (
        <Image
          src={imageSrc}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <Placeholder angle={angle} />
      )}
    </div>
  );
}

function Placeholder({ angle }: { readonly angle: string }) {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      {/* Plano base: degradado en grafito, nunca plano. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${angle}, var(--c-plate-from) 0%, var(--c-plate-mid) 45%, var(--c-plate-to) 100%)`,
        }}
      />

      {/* Trama de filetes finísimos: da textura sin llamar la atención. */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgb(var(--c-plate-grain)) 0px, rgb(var(--c-plate-grain)) 1px, transparent 1px, transparent 7px)",
        }}
      />

      {/* Filigrana de la marca, apenas insinuada. */}
      <div className="absolute inset-0 grid place-items-center">
        {/*
          Medida fija y no una fracción de la placa: el monograma es texto, así
          que su tamaño sale del cuerpo y no de la altura del contenedor. La
          horquilla cubre desde la tarjeta pequeña hasta el héroe sin que en
          ninguno de los dos se lea como un sello pegado encima.
        */}
        <Monograma
          className="text-fg text-[clamp(1.5rem,5vw,2.75rem)]"
          style={{ opacity: "var(--c-plate-mark)" }}
        />
      </div>

      {/* Viñeteado: hunde las esquinas y centra la mirada. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 40%, rgb(var(--c-plate-vignette)) 100%)",
        }}
      />

      {/* Luz rasante en el borde superior, como en las cards. */}
      <div className="edge-light absolute inset-0" />
    </div>
  );
}
