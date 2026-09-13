"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { AccessMark } from "@/components/brand/AccessMark";
import { requestMagicLink, type LoginState } from "./actions";

const initial: LoginState = { status: "idle" };

export function LoginForm({ notice }: { readonly notice?: string }) {
  const [state, action] = useActionState(requestMagicLink, initial);

  if (state.status === "sent") {
    return (
      <div
        role="status"
        className="border-accent/30 bg-accent/[0.04] flex flex-col items-center gap-4 rounded-(--radius-card) border px-6 py-12 text-center"
      >
        <AccessMark className="text-accent h-8 w-8" weight={7} />
        <h2 className="font-display text-xl">Revise su correo</h2>
        <p className="text-fg-muted max-w-[40ch] text-sm text-pretty">
          Si la dirección tiene acceso, le acabamos de enviar un enlace para entrar. Caduca en una
          hora.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {notice ? (
        <p
          role="alert"
          className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm"
        >
          {notice}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="admin-email" className="eyebrow text-fg-muted text-[0.5625rem]">
          Correo electrónico
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          placeholder="usted@ejemplo.com"
          className="border-line text-fg placeholder:text-fg-muted/40 focus-visible:border-accent h-12 w-full rounded-(--radius-card) border bg-transparent px-4 outline-none transition-colors"
        />
      </div>

      <Submit />

      <p className="text-fg-muted/60 text-xs text-pretty">
        No hay contraseña. Le enviamos un enlace de un solo uso al correo.
      </p>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="eyebrow bg-fg text-surface h-12 rounded-(--radius-card) transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "Enviando…" : "Enviar enlace de acceso"}
    </button>
  );
}
