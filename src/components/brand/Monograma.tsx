import type { CSSProperties } from "react";

import { brand } from "@/content/shared";
import { cn } from "@/lib/utils";

/* ============================================================================
   EL MONOGRAMA — D | C | M
   ----------------------------------------------------------------------------
   La marca reducida a lo que sobrevive cuando no hay sitio: las tres iniciales
   con sus filetes. Es la pieza del favicon, de la marca de agua de las fichas
   sin fotografía, de los estados vacíos y de la confirmación de un formulario.

   No es el logotipo encogido. El logotipo completo lleva el filete dorado y
   ACCESS, y a los tamaños en que se usa esto —de 16 a 40 px— esa segunda mitad
   se convierte en una mancha ilegible que además desequilibra la pieza. Lo que
   se conserva es lo que identifica; lo que se sacrifica es lo que a ese tamaño
   nadie iba a leer.

   Hereda el color con `currentColor`, así que la versión dorada, la crema y la
   de marca de agua al 6 % son la misma pieza con distinto color de texto.
   ========================================================================== */

export function Monograma({
  className,
  title,
  style,
}: {
  readonly className?: string;
  /** Solo cuando la pieza va sola y nadie más nombra la marca. */
  readonly title?: string;
  /** Para opacidades que dependen del tema y no caben en una clase. */
  readonly style?: CSSProperties;
}) {
  return (
    <span
      className={cn(
        "font-(family-name:--font-logo) inline-flex items-stretch leading-none",
        className,
      )}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {[...brand.initials].map((letra, indice) => (
        <span key={letra} className="inline-flex items-stretch">
          {indice > 0 ? <Filete /> : null}
          {letra}
        </span>
      ))}
    </span>
  );
}

/**
 * El filete entre iniciales.
 *
 * Es un elemento de un píxel, NO el glifo `|`. La barra vertical cambia de
 * altura, de grosor y de posición en cada tipografía, así que con la fuente de
 * respaldo —mientras llega la del logo, o si no llegara— el lockup se vería
 * con las barras descolocadas. Un filete dibujado mide siempre lo mismo.
 *
 * `items-stretch` en el padre le da la altura de la caja de texto, que es algo
 * más que la altura de las mayúsculas: es exactamente el aire que tiene en el
 * original.
 */
export function Filete({ className }: { readonly className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("mx-[0.3em] w-px shrink-0 self-stretch bg-current opacity-30", className)}
    />
  );
}
