"use server";

import { createHash } from "node:crypto";

import { headers } from "next/headers";

import { track } from "@/lib/analytics";
import { getDictionary } from "@/content";
import { getRepositories } from "@/lib/data";
import type { ListingSubmissionInput, SubmissionMedia } from "@/lib/data/repositories";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { checkRateLimit, isHoneypotTripped } from "@/lib/security/rate-limit";

import { flattenIssues, sellListingSchema } from "./schemas";
import type { FormState } from "./state";

/* ============================================================================
   SOLICITUD DE VENTA (§21, §40)
   ----------------------------------------------------------------------------
   Vive aparte de `actions.ts` porque no es captación: aquel embudo termina
   siempre en un lead, y este termina en una solicitud de publicación, que es
   otra cosa —lleva ficha de vehículo, medios y una cola de moderación—.

   Lo que este formulario NO hace es publicar. Enviarlo crea una solicitud y
   avisa al administrador; el vehículo aparece en el mercado cuando alguien lo
   aprueba. Sin esa separación, un formulario público sin autenticación sería
   una ruta de escritura directa al catálogo.

   Los archivos NO viajan por esta acción. El cuerpo de una Server Action está
   limitado a 1 MB por defecto en Next 16, y una foto de un carro son varios;
   suben directamente al almacenamiento y aquí solo llega el manifiesto de lo
   que quedó subido.
   ========================================================================== */

function readLocale(formData: FormData): Locale {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
}

/** Nunca se guarda la IP en claro: para moderar basta con poder comparar. */
function hashIp(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return createHash("sha256")
    .update(`${value}:${process.env.DCM_UPLOAD_SECRET ?? "dcm"}`)
    .digest("hex")
    .slice(0, 32);
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
 * Manifiesto de medios ya subidos.
 *
 * En esta etapa llega vacío: el almacenamiento todavía no existe y el
 * formulario funciona sin él a propósito, para poder probar validación,
 * estados y copias antes de conectar nada. Cuando llegue, cada ruta se
 * verificará contra el almacenamiento en lugar de creerle al cliente.
 */
function readMediaManifest(formData: FormData): readonly SubmissionMedia[] {
  const raw = formData.get("mediaManifest");
  if (typeof raw !== "string" || !raw.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry): SubmissionMedia[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const item = entry as Record<string, unknown>;
      if (typeof item.path !== "string" || typeof item.bucket !== "string") return [];
      if (item.kind !== "image" && item.kind !== "video") return [];

      return [
        {
          kind: item.kind,
          bucket: item.bucket,
          path: item.path,
          mimeType: typeof item.mimeType === "string" ? item.mimeType : "application/octet-stream",
          bytes: typeof item.bytes === "number" ? item.bytes : 0,
        },
      ];
    });
  } catch {
    return [];
  }
}

export async function submitSellRequest(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = readLocale(formData);
  const dict = getDictionary(locale);

  // Trampa para bots: éxito silencioso, ninguna fila creada, ningún aviso.
  if (isHoneypotTripped(formData)) {
    return { status: "success" };
  }

  const store = await headers();
  const ip = store.get("x-forwarded-for")?.split(",")[0]?.trim() ?? store.get("x-real-ip") ?? undefined;

  const limit = checkRateLimit(`sell:${ip ?? "local"}`, { limit: 3, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return { status: "error", message: dict.errors.rateLimited };
  }

  const parsed = sellListingSchema(dict).safeParse(values(formData));
  if (!parsed.success) {
    return { status: "error", errors: flattenIssues(parsed.error) };
  }

  const data = parsed.data;
  const title = `${data.make} ${data.model}`.trim();

  /**
   * El vendedor escribe en UN idioma. Guardar su texto bajo el locale en que
   * lo escribió y dejar el otro vacío es lo honesto: `localized()` ya cae al
   * idioma disponible, y así nadie ve una traducción que nadie hizo.
   */
  const localizedText = (value: string) => ({ [locale]: value }) as Record<Locale, string>;

  const input: ListingSubmissionInput = {
    locale,
    vertical: "motors",
    categoryId: data.categoryId,
    title: { es: title, en: title },
    summary: localizedText(data.description.slice(0, 180)),
    description: localizedText(data.description),
    listingType: "sale",
    price:
      data.priceMode === "on_request"
        ? { mode: "on_request", currency: data.currency }
        : { mode: "fixed", amount: data.priceAmount, currency: data.currency },
    location: { country: data.country.toUpperCase(), city: data.city },
    attributes: {
      make: data.make,
      model: data.model,
      year: data.year,
      ...(data.mileage !== undefined ? { mileage: data.mileage } : {}),
      fuel: data.fuel,
      transmission: data.transmission,
      condition: data.condition,
    },
    seller: {
      name: data.name,
      email: data.email,
      phone: data.phone,
    },
    media: readMediaManifest(formData),
    trace: { ipHash: hashIp(ip), userAgent: store.get("user-agent") ?? undefined },
  };

  try {
    const { submissions } = getRepositories();

    // Persistir SIEMPRE primero. Si el aviso falla, la solicitud ya existe y
    // se puede recuperar desde el CRM; al revés se perdería.
    const submission = await submissions.create(input);

    track({ name: "lead_created", leadId: submission.id, source: "sell" });

    return { status: "success", reference: submission.reference };
  } catch {
    return { status: "error", message: dict.errors.generic };
  }
}
