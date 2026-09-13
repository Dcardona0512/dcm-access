"use server";

import { headers } from "next/headers";

import { getDictionary } from "@/content";
import { getRepositories } from "@/lib/data";
import type { LeadInput } from "@/lib/data/repositories";
import { track } from "@/lib/analytics";
import { isVertical } from "@/lib/domain/types";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { checkRateLimit, isHoneypotTripped } from "@/lib/security/rate-limit";

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
    return { status: "error", errors: flattenIssues(parsed.error) };
  }

  const verticalRaw = formData.get("vertical");
  const vertical = typeof verticalRaw === "string" && isVertical(verticalRaw) ? verticalRaw : undefined;

  try {
    const lead = await createLead({
      source: "inquiry",
      locale,
      contact: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
      },
      vertical,
      opportunityId: parsed.data.opportunityId,
      message: parsed.data.message,
    });

    track({ name: "inquiry_submitted", opportunityId: parsed.data.opportunityId, vertical });
    return { status: "success", reference: lead.reference };
  } catch {
    return { status: "error", message: dict.errors.generic };
  }
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
