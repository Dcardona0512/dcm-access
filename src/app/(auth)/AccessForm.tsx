"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Honeypot } from "@/components/ui/Field";
import type { Dictionary } from "@/content/types";

import { sendMagicLink, signInWithGoogle } from "./actions";
import { initialAuthState } from "./state";

/* ============================================================================
   LA PUERTA — ENTRAR Y REGISTRARSE
   ----------------------------------------------------------------------------
   Una sola pieza para las dos pantallas, porque son la misma conversación con
   dos frases distintas: el correo, y qué hace aquí quien llega. Separarlas en
   dos componentes garantizaría que dentro de un mes se parezcan solo a medias.

   Sin contraseña, y no por moda: una contraseña es algo que se olvida, se
   reutiliza y se filtra, y que obliga a guardar un secreto de cada persona. Un
   enlace de un solo uso no deja nada guardado que robar.

   UNA SOLA CUENTA PARA TODOS, y no se pregunta nada más.

   Aquí había una elección —«busco algo» o «tengo algo que ofrecer»— y sobraba,
   porque parte a la gente en dos antes de conocerla: quien entra a mirar puede
   tener mañana algo que vender, y quien viene a vender acaba comprando. Una
   cuenta sirve para las dos cosas.

   Lo que DCM ACCESS controla no es quién se registra: es el CONTACTO. Quien
   publica no recibe el teléfono de quien pregunta, ni al revés; la conversación
   la abre el broker. Ese control vive en el servidor y en las políticas de la
   base, que es donde no se puede rodear, no en una pregunta del formulario.
   ========================================================================== */

