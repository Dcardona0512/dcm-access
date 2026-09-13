import { z } from "zod";

import type { Dictionary } from "@/content/types";
import { currencies } from "@/lib/domain/types";
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

/**
 * Casilla de autorización de tratamiento de datos.
 *
 * `z.literal`, y NO `z.string().optional().refine(...)`: una casilla sin
 * marcar no viaja en el FormData, así que al esquema le llega `undefined`, y
 * en zod 4 un opcional cortocircuita ahí sin llegar a ejecutar el `refine`.
 * Con aquel patrón la casilla era decorativa: el envío pasaba igual.
 */
function consent(dict: Dictionary) {
  return z.literal("on", { message: messages(dict).consent });
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

/* --- Solicitud de publicación de vehículo ------------------------------------- */

/**
 * Categorías de la vertical de vehículos.
 *
 * Se enumeran aquí porque el esquema es la frontera de confianza: aceptar
 * cualquier `categoryId` que llegue por el formulario dejaría publicar un
 * vehículo dentro de aviación. Los valores de los desplegables —combustible,
 * transmisión, estado— NO se repiten en el diccionario: salen del
 * `attributeSchema` de la categoría, que es su única fuente de verdad.
 */
export const motorsCategoryIds = ["cat-motors"] as const;

export const motorsFuels = ["petrol", "diesel", "hybrid", "electric"] as const;
export const motorsTransmissions = ["automatic", "manual"] as const;
export const motorsConditions = ["new", "excellent", "good", "to-refurbish"] as const;

/** Cifra escrita por una persona: "245.000", "245,000" y "245000" son lo mismo. */
function amount() {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const parsed = Number(value.replace(/[^\d]/g, ""));
      return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    });
}

export function sellListingSchema(dict: Dictionary) {
  const m = messages(dict);
  const currentYear = new Date().getFullYear();

  return z
    .object({
      categoryId: z.enum(motorsCategoryIds),
      make: requiredText(dict, { min: 2, max: 60 }),
      model: requiredText(dict, { min: 1, max: 80 }),
      // `coerce` porque todo lo que llega de un FormData es una cadena.
      year: z.coerce
        .number({ message: dict.errors.number })
        .int(dict.errors.number)
        .min(1900, dict.errors.number)
        .max(currentYear + 1, dict.errors.number),
      mileage: amount(),
      fuel: z.enum(motorsFuels),
      transmission: z.enum(motorsTransmissions),
      condition: z.enum(motorsConditions).default("excellent"),

      priceMode: z.enum(["fixed", "on_request"]).default("fixed"),
      priceAmount: amount(),
      currency: z.enum(currencies).default("USD"),

      country: requiredText(dict, { min: 2, max: 2 }),
      city: requiredText(dict, { min: 2, max: 80 }),

      description: requiredText(dict, { min: 30, max: 2000 }),

      name: requiredText(dict),
      email: email(dict),
      phone: optionalText(40),
      consent: consent(dict),
    })
    // Un precio fijo sin cifra no es un precio fijo. El error se cuelga del
    // campo del importe, no del formulario, para que se vea dónde arreglarlo.
    .refine((data) => data.priceMode === "on_request" || data.priceAmount !== undefined, {
      path: ["priceAmount"],
      message: m.required,
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
