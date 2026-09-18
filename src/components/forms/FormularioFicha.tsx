"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { CheckboxField, Honeypot, TextAreaField, TextField } from "@/components/ui/Field";
import type { Dictionary } from "@/content/types";
import type { Vertical } from "@/lib/domain/types";
import { submitInquiry } from "@/lib/forms/actions";
import { initialFormState } from "@/lib/forms/state";
import { localizePath, type Locale } from "@/lib/i18n/config";

import { FormError, FormSuccess } from "./FormParts";

/* ============================================================================
   FORMULARIO DE CONTACTO DE LA FICHA
   ----------------------------------------------------------------------------
   Antes la ficha tenía un botón que saltaba directo a WhatsApp. Era cómodo y
   dejaba al broker con un número de teléfono y nada más: ni nombre, ni correo,
   ni de qué ficha venía, y si la persona abría WhatsApp y no escribía, no
   quedaba ni eso.

   Ahora los dos caminos —«Contactar» y «WhatsApp»— son el mismo formulario y
   la misma acción. Se valida, se guarda el lead, y solo después se abre
   WhatsApp con el mensaje escrito. Quien prefiere WhatsApp lo sigue teniendo a
   un botón; lo que cambia es que sus datos ya están guardados antes de salir.

   Vive en la columna lateral, junto al precio: es donde mira quien ya decidió
   preguntar, y así no hay que bajar media página para encontrarlo.
   ========================================================================== */

/**
 * Indicativos. Colombia primero porque es el mercado, y el resto son los
 * países desde los que puede llamar un comprador de estas fichas. No es la
 * lista completa del mundo a propósito: un desplegable de doscientas entradas
 * en una columna estrecha es peor que uno de diez.
 *
 * Las siglas van en letras y no en banderitas: Windows no dibuja los emojis de
 * bandera y en su lugar enseña las dos letras sueltas en minúscula, que se lee
 * como un error. Escritas a propósito se ven igual en todas partes.
 */
const INDICATIVOS = [
  { value: "+57", label: "CO +57" },
  { value: "+1", label: "US +1" },
  { value: "+34", label: "ES +34" },
  { value: "+52", label: "MX +52" },
  { value: "+507", label: "PA +507" },
  { value: "+593", label: "EC +593" },
  { value: "+51", label: "PE +51" },
  { value: "+56", label: "CL +56" },
  { value: "+54", label: "AR +54" },
  { value: "+55", label: "BR +55" },
  { value: "+44", label: "GB +44" },
  { value: "+971", label: "AE +971" },
] as const;

