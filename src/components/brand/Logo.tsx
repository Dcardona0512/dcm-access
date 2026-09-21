import { brand } from "@/content/shared";
import { cn } from "@/lib/utils";

import { Filete, Monograma } from "./Monograma";

/* ============================================================================
   LOCKUP DE MARCA — D | C | M  ▏ ACCESS
   ----------------------------------------------------------------------------
   Se compone con TEXTO REAL, no con trazados: se selecciona, lo lee un lector
   de pantalla, se ajusta al ancho disponible y pesa 9 KB en lugar de los
   cuarenta o cincuenta que costaría el mismo dibujo en curvas.

   EL DORADO ES PARTE DE LA MARCA, y conviene dejarlo escrito porque la versión
   anterior de este archivo decía justo lo contrario. El lockup antiguo era
   monocromo a propósito: la regla de marca reserva el dorado para el eyebrow,
   el filete y el único CTA de la vista (§8), y un logo dorado gastaba el
   acento en el elemento que menos lo necesita. El logotipo nuevo trae el
   filete y ACCESS en dorado de origen, así que esa regla gana una excepción
   —la marca— y sigue rigiendo para todo lo demás. No es un descuido: es el
   logotipo.

   Las proporciones salen del original: ACCESS al 45 % del cuerpo de las
   iniciales, con tracking amplio, y el filete dorado respirando medio cuadratín
   a cada lado. Van en `em` y no en píxeles, de modo que el lockup entero se
   escala cambiando una sola medida.
   ========================================================================== */

type LogoProps = {
  readonly variant?: "full" | "mark" | "stacked";
  readonly className?: string;
  /**
   * Lema traducido, bajo el lockup. Se pasa desde fuera porque el logo no debe
   * conocer el idioma: lo usan el pie, la entrada y el acceso al panel.
   */
  readonly descriptor?: string;
};

export function Logo({ variant = "full", className, descriptor }: LogoProps) {
  if (variant === "mark") {
    return <Monograma className={cn("text-xl", className)} title={brand.name} />;
  }

  if (variant === "stacked") {
    return (
      <span
        className={cn("flex flex-col items-center gap-3 text-[1.75rem] text-current", className)}
      >
        <Wordmark />
        {descriptor ? <Descriptor text={descriptor} /> : null}
        <span className="sr-only">{brand.name}</span>
      </span>
    );
  }

  return (
    /*
      EL CUERPO VA EN EL ENVOLTORIO, no dentro del lockup. Así una llamada
      puede cambiarlo con una clase —la confirmación del formulario lo necesita
      más pequeño para caber en la columna— y todo lo demás, incluido el lema,
      escala con él porque está medido en `em`.
    */
    <span className={cn("flex flex-col gap-1.5 text-[1.35rem] text-current", className)}>
      <Wordmark />
      {descriptor ? <Descriptor text={descriptor} /> : null}
      <span className="sr-only">{brand.name}</span>
    </span>
  );
}

/**
 * El lockup.
 *
 * `items-stretch` reparte a los filetes la altura de la caja de texto, que con
 * `leading-none` es el cuerpo exacto: quedan un poco más altos que las
 * mayúsculas, como en el original. ACCESS se centra ópticamente con `self-center`
 * en lugar de apoyarse en la línea base — a la mitad de cuerpo, alineado abajo
 * se hundiría.
 */
function Wordmark({ className }: { readonly className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "font-(family-name:--font-logo) flex items-stretch leading-none",
        "whitespace-nowrap uppercase",
        className,
      )}
    >
      {[...brand.initials].map((letra, indice) => (
        <span key={letra} className="flex items-stretch">
          {indice > 0 ? <Filete /> : null}
          {letra}
        </span>
      ))}

      {/*
        El filete dorado es el que articula el nombre, y por eso es distinto de
        los otros dos: va en el acento, a plena opacidad y con el doble de aire
        a cada lado. Separa las iniciales del sustantivo en vez de separar una
        letra de otra.
      */}
      <Filete className="bg-accent mx-[0.55em] opacity-100" />

      <span className="text-accent self-center text-[0.45em] tracking-[0.34em]">Access</span>
    </span>
  );
}

function Descriptor({ text }: { readonly text: string }) {
  return (
    /*
      En mayúsculas por CSS y no en el diccionario: escrito en mayúsculas de
      verdad, un lector de pantalla puede deletrearlo letra a letra.
    */
    <span
      aria-hidden="true"
      className="font-(family-name:--font-logo) text-fg-muted text-[0.44em] tracking-[0.3em] uppercase"
    >
      {text}
    </span>
  );
}
