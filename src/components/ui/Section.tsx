import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./Container";

/* --- Eyebrow ---------------------------------------------------------------
   Versalitas muy espaciadas. Es el elemento que más señal de lujo aporta por
   píxel gastado, y el único sitio donde el acento aparece por defecto.

   Los tonos `inverse-*` son para eyebrows que viven sobre la superficie
   invertida, donde el acento y el texto atenuado son los del tema contrario. */

type EyebrowProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly tone?: "accent" | "muted" | "inverse-accent" | "inverse-muted";
};

const eyebrowTones = {
  accent: "text-accent",
  muted: "text-fg-muted",
  "inverse-accent": "text-inverse-accent",
  "inverse-muted": "text-inverse-muted",
} as const;

export function Eyebrow({ children, className, tone = "accent" }: EyebrowProps) {
  return <p className={cn("eyebrow", eyebrowTones[tone], className)}>{children}</p>;
}

/* --- Section ---------------------------------------------------------------- */

type SectionProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly id?: string;
  readonly as?: ElementType;
  /** `inverse` da la vuelta al tema: se usa con cuentagotas, para cortar el ritmo. */
  readonly surface?: "base" | "raised" | "inverse";
  readonly width?: "narrow" | "default" | "wide" | "full";
  readonly bleed?: boolean;
  readonly divider?: boolean;
};

/**
 * `inverse` es la superficie CONTRARIA al tema en curso: marfil sobre el modo
 * oscuro, tinta sobre el claro. Así la sección conserva su intención editorial
 * en ambos modos sin tener que saber en cuál está.
 */
const surfaces = {
  base: "bg-surface text-fg",
  raised: "bg-surface-raised text-fg",
  inverse: "bg-inverse text-inverse-fg",
} as const;

export function Section({
  children,
  className,
  id,
  as: Tag = "section",
  surface = "base",
  width = "default",
  bleed = false,
  divider = false,
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        surfaces[surface],
        "py-(--spacing-section)",
        divider && "border-line border-t",
        className,
      )}
    >
      {bleed ? children : <Container width={width}>{children}</Container>}
    </Tag>
  );
}

/* --- SectionHeading --------------------------------------------------------- */

type SectionHeadingProps = {
  readonly eyebrow?: string;
  readonly heading: ReactNode;
  readonly lede?: string;
  readonly className?: string;
  readonly align?: "start" | "center";
  readonly level?: 1 | 2 | 3;
  readonly size?: "lg" | "md" | "sm";
  readonly onInverse?: boolean;
  readonly action?: ReactNode;
};

const headingSizes = {
  lg: "text-display-2",
  md: "text-display-3",
  sm: "text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.15] tracking-[-0.01em]",
} as const;

export function SectionHeading({
  eyebrow,
  heading,
  lede,
  className,
  align = "start",
  level = 2,
  size = "md",
  onInverse = false,
  action,
}: SectionHeadingProps) {
  const Tag = `h${level}` as ElementType;

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow tone={onInverse ? "inverse-accent" : "accent"}>{eyebrow}</Eyebrow> : null}

      <div
        className={cn(
          "flex w-full flex-col gap-6",
          action && align === "start" && "md:flex-row md:items-end md:justify-between md:gap-12",
        )}
      >
        <Tag
          className={cn(
            "font-display text-balance",
            headingSizes[size],
            align === "center" ? "max-w-[24ch]" : "max-w-[20ch]",
          )}
        >
          {heading}
        </Tag>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {lede ? (
        <p
          className={cn(
            "text-lede text-pretty",
            onInverse ? "text-inverse-muted" : "text-fg-muted",
            align === "center" ? "max-w-[62ch]" : "max-w-[58ch]",
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}
