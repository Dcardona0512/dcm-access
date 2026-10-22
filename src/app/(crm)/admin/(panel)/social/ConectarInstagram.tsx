"use client";

import { useActionState } from "react";

import { AdminButton } from "@/components/admin/AdminUI";

import { conectarInstagram, desconectar, type EstadoDeFormulario } from "./actions";

/* ============================================================================
   LA CUENTA DE INSTAGRAM
   ----------------------------------------------------------------------------
   Dos pantallas en una. Sin cuenta, el campo para pegar el token. Con cuenta,
   lo único que de verdad hay que vigilar: CUÁNTO LE QUEDA AL ACCESO.

   Eso no es un adorno. El token de Instagram dura sesenta días y, si se dejan
   pasar sin renovarlo, muere para siempre y hay que volver a conectar a mano.
   El panel lo renueva solo cuando le quedan pocos días, pero esa renovación
   solo puede ocurrir si alguien entra aquí. Un acceso que caduca en silencio
   es un panel que un día deja de publicar sin decir por qué.
   ========================================================================== */

const inicial: EstadoDeFormulario = { status: "idle" };

export function ConectarInstagram({
  cuenta,
}: {
  readonly cuenta: {
    readonly username: string | null;
    /**
     * Días que le quedan al acceso, CALCULADOS EN EL SERVIDOR.
     *
     * Aquí llegaba la fecha y se restaba en el navegador dentro de un efecto,
     * y era dar un rodeo para nada: el dato no cambia mientras se mira la
     * pantalla, así que restar en el servidor evita el efecto, evita el
     * desajuste entre el render del servidor y el del navegador, y deja este
     * componente sin estado que sincronizar.
     */
    readonly dias: number | null;
  } | null;
}) {
  const [state, action] = useActionState(conectarInstagram, inicial);

  if (cuenta) {
    return (
      <section className="border-line bg-surface-raised flex flex-wrap items-center justify-between gap-4 rounded-(--radius-card) border p-5">
        <div className="flex flex-col gap-1">
          <span className="eyebrow text-fg-muted text-[0.75rem]">Instagram</span>
          <span className="font-display text-xl">
            {cuenta.username ? `@${cuenta.username}` : "Cuenta conectada"}
          </span>
          <Caducidad dias={cuenta.dias} />
        </div>

        <form action={desconectar}>
          <input type="hidden" name="red" value="instagram" />
          <AdminButton>Desconectar</AdminButton>
        </form>
      </section>
    );
  }

  return (
    <section className="border-line flex flex-col gap-4 rounded-(--radius-card) border border-dashed p-6">
      <div className="flex flex-col gap-2">
        <h2 className="eyebrow text-fg-muted text-[0.8rem]">Conectar Instagram</h2>
        <p className="text-fg-muted max-w-[70ch] text-sm text-pretty">
          Pegue aquí el token que genera el panel de Meta, en{" "}
          <span className="text-fg">Instagram → API setup with Instagram business login</span>. Dura
          sesenta días y a partir de ahí se renueva solo.
        </p>
      </div>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm"
        >
          {state.message}
        </p>
      ) : null}

      <form action={action} className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[20rem] flex-1 flex-col gap-2">
          <span className="eyebrow text-fg-muted text-[0.75rem]">Token de acceso</span>
          <input
            type="password"
            name="token"
            required
            autoComplete="off"
            spellCheck={false}
            className="border-line bg-surface focus:border-accent rounded-(--radius-card) border px-3 py-2.5 text-sm outline-none"
          />
        </label>

        <AdminButton tone="accent">Conectar</AdminButton>
      </form>
    </section>
  );
}

/**
 * La cuenta atrás del acceso, en días.
 *
 * En minutos y segundos —como en las invitaciones de socios— aquí sería ruido:
 * lo que se decide con este dato es «¿tengo que hacer algo esta semana?», y
 * para eso sobra el reloj.
 */
function Caducidad({ dias }: { readonly dias: number | null }) {
  if (dias === null) return null;

  return (
    <span className={`text-xs ${dias <= 7 ? "text-danger" : "text-fg-muted/60"}`} data-numeric>
      {dias > 0 ? `El acceso caduca en ${dias} días` : "El acceso caducó: vuelva a conectar"}
    </span>
  );
}
