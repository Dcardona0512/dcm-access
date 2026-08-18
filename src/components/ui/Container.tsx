import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Contenedor de ancho máximo. `wide` para rejillas editoriales, `narrow` para
 * prosa: una columna de texto por encima de ~72 caracteres deja de leerse.
 */
type ContainerProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly width?: "narrow" | "default" | "wide" | "full";
  readonly as?: ElementType;
};

const widths = {
  narrow: "max-w-[46rem]",
  default: "max-w-[78rem]",
  wide: "max-w-[92rem]",
  full: "max-w-none",
} as const;

export function Container({
  children,
  className,
  width = "default",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full px-(--spacing-gutter)", widths[width], className)}>
      {children}
    </Tag>
  );
}
