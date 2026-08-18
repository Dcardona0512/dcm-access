import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ============================================================================
   BOTÓN
   ----------------------------------------------------------------------------
   Cuatro variantes, y una regla de uso que importa más que el CSS:

     · `solid`   — acción principal. Marfil sobre tinta.
     · `accent`  — el ÚNICO botón dorado permitido por vista (§8, §42).
     · `outline` — acciones secundarias.
     · `quiet`   — enlaces con peso de botón, sin caja.

   Si una pantalla necesita dos `accent`, la jerarquía está mal planteada.
   ========================================================================== */

type Variant = "solid" | "accent" | "outline" | "quiet";
type Size = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2.5 eyebrow whitespace-nowrap " +
  "rounded-(--radius-card) transition-colors duration-(--duration-base) ease-(--ease-brand) " +
  "disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  solid: "bg-fg text-surface hover:opacity-90",
  accent:
    "border border-accent/60 text-accent hover:border-accent hover:bg-accent hover:text-surface",
  outline: "border border-line text-fg hover:border-fg-muted/70 hover:bg-surface-sunken",
  quiet: "text-fg-muted hover:text-fg px-0",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.625rem]",
  md: "h-11 px-6",
  lg: "h-13 px-8 text-[0.75rem]",
};

/** Variantes equivalentes cuando el botón vive sobre la superficie invertida. */
const onInverseVariants: Partial<Record<Variant, string>> = {
  solid: "bg-inverse-fg text-inverse hover:opacity-90",
  accent:
    "border border-inverse-accent/50 text-inverse-accent hover:bg-inverse-accent hover:text-inverse",
  outline:
    "border border-inverse-line text-inverse-fg hover:border-inverse-muted hover:bg-inverse-hover",
  quiet: "text-inverse-muted hover:text-inverse-fg px-0",
};

type CommonProps = {
  readonly children: ReactNode;
  readonly variant?: Variant;
  readonly size?: Size;
  readonly className?: string;
  readonly onInverse?: boolean;
  readonly fullWidth?: boolean;
};

type ButtonAsLink = CommonProps & {
  readonly href: string;
  readonly prefetch?: boolean;
  readonly target?: string;
  readonly rel?: string;
  /** Para cerrar menús o cajones al navegar. */
  readonly onClick?: () => void;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

type StyleProps = Omit<CommonProps, "children">;

function classes({
  variant = "solid",
  size = "md",
  onInverse = false,
  fullWidth = false,
  className,
}: StyleProps) {
  const palette = onInverse
    ? (onInverseVariants[variant] ?? variants[variant])
    : variants[variant];
  return cn(base, palette, sizes[size], fullWidth && "w-full", className);
}

export function Button(props: ButtonAsLink | ButtonAsButton) {
  if ("href" in props) {
    const { children, href, prefetch, target, rel, onClick, ...rest } = props;
    return (
      <Link
        href={href}
        prefetch={prefetch}
        target={target}
        onClick={onClick}
        rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
        className={classes(rest)}
      >
        {children}
      </Link>
    );
  }

  const { children, variant, size, className, onInverse, fullWidth, ...rest } = props;
  return (
    <button {...rest} className={classes({ variant, size, className, onInverse, fullWidth })}>
      {children}
    </button>
  );
}

/** Flecha que acompaña a los CTA y se desplaza levemente al pasar el cursor. */
export function ArrowEast({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn(
        "h-3 w-3 transition-transform duration-(--duration-base) ease-(--ease-brand) group-hover:translate-x-1",
        className,
      )}
    >
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
