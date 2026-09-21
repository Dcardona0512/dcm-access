"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createPartnerProfile } from "../actions";
import { initialPartnerState } from "../state";

/* ============================================================================
   ALTA DE PARTNER
   ----------------------------------------------------------------------------
   Seis campos y ni uno más. Lo que hace falta para que alguien pueda decidir
   si esta empresa es quien dice ser; los documentos y el detalle llegan cuando
   la revisión los pida, no antes de saber si hay revisión.
   ========================================================================== */

export function PartnerOnboarding({ nombre }: { readonly nombre: string }) {
  const [state, action] = useActionState(createPartnerProfile, initialPartnerState);

  const campo =
    "border-line text-fg placeholder:text-fg-muted/40 hover:border-fg-muted/40 focus-visible:border-accent w-full rounded-(--radius-card) border bg-transparent px-4 py-3 outline-none transition-colors";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Su ficha de partner</h1>
        <p className="text-fg-muted max-w-[60ch] text-pretty">
          {nombre}, cuéntenos a qué se dedica. Revisamos cada ficha a mano antes de habilitar
          publicaciones: es lo que hace que un cliente se fíe de lo que ve aquí.
        </p>
      </header>

      <form action={action} className="flex max-w-xl flex-col gap-5">
        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm"
          >
            {state.message}
          </p>
        ) : null}

        <Campo etiqueta="Nombre de la empresa">
          <input name="companyName" required maxLength={160} className={campo} />
        </Campo>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo etiqueta="Sitio web" opcional>
            <input name="website" placeholder="https://" maxLength={200} className={campo} />
          </Campo>
          <Campo etiqueta="A qué se dedica" opcional>
            <input
              name="category"
              placeholder="Inmobiliaria, vehículos, aviación…"
              maxLength={120}
              className={campo}
            />
          </Campo>
        </div>

        <div className="grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]">
          <Campo etiqueta="País" opcional>
            <input
              name="country"
              placeholder="CO"
              maxLength={2}
              className={`${campo} uppercase`}
            />
          </Campo>
          <Campo etiqueta="Ciudad" opcional>
            <input name="city" maxLength={120} className={campo} />
          </Campo>
        </div>

        <Campo etiqueta="Descripción">
          <textarea name="description" required rows={5} maxLength={2000} className={campo} />
        </Campo>

        <Enviar />
      </form>
    </div>
  );
}

function Campo({
  etiqueta,
  opcional,
  children,
}: {
  readonly etiqueta: string;
  readonly opcional?: boolean;
  readonly children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-fg-muted text-[0.8rem]">
        {etiqueta}
        {opcional ? <span className="text-fg-muted/50 normal-case"> · opcional</span> : null}
      </span>
      {children}
    </label>
  );
}

function Enviar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="eyebrow bg-accent text-surface border-accent inline-flex h-12 items-center justify-center rounded-(--radius-card) border px-6 text-[0.75rem] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "Enviando…" : "Enviar para revisión"}
    </button>
  );
}
