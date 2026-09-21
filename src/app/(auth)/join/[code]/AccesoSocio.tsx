"use client";

import { useFormStatus } from "react-dom";

import type { Dictionary } from "@/content/types";

import { signInWithGoogle } from "../../actions";

/**
 * Entrar como socio invitado.
 *
 * Solo Google, y es deliberado: el enlace vive quince minutos y el correo con
 * enlace mágico añade un viaje más —esperar un segundo correo, abrirlo, volver—
 * que se come el plazo. Con Google son dos toques y está dentro.
 *
 * El código viaja en `next`, así que al volver de Google la propia página de
 * invitación lo canjea.
 */
export function AccesoSocio({
  dict,
  codigo,
  conGoogle,
}: {
  readonly dict: Dictionary;
  readonly codigo: string;
  readonly conGoogle: boolean;
}) {
  return (
    <div className="flex flex-col gap-8 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl">Le han invitado</h1>
        <p className="text-fg-muted text-sm text-pretty">
          Entre con su correo de Google y podrá publicar sus fichas en DCM ACCESS.
        </p>
      </div>

      {conGoogle ? (
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={`/join/${codigo}`} />
          <BotonGoogle texto={dict.auth.continueGoogle} />
        </form>
      ) : (
        <p className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm text-pretty">
          El acceso con Google no está disponible en este momento. Avísenos y le damos otra vía.
        </p>
      )}

      <p className="text-fg-muted/60 text-xs text-pretty">
        Su invitación caduca en quince minutos desde que se generó.
      </p>
    </div>
  );
}

function BotonGoogle({ texto }: { readonly texto: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="eyebrow bg-accent text-surface border-accent inline-flex h-12 w-full items-center justify-center gap-3 rounded-(--radius-card) border text-[0.75rem] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
    >
      <svg viewBox="0 0 18 18" aria-hidden="true" className="h-4 w-4">
        <path fill="#fff" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
        <path fill="#fff" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
        <path fill="#fff" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
        <path fill="#fff" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
      </svg>
      {texto}
    </button>
  );
}
