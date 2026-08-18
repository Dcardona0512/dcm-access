import type { ReactNode } from "react";

import type { Dictionary } from "@/content/types";
import type { Verification } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

/* --- Etiqueta genérica ------------------------------------------------------ */

type TagProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly tone?: "neutral" | "champagne" | "verified" | "pending" | "muted";
};

const tones = {
  neutral: "border-line text-fg-muted",
  champagne: "border-accent/40 text-accent",
  verified: "border-verified/40 text-verified",
  pending: "border-pending/40 text-pending",
  muted: "border-line-soft text-fg-muted/70",
} as const;

export function Tag({ children, className, tone = "neutral" }: TagProps) {
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center gap-1.5 border px-2.5 py-1.5",
        "rounded-(--radius-card) text-[0.625rem]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* --- Estado de verificación -------------------------------------------------
   §26 y §48: distinguir siempre lo comprobado de lo meramente declarado. */

export function VerificationBadge({
  status,
  dict,
  className,
}: {
  readonly status: Verification;
  readonly dict: Dictionary;
  readonly className?: string;
}) {
  if (status === "verified") {
    return (
      <Tag tone="verified" className={className}>
        <CheckIcon />
        {dict.opportunity.verifiedLabel}
      </Tag>
    );
  }

  if (status === "documents_pending") {
    return (
      <Tag tone="pending" className={className}>
        {dict.opportunity.pendingLabel}
      </Tag>
    );
  }

  return (
    <Tag tone="muted" className={className}>
      {dict.opportunity.unverifiedLabel}
    </Tag>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
      <path d="M2 6.5 4.5 9 10 3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* --- Marca de dato de demostración ------------------------------------------
   Obligatoria en todo registro semilla. §48: nunca presentar contenido de
   demostración como información verdadera. */

export function DemoTag({ className }: { readonly className?: string }) {
  return (
    <span
      className={cn(
        "eyebrow border-accent-dim/50 text-accent-dim inline-flex items-center",
        "rounded-(--radius-card) border border-dashed px-1.5 py-1 text-[0.5625rem]",
        className,
      )}
      title="Contenido de demostración"
    >
      Demo
    </span>
  );
}
