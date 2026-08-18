import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/* ============================================================================
   EL SÍMBOLO (§10)
   ----------------------------------------------------------------------------
   Dos hojas enfrentadas con un eje vertical de luz entre ellas, y en ese eje,
   el signo de dólar.

   Se lee de tres maneras a la vez:
     · una puerta entreabierta — acceso, portal
     · dos flechas enfrentadas — conexión, dirección
     · lo que hay en el vano — el negocio que se abre

   NOTA DE CRITERIO: el §10 del encargo pedía marca sin símbolos de dinero. El
   fundador pidió expresamente lo contrario, y esta es la versión que quiere.
   Queda anotado por si alguien vuelve al documento y ve la discrepancia.

   El vano se ensanchó de 10 a 32 unidades para que quepa. No es una cifra de
   ojo: se rasterizaron cinco combinaciones de vano, ancho de S y grosor a los
   tamaños en que la marca se usa DE VERDAD —20, 28, 48 y 88 px— contando en
   cada una cuántas filas del signo conservan sus contadores abiertos. Con el
   vano original el dólar quedaba macizo a 28 px, que es justo el tamaño de la
   cabecera, el sitio donde más se ve.

   El trazo del dólar es más fino que el de las hojas: contrapunto deliberado
   —las hojas son la arquitectura, el dólar es el contenido— y además es lo que
   mantiene los contadores abiertos al reducir.

   A 16 px ni esto alcanza, así que el favicon (`src/app/icon.svg`) NO es esta
   pieza reducida sino una variante con la jerarquía invertida. Está explicado
   en ese archivo.

   Usa `currentColor`, así que las versiones clara, oscura y monocromática son
   la misma pieza con distinto color de texto heredado.
   ========================================================================== */

/**
 * Grosor del dólar respecto al de las hojas. Subirlo cierra los contadores del
 * signo antes de lo que parece: a 0,62 ya se empasta a 28 px.
 */
const DOLLAR_WEIGHT = 0.575;

type AccessMarkProps = {
  readonly className?: string;
  /**
   * Grosor del trazo en unidades del viewBox (100×100).
   * Se engorda en tamaños pequeños para que el favicon no se deshaga.
   */
  readonly weight?: number;
  readonly title?: string;
  /** Para opacidades que dependen del tema y no caben en una clase. */
  readonly style?: CSSProperties;
};

export function AccessMark({ className, weight = 8, title, style }: AccessMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      style={style}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {/* Hoja izquierda */}
      <path
        d="M34 8 L7 50 L34 92"
        stroke="currentColor"
        strokeWidth={weight}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Hoja derecha */}
      <path
        d="M66 8 L93 50 L66 92"
        stroke="currentColor"
        strokeWidth={weight}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      {/*
        El dólar, en el eje de luz. El asta va primero para que la S la cruce
        por encima: al revés, en tamaños pequeños el asta parte la curva en dos
        trozos que no se leen como una S.

        Extremos redondeados, no cuadrados como las hojas: una curva rematada
        en escuadra se ve rota. La diferencia es intencionada y sostiene la
        jerarquía — las hojas son la arquitectura, el dólar es el contenido.
      */}
      <path
        d="M50 24 L50 76"
        stroke="currentColor"
        strokeWidth={weight * DOLLAR_WEIGHT}
        strokeLinecap="round"
      />
      <path
        d="M62 39
           C62 34 56.6 31 50 31
           C43.4 31 38 34 38 39
           C38 44.2 43.4 46.6 50 48.9
           C56.6 51.2 62 54 62 59.4
           C62 65 56.6 68.4 50 68.4
           C43.4 68.4 38 65 38 59.4"
        stroke="currentColor"
        strokeWidth={weight * DOLLAR_WEIGHT}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
