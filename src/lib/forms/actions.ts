"use server";

import { headers } from "next/headers";

import { getDictionary } from "@/content";
import { getRepositories } from "@/lib/data";
import type { LeadInput } from "@/lib/data/repositories";
import { track } from "@/lib/analytics";
import { isVertical, type Currency, type Vertical } from "@/lib/domain/types";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { checkRateLimit, isHoneypotTripped } from "@/lib/security/rate-limit";

import {
  contactSchema,
  flattenIssues,
  inquirySchema,
  partnerApplicationSchema,
  privateRequestSchema,
} from "./schemas";
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

/* --- Búsqueda privada ----------------------------------------------------------- */

export async function submitPrivateRequest(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = readLocale(formData);
  const dict = getDictionary(locale);

  const check = await guard(formData, "private-request", locale);
  if (!check.ok) return check.state;

  const parsed = privateRequestSchema(dict).safeParse(values(formData));
  if (!parsed.success) {
    return { status: "error", errors: flattenIssues(parsed.error) };
  }

  const data = parsed.data;

  try {
    const lead = await createLead({
      source: "private_request",
      locale,
      contact: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferredChannel: data.contactMethod,
      },
      vertical: data.vertical as Vertical | undefined,
      message: [data.what, data.requirements].filter(Boolean).join("\n\n"),
      budget: data.budget ? { amount: data.budget, currency: data.currency as Currency } : undefined,
      location: data.location ? { country: "", city: data.location } : undefined,
      timeline: data.timeline,
      confidentiality: data.confidentiality,
    });

    track({
      name: "private_request_submitted",
      vertical: data.vertical as Vertical | undefined,
      confidentiality: data.confidentiality,
    });

    return { status: "success", reference: lead.reference };
  } catch {
    return { status: "error", message: dict.errors.generic };
  }
}

/* --- Postulación de partner ------------------------------------------------------ */

export async function submitPartnerApplication(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = readLocale(formData);
  const dict = getDictionary(locale);

  const check = await guard(formData, "partner", locale);
  if (!check.ok) return check.state;

  const raw = {
    ...values(formData),
    // Las casillas múltiples llegan repetidas; `values()` solo conserva la última.
    verticals: formData.getAll("verticals").filter((v): v is string => typeof v === "string"),
  };

  const parsed = partnerApplicationSchema(dict).safeParse(raw);
  if (!parsed.success) {
    return { status: "error", errors: flattenIssues(parsed.error) };
  }

  const data = parsed.data;
  const split = (value: string | undefined) =>
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

  try {
    const { providers } = getRepositories();

    const provider = await providers.createApplication({
      name: data.company,
      country: data.country,
      city: data.city,
      verticals: data.verticals,
      services: split(data.services),
      website: data.website,
      email: data.email,
      phone: data.phone,
      description: data.description,
      operatingAreas: split(data.operatingAreas),
      commercialInfo: data.commercialInfo,
      certifications: split(data.certifications),
      licences: data.licences,
      documentation: data.documentation,
    });

    // La postulación es también un lead: entra en el mismo embudo que el resto
    // y se gestiona desde la misma bandeja del CRM (§23).
    const lead = await createLead({
      source: "partner_application",
      locale,
      contact: { name: data.company, email: data.email, phone: data.phone },
      providerId: provider.id,
      message: data.description,
    });

    track({ name: "partner_applied", verticals: data.verticals });
    return { status: "success", reference: lead.reference };
  } catch {
    return { status: "error", message: dict.errors.generic };
  }
}
