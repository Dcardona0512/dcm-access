import { brand } from "@/content/shared";
import { cn } from "@/lib/utils";

import { AccessMark } from "./AccessMark";

/* ============================================================================
   LOCKUP DE MARCA
   ----------------------------------------------------------------------------
   El wordmark se compone con texto real, no con trazados: se selecciona, se
   lee con lector de pantalla y se ajusta al ancho disponible sin escalar mal.

   Deliberadamente monocromo. El dorado está reservado para el eyebrow, el
   filete y el único CTA de la vista (§8); un logo dorado permanente en la
   cabecera gastaría el acento en el elemento que menos lo necesita.
   ========================================================================== */

type LogoProps = {
  readonly variant?: "full" | "mark" | "stacked";
  readonly className?: string;
  /**
   * Descriptor traducido a mostrar bajo el nombre. Se pasa desde fuera porque
   * el logo no debe conocer el idioma: solo el footer y las portadas lo usan.
   */
  readonly descriptor?: string;
};

export function Logo({ variant = "full", className, descriptor }: LogoProps) {
  if (variant === "mark") {
    return <AccessMark className={cn("h-7 w-7", className)} title={brand.name} />;
  }

  if (variant === "stacked") {
    return (
      <span className={cn("flex flex-col items-center gap-4 text-current", className)}>
        <AccessMark className="h-12 w-12" />
        <span className="flex flex-col items-center gap-2">
          <Wordmark />
          {descriptor ? <Descriptor text={descriptor} /> : null}
        </span>
        <span className="sr-only">{brand.name}</span>
      </span>
    );
  }

  return (
    <span className={cn("flex items-center gap-3 text-current", className)}>
      <AccessMark className="h-7 w-7 shrink-0" />
      <span className="flex flex-col gap-1">
        <Wordmark />
        {descriptor ? <Descriptor text={descriptor} /> : null}
      </span>
      <span className="sr-only">{brand.name}</span>
    </span>
  );
}

/**
 * El lockup: DCM ✕ ACCESS.
 *
 * La X sustituye al filete vertical que había antes, y de ahí sale también el
 * correo oficial (`dcmxaccess@`). Tres decisiones la sostienen:
 *
 * 1. NO ES UNA SEXTA LETRA. A tamaño completo se leería "DCMXACCESS". Va al
 *    76 % del cuerpo y a media opacidad, así que el ojo la lee como lo que es:
 *    la articulación entre las dos mitades del nombre.
 *
 * 2. RESPIRA MÁS QUE EL FILETE. Un glifo necesita más aire que una línea de un
 *    píxel, de ahí que el margen suba de 0,35 a 0,44 em. Sin eso la X se pega
 *    a la M y a la A y el conjunto se apelmaza.
 *
 * 3. SE ASIENTA ÓPTICAMENTE. Las mayúsculas de este cuerpo tienen la X algo
 *    alta respecto a su centro visual; el desplazamiento la baja hasta que
 *    descansa en el eje de las otras letras. Es la diferencia entre parecer
 *    puesta a mano y parecer dibujada con el logotipo.
 *
 * Sigue siendo `aria-hidden`: el nombre accesible lo da el `sr-only` de
 * `Logo`, y ahí se pronuncia "DCM ACCESS" sin deletrear el separador.
 */
function Wordmark() {
  return (
    <span
      aria-hidden="true"
      className="text-[0.9375rem] leading-none font-medium tracking-[0.22em] whitespace-nowrap uppercase"
    >
      {brand.initials}
      <span className="mx-[0.44em] inline-block translate-y-[0.045em] align-baseline text-[0.76em] font-normal tracking-normal opacity-55">
        X
      </span>
      Access
    </span>
  );
}

function Descriptor({ text }: { readonly text: string }) {
  return (
    <span aria-hidden="true" className="eyebrow text-fg-muted text-[0.5rem] tracking-[0.2em]">
      {text}
    </span>
  );
}
