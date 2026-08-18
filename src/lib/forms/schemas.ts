import { z } from "zod";

import type { Dictionary } from "@/content/types";
import { currencies, verticals } from "@/lib/domain/types";
import { interpolate } from "@/content";

/* ============================================================================
   VALIDACIÓN (§40)
   ----------------------------------------------------------------------------
   Un solo esquema por formulario, construido con los mensajes del diccionario
   del idioma en curso. La validación corre en el servidor —que es donde
   importa— y el navegador añade sus propias comprobaciones nativas por encima.
   ========================================================================== */

function messages(dict: Dictionary) {
  return {
    required: dict.errors.required,
    email: dict.errors.email,
    url: dict.errors.url,
    selectOne: dict.errors.selectOne,
    consent: dict.errors.consent,
    min: (min: number) => interpolate(dict.errors.minLength, { min }),
    max: (max: number) => interpolate(dict.errors.maxLength, { max }),
  };
}

function requiredText(dict: Dictionary, { min = 2, max = 200 } = {}) {
  const m = messages(dict);
  return z
    .string()
    .trim()
    .min(1, m.required)
    .min(min, m.min(min))
    .max(max, m.max(max));
}

function optionalText(max = 400) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));
}

function email(dict: Dictionary) {
  const m = messages(dict);
  return z.string().trim().min(1, m.required).email(m.email).max(254);
}

function optionalUrl(dict: Dictionary) {
  const m = messages(dict);
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine(
      (value) => value === undefined || /^https?:\/\/.+\..+/.test(value),
      { message: m.url },
    );
}

/** Consulta desde la ficha de una oportunidad. */
export function inquirySchema(dict: Dictionary) {
  return z.object({
    name: requiredText(dict),
    email: email(dict),
    phone: optionalText(40),
    message: requiredText(dict, { min: 10, max: 2000 }),
    opportunityId: optionalText(64),
  });
}

/** Contacto general. */
export function contactSchema(dict: Dictionary) {
  return z.object({
    name: requiredText(dict),
    email: email(dict),
    phone: optionalText(40),
    subject: requiredText(dict, { min: 3, max: 160 }),
    message: requiredText(dict, { min: 10, max: 2000 }),
  });
}

/** Búsqueda privada (§21). */
export function privateRequestSchema(dict: Dictionary) {
  const m = messages(dict);

  return z.object({
    what: requiredText(dict, { min: 10, max: 2000 }),
    vertical: z
      .enum(verticals)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    location: optionalText(160),
    budget: z
      .string()
      .trim()
      .optional()
      .transform((value) => {
        if (!value) return undefined;
        const parsed = Number(value.replace(/[^\d]/g, ""));
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
      }),
    currency: z.enum(currencies).default("USD"),
    timeline: optionalText(40),
    requirements: optionalText(2000),
    name: requiredText(dict),
    email: email(dict),
    phone: optionalText(40),
    contactMethod: z.enum(["email", "phone", "whatsapp"]).default("email"),
    confidentiality: z.enum(["standard", "discreet", "strictly_private"]).default("standard"),
    consent: z
      .string()
      .optional()
      .refine((value) => value === "on", { message: m.consent }),
  });
}

/** Postulación de partner (§18). */
export function partnerApplicationSchema(dict: Dictionary) {
  const m = messages(dict);

  return z.object({
    company: requiredText(dict),
    country: requiredText(dict, { min: 2, max: 80 }),
    city: optionalText(80),
    verticals: z.array(z.enum(verticals)).min(1, m.selectOne),
    services: requiredText(dict, { min: 3, max: 500 }),
    website: optionalUrl(dict),
    email: email(dict),
    phone: optionalText(40),
    description: requiredText(dict, { min: 30, max: 2000 }),
    operatingAreas: requiredText(dict, { min: 2, max: 500 }),
    commercialInfo: optionalText(1000),
    certifications: optionalText(500),
    licences: optionalText(500),
    documentation: optionalText(1000),
    consent: z
      .string()
      .optional()
      .refine((value) => value === "on", { message: m.consent }),
  });
}

/** Convierte los errores de zod en el mapa plano que consume la UI. */
export function flattenIssues(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }

  return result;
}
