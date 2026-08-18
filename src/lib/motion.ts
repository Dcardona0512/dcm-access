import type { Transition, Variants } from "motion/react";

/**
 * Movimiento de marca (§31): "no exagerar las animaciones. Una marca premium
 * transmite seguridad y calma."
 *
 * De ahí las reglas: nada rebota, nada gira, nada escala más de un 2 %, y el
 * desplazamiento máximo son 12 px. Todo comparte la misma curva para que el
 * sitio se sienta de una pieza.
 */

export const easeBrand = [0.22, 1, 0.36, 1] as const;

export const transition = {
  fast: { duration: 0.18, ease: easeBrand },
  base: { duration: 0.32, ease: easeBrand },
  slow: { duration: 0.48, ease: easeBrand },
} satisfies Record<string, Transition>;

/** Aparición estándar: opacidad más 12 px de subida. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transition.slow },
};

/** Contenedor que escalona la aparición de sus hijos. */
export function staggerVariants(stagger = 0.06, delay = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
}

/** Velo que se desvanece, para overlays y drawers. */
export const veilVariants: Variants = {
  hidden: { opacity: 0, transition: transition.fast },
  visible: { opacity: 1, transition: transition.base },
};

/** Panel lateral del menú móvil. */
export const panelVariants: Variants = {
  hidden: { opacity: 0, x: 24, transition: transition.fast },
  visible: { opacity: 1, x: 0, transition: transition.base },
};

/** Umbral compartido para `whileInView`: entra cuando ya se ve de verdad. */
export const viewport = { once: true, amount: 0.25 } as const;