export function FormularioFicha({
  locale,
  dict,
  opportunityId,
  vertical,
  slug,
  mensajeInicial,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly opportunityId: string;
  readonly vertical: Vertical;
  readonly slug: string;
  /** Texto con el que arranca la consulta, con el título y la referencia. */
  readonly mensajeInicial: string;
}) {
  const [state, action] = useActionState(submitInquiry, initialFormState);

  /*
    Un formulario enviado a una acción se reinicia solo al volver la respuesta,
    igual que uno nativo. Por eso los valores por defecto salen del estado y no
    de una constante: cuando algo falla, la acción devuelve lo que la persona
    había escrito y el reinicio la deja exactamente como estaba, con el error
    señalado y nada que volver a teclear.
  */
  const previo = state.values ?? {};

  /*
    El salto a WhatsApp ocurre aquí y no en el botón: hasta que la acción no
    responde no existe el enlace, porque el enlace es la señal de que el lead
    quedó guardado. Es una navegación de la propia pestaña —no una ventana
    nueva—, así que ningún bloqueador de emergentes la corta. Aun así debajo
    queda el enlace a la vista, por si el navegador la ignora.
  */
  useEffect(() => {
    if (state.status === "success" && state.whatsapp) {
      window.location.href = state.whatsapp;
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-4">
        <FormSuccess
          heading={dict.inquiry.successHeading}
          body={dict.inquiry.successBody}
          reference={state.reference}
          dict={dict}
          className="px-5 py-10"
        />

        {state.whatsapp ? (
          <a
            href={state.whatsapp}
            className="eyebrow border-line text-fg hover:border-fg-muted inline-flex items-center justify-center gap-2.5 rounded-(--radius-card) border px-5 py-3 text-center text-[0.75rem] transition-colors"
          >
            <MarcaWhatsApp />
            {dict.inquiry.successWhatsapp}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="opportunityId" value={opportunityId} />
      <input type="hidden" name="vertical" value={vertical} />
      <input type="hidden" name="slug" value={slug} />
      <Honeypot />

      <p className="text-fg-muted text-sm text-pretty">{dict.inquiry.lede}</p>

      <FormError state={state} />

      <TextField
        name="name"
        label={dict.inquiry.fields.name.label}
        autoComplete="name"
        required
        defaultValue={previo.name}
        error={state.errors?.name}
      />

      {/*
        Indicativo y número comparten renglón porque son un solo dato. El
        indicativo es un `<select>` nativo y no un menú propio: en el teléfono
        abre la rueda del sistema, que es más cómoda que cualquier cosa que se
        pueda dibujar aquí.
      */}
      <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="dcm-phone-code"
            className="eyebrow text-fg-muted truncate text-[0.8rem]"
          >
            {dict.inquiry.phoneCode}
          </label>
          <select
            id="dcm-phone-code"
            name="phoneCode"
            defaultValue={previo.phoneCode ?? "+57"}
            className="border-line text-fg hover:border-fg-muted/40 focus-visible:border-accent h-12 w-full cursor-pointer rounded-(--radius-card) border bg-transparent px-3 outline-none transition-colors"
          >
            {INDICATIVOS.map((indicativo) => (
              <option
                key={indicativo.value}
                value={indicativo.value}
                className="bg-surface-raised"
              >
                {indicativo.label}
              </option>
            ))}
          </select>
        </div>

        <TextField
          name="phone"
          type="tel"
          inputMode="tel"
          label={dict.inquiry.fields.phone.label}
          autoComplete="tel"
          required
          defaultValue={previo.phone}
          error={state.errors?.phone}
        />
      </div>

      <TextField
        name="email"
        type="email"
        inputMode="email"
        label={dict.inquiry.fields.email.label}
        autoComplete="email"
        required
        defaultValue={previo.email}
        error={state.errors?.email}
      />

      <TextAreaField
        name="message"
        label={dict.inquiry.fields.message.label}
        defaultValue={previo.message ?? mensajeInicial}
        required
        rows={3}
        error={state.errors?.message}
      />

      <CheckboxField
        name="consent"
        label={<Consentimiento dict={dict} locale={locale} />}
        defaultChecked={previo.consent === "on"}
        error={state.errors?.consent}
      />

      <Botones dict={dict} />
    </form>
  );
}

/**
 * Los dos botones, y los dos envían el mismo formulario.
 *
 * `name="intent"` en cada uno: el navegador manda el valor del botón PULSADO,
 * así que la acción sabe por dónde quiere seguir la conversación sin que haga
 * falta estado en el cliente ni dos formularios distintos.
 */
function Botones({ dict }: { readonly dict: Dictionary }) {
  const { pending } = useFormStatus();

  const base =
    "eyebrow inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-(--radius-card) " +
    "px-5 text-[0.75rem] transition-colors disabled:pointer-events-none disabled:opacity-50";

  return (
    <div className="flex flex-col gap-3">
      {/*
        El dorado macizo es el único de la vista: la regla de marca lo reserva
        para UNA acción por pantalla, y es esta.
      */}
      <button
        type="submit"
        name="intent"
        value="form"
        disabled={pending}
        aria-busy={pending}
        className={`${base} bg-accent text-surface border-accent border hover:opacity-90`}
      >
        {pending ? dict.common.submitting : dict.inquiry.submit}
      </button>

      <button
        type="submit"
        name="intent"
        value="whatsapp"
        disabled={pending}
        aria-busy={pending}
        className={`${base} border-line text-fg hover:border-fg-muted border`}
      >
        <MarcaWhatsApp />
        {dict.inquiry.whatsapp}
      </button>
    </div>
  );
}

/**
 * La autorización, con sus dos documentos enlazados de verdad.
 *
 * El texto viene del diccionario con dos marcas, `{terms}` y `{privacy}`, y se
 * parte por ellas. Se hace así —y no con tres cadenas sueltas— porque en
 * inglés y en español los enlaces no caen en el mismo sitio de la frase, y
 * trocear la traducción obliga al traductor a respetar un orden que el idioma
 * no siempre permite.
 */
function Consentimiento({
  dict,
  locale,
}: {
  readonly dict: Dictionary;
  readonly locale: Locale;
}) {
  const enlace = "text-accent underline-offset-2 hover:underline";

  return (
    <>
      {dict.inquiry.consent.split(/(\{terms\}|\{privacy\})/).map((parte, indice) => {
        if (parte === "{terms}") {
          return (
            <Link
              key={indice}
              href={localizePath("/legal/terms", locale)}
              target="_blank"
              className={enlace}
            >
              {dict.inquiry.consentTerms}
            </Link>
          );
        }

        if (parte === "{privacy}") {
          return (
            <Link
              key={indice}
              href={localizePath("/legal/privacy", locale)}
              target="_blank"
              className={enlace}
            >
              {dict.inquiry.consentPrivacy}
            </Link>
          );
        }

        return <span key={indice}>{parte}</span>;
      })}
    </>
  );
}

function MarcaWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.13 15.06l-.3-.18-3.08.9.9-3-.2-.31A8.1 8.1 0 0 1 12.05 3.8Zm4.65 11.1c-.25-.13-1.47-.73-1.7-.81-.23-.09-.4-.13-.56.12-.17.25-.65.8-.8.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.24a7.5 7.5 0 0 1-1.38-1.72c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.42-.55-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.4.52.6.18 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.19.2-.58.2-1.08.14-1.18-.06-.11-.23-.17-.48-.29Z" />
    </svg>
  );
}
