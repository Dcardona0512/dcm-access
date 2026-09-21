"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Logo } from "@/components/brand/Logo";
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
   reutiliza y se filtra, y que obliga a guardar un secreto de cada persona.
   Un enlace de un solo uso no deja nada guardado que robar.

   La elección de cliente o partner SOLO aparece al registrarse, y es una
   declaración de intención: el rol de partner lo concede el administrador al
   verificar. Al entrar no se pregunta nada, porque el rol ya está en la base.
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
  const [rol, setRol] = useState<"client" | "partner">("client");

  const t = dict.auth;
  const registro = modo === "signup";

  if (state.status === "sent") {
    return (
      <section className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <Logo variant="stacked" descriptor={dict.brand.logoTagline} />

        <div className="border-accent/30 bg-accent/[0.04] flex flex-col gap-3 rounded-(--radius-card) border px-6 py-10">
          <h1 className="font-display text-2xl">{t.sentHeading}</h1>
          <p className="text-fg-muted text-pretty">{t.sentBody}</p>
          {state.email ? (
            <p className="text-accent text-sm break-all">{state.email}</p>
          ) : null}
          <p className="text-fg-muted/60 text-xs text-pretty">{t.sentHint}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full max-w-md flex-col gap-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <Logo variant="stacked" descriptor={dict.brand.logoTagline} />
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl">
            {registro ? t.signupHeading : t.loginHeading}
          </h1>
          <p className="text-fg-muted text-pretty">{registro ? t.signupLede : t.loginLede}</p>
        </div>
      </div>

      {aviso ? (
        <p
          role="alert"
          className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm text-pretty"
        >
          {aviso}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm text-pretty"
        >
          {state.message}
        </p>
      ) : null}

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
            {registro ? <input type="hidden" name="requestedRole" value={rol} /> : null}
            <BotonGoogle texto={t.continueGoogle} />
          </form>

          <div className="flex items-center gap-4">
            <span className="bg-line h-px flex-1" />
            <span className="eyebrow text-fg-muted/60 text-[0.7rem]">{t.separator}</span>
            <span className="bg-line h-px flex-1" />
          </div>
        </>
      ) : null}

      <form action={action} className="flex flex-col gap-5">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Honeypot />

        {registro ? (
          <fieldset className="flex flex-col gap-3">
            <legend className="eyebrow text-fg-muted mb-3 text-[0.8rem]">{t.roleQuestion}</legend>

            <Eleccion
              nombre="requestedRole"
              valor="client"
              elegido={rol}
              onElegir={setRol}
              titulo={t.roleClient}
              pista={t.roleClientHint}
            />
            <Eleccion
              nombre="requestedRole"
              valor="partner"
              elegido={rol}
              onElegir={setRol}
              titulo={t.rolePartner}
              pista={t.rolePartnerHint}
            />

            {rol === "partner" ? (
              <p className="text-fg-muted/70 text-xs text-pretty">{t.partnerNotice}</p>
            ) : null}
          </fieldset>
        ) : null}

        <div className="flex flex-col gap-2">
          <label htmlFor="dcm-email" className="eyebrow text-fg-muted text-[0.8rem]">
            {t.emailLabel}
          </label>
          <input
            id="dcm-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            autoFocus
            placeholder={t.emailPlaceholder}
            className="border-line text-fg placeholder:text-fg-muted/40 hover:border-fg-muted/40 focus-visible:border-accent h-12 w-full rounded-(--radius-card) border bg-transparent px-4 outline-none transition-colors"
          />
        </div>

        <BotonCorreo texto={t.continueEmail} />
      </form>

      <p className="text-fg-muted/60 text-center text-xs text-pretty">{t.legal}</p>

      <p className="text-fg-muted text-center text-sm">
        {registro ? t.haveAccount : t.noAccount}{" "}
        <Link
          href={registro ? "/login" : "/signup"}
          className="text-accent underline-offset-2 hover:underline"
        >
          {registro ? t.toLogin : t.toSignup}
        </Link>
      </p>
    </section>
  );
}

/** Tarjeta de elección. Es un radio de verdad: funciona con teclado y sin JS. */
function Eleccion({
  nombre,
  valor,
  elegido,
  onElegir,
  titulo,
  pista,
}: {
  readonly nombre: string;
  readonly valor: "client" | "partner";
  readonly elegido: string;
  readonly onElegir: (valor: "client" | "partner") => void;
  readonly titulo: string;
  readonly pista: string;
}) {
  const activo = elegido === valor;

  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-(--radius-card) border p-4 transition-colors ${
        activo ? "border-accent/60 bg-accent/[0.04]" : "border-line hover:border-fg-muted/40"
      }`}
    >
      <input
        type="radio"
        name={nombre}
        value={valor}
        checked={activo}
        onChange={() => onElegir(valor)}
        className="accent-accent mt-1 h-4 w-4 shrink-0"
      />
      <span className="flex flex-col gap-1">
        <span className="text-sm">{titulo}</span>
        <span className="text-fg-muted/70 text-xs text-pretty">{pista}</span>
      </span>
    </label>
  );
}

function BotonCorreo({ texto }: { readonly texto: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="eyebrow bg-accent text-surface border-accent inline-flex h-12 w-full items-center justify-center rounded-(--radius-card) border text-[0.75rem] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "…" : texto}
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