export function AccessForm({
  dict,
  modo,
  conGoogle,
  next,
  aviso,
}: {
  readonly dict: Dictionary;
  readonly modo: "login" | "signup";
  /**
   * Si Google está conectado de verdad.
   *
   * El botón aparece solo cuando hay credenciales puestas. Un «Continuar con
   * Google» que lleva a una pantalla de error no es una función a medias: es
   * una promesa rota en la primera pantalla que ve alguien.
   */
  readonly conGoogle: boolean;
  /** A dónde volver tras entrar. Ya viene validado desde el servidor. */
  readonly next?: string;
  /** Mensaje de error traducido, cuando se llega desde un enlace fallido. */
  readonly aviso?: string;
}) {
  const [state, action] = useActionState(sendMagicLink, initialAuthState);
  /*
    «Usar otro correo» vuelve al formulario sin recargar. El estado de la
    acción no se puede reiniciar, así que se tapa: mientras esto esté puesto,
    manda el formulario aunque el envío anterior saliera bien.
  */
  const [reescribiendo, setReescribiendo] = useState(false);

  const t = dict.auth;
  const registro = modo === "signup";

  if (state.status === "sent" && !reescribiendo) {
    return (
      <CorreoEnviado
        dict={dict}
        correo={state.email ?? ""}
        modo={modo}
        onOtroCorreo={() => setReescribiendo(true)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-display text-3xl">{registro ? t.signupHeading : t.loginHeading}</h1>
        <p className="text-fg-muted text-sm text-pretty">
          {registro ? t.signupLede : t.loginLede}
        </p>
      </div>

      {aviso ? <Aviso texto={aviso} /> : null}
      {state.status === "error" && state.message ? <Aviso texto={state.message} /> : null}

      {/*
        Google va PRIMERO y fuera del formulario del correo. Es un envío
        distinto a una acción distinta: meterlo dentro obligaría a que un botón
        del mismo formulario no enviara el formulario, que es la clase de cosa
        que funciona hasta que alguien pulsa Intro en el campo del correo.
      */}
      {conGoogle ? (
        <>
          <form action={signInWithGoogle}>
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <BotonGoogle texto={t.continueGoogle} />
          </form>

          <div className="flex items-center gap-4">
            <span className="bg-line h-px flex-1" />
            <span className="eyebrow text-fg-muted/60 text-[0.7rem]">{t.separator}</span>
            <span className="bg-line h-px flex-1" />
          </div>
        </>
      ) : null}

      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="mode" value={modo} />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Honeypot />

        <div className="flex flex-col gap-3">
          <label htmlFor="dcm-email" className="text-center text-sm font-semibold">
            {t.emailLabel}
          </label>
          <input
            id="dcm-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            autoFocus
            placeholder={t.emailPlaceholder}
            className="border-line text-fg placeholder:text-fg-muted/40 hover:border-fg-muted/40 focus-visible:border-accent w-full rounded-(--radius-card) border bg-transparent px-4 py-4 text-center outline-none transition-colors"
          />
        </div>

        <BotonEnviar texto={t.continueEmail} />
      </form>

      <p className="text-fg-muted/60 text-center text-xs text-pretty">{t.legal}</p>
    </div>
  );
}

/* --- «Correo enviado» ------------------------------------------------------ */

/**
 * La misma pantalla para entrar y para registrarse, porque lo que ha pasado es
 * exactamente lo mismo: hay un correo en camino y aquí no queda nada que hacer.
 *
 * DICE A QUÉ DIRECCIÓN SE MANDÓ, y no es un adorno: es el único momento en que
 * se puede pillar un correo mal escrito. Sin enseñarlo, quien puso una letra de
 * más se queda esperando un correo que llegó a otra parte y no tiene forma de
 * saberlo.
 *
 * Y nombra la carpeta de no deseado por el mismo motivo: ahí acaban los correos
 * automáticos de un dominio joven, y quien no lo sepa da por hecho que esto
 * está roto.
 */
function CorreoEnviado({
  dict,
  correo,
  modo,
  onOtroCorreo,
}: {
  readonly dict: Dictionary;
  readonly correo: string;
  readonly modo: "login" | "signup";
  readonly onOtroCorreo: () => void;
}) {
  const [, reenviar] = useActionState(sendMagicLink, initialAuthState);
  const t = dict.auth;
  const buzon = buzonDe(correo);

  return (
    <div className="flex flex-col gap-6 text-center">
      <h1 className="font-display text-3xl">{t.sentHeading}</h1>

      <p className="text-fg-muted text-sm leading-relaxed text-pretty">
        {t.sentBody} <strong className="text-fg font-semibold break-all">{correo}</strong>
      </p>

      <p className="text-fg-muted/70 text-sm leading-relaxed text-pretty">{t.sentHint}</p>

      {/*
        El botón lleva al buzón de su proveedor, y solo aparece si sabemos cuál
        es. Un «ir a mi correo» que no lleva a ninguna parte es peor que no
        ponerlo: quien lo pulsa cree que algo se rompió.
      */}
      {buzon ? (
        <a
          href={buzon.url}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow bg-accent text-surface border-accent inline-flex h-12 items-center justify-center rounded-(--radius-card) border text-[0.75rem] transition-opacity hover:opacity-90"
        >
          {t.sentOpenInbox} {buzon.nombre}
        </a>
      ) : null}

      <div className="flex flex-col gap-3">
        <form action={reenviar}>
          <input type="hidden" name="email" value={correo} />
          <input type="hidden" name="mode" value={modo} />
          <BotonReenviar texto={t.sentResend} />
        </form>

        <button
          type="button"
          onClick={onOtroCorreo}
          className="text-fg-muted hover:text-fg text-sm font-medium transition-colors"
        >
          {t.sentOtherEmail}
        </button>
      </div>
    </div>
  );
}

/**
 * A qué buzón lleva un correo, por su dominio.
 *
 * Solo los que se pueden acertar. Para el resto no se enseña botón: adivinar
 * `https://<dominio>` acierta con los grandes y falla con el correo de una
 * empresa, que es justo donde el fallo se nota.
 */
function buzonDe(correo: string): { readonly nombre: string; readonly url: string } | null {
  const dominio = correo.split("@")[1]?.toLowerCase();
  if (!dominio) return null;

  const buzones: Record<string, { nombre: string; url: string }> = {
    "gmail.com": { nombre: "Gmail", url: "https://mail.google.com" },
    "googlemail.com": { nombre: "Gmail", url: "https://mail.google.com" },
    "hotmail.com": { nombre: "Outlook", url: "https://outlook.live.com/mail" },
    "hotmail.es": { nombre: "Outlook", url: "https://outlook.live.com/mail" },
    "outlook.com": { nombre: "Outlook", url: "https://outlook.live.com/mail" },
    "outlook.es": { nombre: "Outlook", url: "https://outlook.live.com/mail" },
    "live.com": { nombre: "Outlook", url: "https://outlook.live.com/mail" },
    "yahoo.com": { nombre: "Yahoo", url: "https://mail.yahoo.com" },
    "yahoo.es": { nombre: "Yahoo", url: "https://mail.yahoo.com" },
    "icloud.com": { nombre: "iCloud", url: "https://www.icloud.com/mail" },
    "me.com": { nombre: "iCloud", url: "https://www.icloud.com/mail" },
    "proton.me": { nombre: "Proton", url: "https://mail.proton.me" },
    "protonmail.com": { nombre: "Proton", url: "https://mail.proton.me" },
  };

  return buzones[dominio] ?? null;
}

/* --- Piezas ---------------------------------------------------------------- */

function Aviso({ texto }: { readonly texto: string }) {
  return (
    <p
      role="alert"
      className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-center text-sm text-pretty"
    >
      {texto}
    </p>
  );
}

function BotonEnviar({ texto }: { readonly texto: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="eyebrow bg-accent text-surface border-accent inline-flex h-12 w-full items-center justify-center rounded-(--radius-card) border text-[0.75rem] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
    >
      {/* Mientras espera no cambia de tamaño, solo de contenido. */}
      {pending ? "···" : texto}
    </button>
  );
}

function BotonReenviar({ texto }: { readonly texto: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="eyebrow border-line text-fg-muted hover:border-fg-muted/60 hover:text-fg inline-flex h-11 w-full items-center justify-center rounded-(--radius-card) border text-[0.75rem] transition-colors disabled:opacity-50"
    >
      {pending ? "···" : texto}
    </button>
  );
}

function BotonGoogle({ texto }: { readonly texto: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="eyebrow border-line text-fg hover:border-fg-muted inline-flex h-12 w-full items-center justify-center gap-3 rounded-(--radius-card) border text-[0.75rem] transition-colors disabled:pointer-events-none disabled:opacity-50"
    >
      <MarcaGoogle />
      {texto}
    </button>
  );
}

/** La G de Google, con sus colores. La marca ajena se usa como es o no se usa. */
function MarcaGoogle() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
