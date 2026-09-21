"use client";

import { useFormStatus } from "react-dom";

import { Logo } from "@/components/brand/Logo";
import type { Dictionary } from "@/content/types";
import type { FormState } from "@/lib/forms/state";
import { cn } from "@/lib/utils";

/** Botón de envío que refleja el estado pendiente de la acción. */
export function SubmitButton({
  label,
  pendingLabel,
  variant = "accent",
  fullWidth = false,
}: {
  readonly label: string;
  readonly pendingLabel: string;
  readonly variant?: "accent" | "solid";
  readonly fullWidth?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "eyebrow group inline-flex h-12 items-center justify-center gap-2.5 px-8",
        "rounded-(--radius-card) transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "accent"
          ? "border-accent/60 text-accent hover:bg-accent hover:text-surface border"
          : "bg-fg text-surface hover:opacity-90",
        fullWidth && "w-full",
      )}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/** Banda de error global. Los errores por campo se pintan junto al campo. */
export function FormError({ state }: { readonly state: FormState }) {
  if (state.status !== "error" || !state.message) return null;

  return (
    <div
      role="alert"
      className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm"
    >
      {state.message}
    </div>
  );
}

/**
 * Confirmación. Muestra la referencia interna del lead: convierte un "gracias"
 * genérico en la prueba de que la solicitud entró en un sistema.
 */
export function FormSuccess({
  heading,
  body,
  reference,
  dict,
  className,
}: {
  readonly heading: string;
  readonly body: string;
  readonly reference?: string;
  readonly dict: Dictionary;
  readonly className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "border-accent/30 bg-accent/[0.04] flex flex-col items-center gap-5 px-6 py-14 text-center",
        "rounded-(--radius-card) border",
        className,
      )}
    >
      {/*
        El logotipo entero y no el monograma: esto es una confirmación, no un
        hueco de 16 píxeles. Quien acaba de dejar sus datos tiene que ver la
        marca completa —con ACCESS— y no unas iniciales sueltas.
      */}
      <Logo variant="stacked" className="text-accent text-[1.15rem]" />
      <h3 className="font-display text-2xl text-balance">{heading}</h3>
      <p className="text-fg-muted max-w-[52ch] text-pretty">{body}</p>
      {reference ? (
        <p className="eyebrow text-accent text-[0.8rem]" data-numeric>
          {dict.opportunity.reference} · {reference}
        </p>
      ) : null}
    </div>
  );
}
