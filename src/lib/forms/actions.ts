"use server";

import { headers } from "next/headers";

import { getDictionary, interpolate } from "@/content";
import { contact, whatsappHref } from "@/content/shared";
import { getRepositories } from "@/lib/data";
import type { LeadInput } from "@/lib/data/repositories";
import { track } from "@/lib/analytics";
import { isVertical } from "@/lib/domain/types";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit, isHoneypotTripped } from "@/lib/security/rate-limit";
import { absoluteUrl } from "@/lib/seo";

import { contactSchema, flattenIssues, inquirySchema } from "./schemas";
import type { FormState } from "./state";

/* ============================================================================
   SERVER ACTIONS DE CAPTACIÓN (§21, §23)
   ----------------------------------------------------------------------------
   Toda interacción importante termina siendo un lead: consulta de ficha,
   búsqueda privada, contacto y postulación de partner comparten el mismo
   camino — validar, limitar, registrar, medir — y difieren solo en el `source`.

   Ninguna acción habla con una base de datos directamente: todas pasan por
   `LeadRepository`, así que conectar Supabase no las toca.
   ========================================================================== */

function readLocale(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

/**
 * Clave de limitación. Se apoya en la IP que reporta el proxy; cuando no hay
 * ninguna (desarrollo local), degrada a una clave común, que es lo bastante
 * bueno para frenar un envío repetido desde el mismo navegador.
 */
async function rateKey(scope: string): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${forwarded ?? store.get("x-real-ip") ?? "local"}`;
}

function values(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    result[key] = value;
  }
  return result;
}

/**
 * Devuelve lo escrito para repoblar el formulario tras un error.
 *
 * Con lista blanca: el campo trampa del honeypot y cualquier cosa que llegue
 * de más se quedan fuera, y así un error no le devuelve al navegador nada que
 * no haya puesto la persona.
 */
function devueltos(formData: FormData, campos: readonly string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const campo of campos) {
    const value = formData.get(campo);
    if (typeof value === "string") result[campo] = value;
  }
  return result;
}

const CAMPOS_FICHA = ["name", "phone", "phoneCode", "email", "message", "consent"] as const;

type Guard = { readonly ok: true } | { readonly ok: false; readonly state: FormState };

async function guard(formData: FormData, scope: string, locale: Locale): Promise<Guard> {
  const dict = getDictionary(locale);

  // El bot que rellena el campo trampa recibe un éxito silencioso: no se le
  // informa de que ha sido detectado, y no se crea ningún lead.
  if (isHoneypotTripped(formData)) {
    return { ok: false, state: { status: "success" } };
  }

  const limit = checkRateLimit(await rateKey(scope));
  if (!limit.allowed) {
    return { ok: false, state: { status: "error", message: dict.errors.rateLimited } };
  }

  return { ok: true };
}

async function createLead(input: LeadInput) {
  const { leads } = getRepositories();
  const lead = await leads.create(input);
  track({ name: "lead_created", leadId: lead.id, source: input.source });
  return lead;
}

/* --- Consulta desde una ficha ------------------------------------------------ */

export async function submitInquiry(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = readLocale(formData);
  const dict = getDictionary(locale);

  const check = await guard(formData, "inquiry", locale);
  if (!check.ok) return check.state;

  const parsed = inquirySchema(dict).safeParse(values(formData));
  if (!parsed.success) {
    return {
      status: "error",
      errors: flattenIssues(parsed.error),
      values: devueltos(formData, CAMPOS_FICHA),
    };
  }

  const verticalRaw = formData.get("vertical");
  const vertical = typeof verticalRaw === "string" && isVertical(verticalRaw) ? verticalRaw : undefined;

  /*
    Quien pulsa «WhatsApp» quiere seguir por ahí, no en el correo. Pero pasa
    por el mismo camino que el otro botón: primero se valida y se guarda el
    lead, y solo entonces se devuelve el enlace. El orden es lo que importa —
    si WhatsApp se abriera antes, bastaría con no escribir el mensaje para que
    del interesado no quedara rastro, que es justo lo que se quiere evitar.
  */
  const porWhatsapp = formData.get("intent") === "whatsapp";
  const telefono = `${parsed.data.phoneCode} ${parsed.data.phone}`;

  /*
    Si quien pregunta tiene sesión, la consulta queda atada a su cuenta y
    aparece luego en su panel. Si no la tiene, se guarda igual: preguntar por
    una ficha no puede exigir registrarse, eso es perder al interesado en la
    puerta.
  */
  const sesion = await getSession();

  try {
    const lead = await createLead({
      source: "inquiry",
      locale,
      contact: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: telefono,
        preferredChannel: porWhatsapp ? "whatsapp" : "email",
      },
      vertical,
      opportunityId: parsed.data.opportunityId,
      clientId: sesion?.userId,
      message: parsed.data.message,
    });

    track({ name: "inquiry_submitted", opportunityId: parsed.data.opportunityId, vertical });

    return {
      status: "success",
      reference: lead.reference,
      whatsapp: porWhatsapp ? enlaceWhatsapp(formData, locale, parsed.data) : undefined,
    };
  } catch {
    return {
      status: "error",
      message: dict.errors.generic,
      values: devueltos(formData, CAMPOS_FICHA),
    };
  }
}

/**
 * Enlace con el que arranca la conversación, armado EN EL SERVIDOR.
 *
 * La ruta no se toma tal cual del formulario: se reconstruye a partir de la
 * vertical y del slug, y solo si los dos pasan su comprobación. Un campo
 * oculto lo puede reescribir cualquiera desde las herramientas del navegador,
 * y de ahí saldría un enlace con el dominio de otro dentro de un mensaje que
 * parece de la casa.
 */
function enlaceWhatsapp(
  formData: FormData,
  locale: Locale,
  datos: { readonly name: string; readonly message: string },
): string | undefined {
  const dict = getDictionary(locale);

  const verticalRaw = formData.get("vertical");
  const slugRaw = formData.get("slug");

  const vertical = typeof verticalRaw === "string" && isVertical(verticalRaw) ? verticalRaw : null;
  const slug =
    typeof slugRaw === "string" && /^[a-z0-9-]{1,120}$/.test(slugRaw) ? slugRaw : null;

  const enlace = vertical && slug ? absoluteUrl(`/${locale}/${vertical}/${slug}`) : null;

  const texto = interpolate(dict.inquiry.whatsappTemplate, {
    name: datos.name,
    message: datos.message,
  });

  // El enlace va al final y separado: WhatsApp lo convierte en tarjeta.
  const conEnlace = enlace ? `${texto}\n\n${enlace}` : texto;

  return whatsappHref(conEnlace, contact.whatsappSales) ?? undefined;
}

/* --- Contacto general ---------------------------------------------------------- */

export async function submitContact(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = readLocale(formData);
  const dict = getDictionary(locale);

  const check = await guard(formData, "contact", locale);
  if (!check.ok) return check.state;

  const parsed = contactSchema(dict).safeParse(values(formData));
  if (!parsed.success) {
    return { status: "error", errors: flattenIssues(parsed.error) };
  }

  try {
    const lead = await createLead({
      source: "contact",
      locale,
      contact: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
      },
      message: `${parsed.data.subject}\n\n${parsed.data.message}`,
    });

    track({ name: "contact_submitted" });
    return { status: "success", reference: lead.reference };
  } catch {
    return { status: "error", message: dict.errors.generic };
  }
}
