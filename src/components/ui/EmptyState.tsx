import type { ReactNode } from "react";

import { AccessMark } from "@/components/brand/AccessMark";
import { cn } from "@/lib/utils";

/**
 * Un catálogo vacío es una oportunidad comercial, no un error (§42): si no hay
 * resultados publicados, el siguiente paso natural es la búsqueda privada.
 */
export function EmptyState({
  heading,
  body,
  action,
  className,
}: {
  readonly heading: string;
  readonly body?: string;
  readonly action?: ReactNode;
  readonly className?: string;
}) {
  return (
    <div
      className={cn(
        "border-line flex flex-col items-center gap-6 border border-dashed px-6 py-20 text-center",
        "rounded-(--radius-card)",
        className,
      )}
    >
      <AccessMark className="text-fg-muted h-8 w-8 opacity-30" weight={7} />
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-2xl text-balance">{heading}</h3>
        {body ? <p className="text-fg-muted max-w-[48ch] text-pretty">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Filete horizontal que se desvanece hacia los extremos. */
export function Hairline({ className }: { readonly className?: string }) {
  return <hr className={cn("hairline-fade border-0", className)} />;
}
