"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth/admin";
import { can, getDemoUser } from "@/lib/auth/roles";
import { categoriesById } from "@/lib/data/demo/seed/categories";
import { createAdminOpportunities } from "@/lib/data/supabase";
import { createUploadSlots, verifyUploads, type UploadSlot } from "@/lib/media/storage";
import { createAdminClient } from "@/lib/supabase/server";
import {
  currencies,
  isCurrency,
  isVertical,
  type AttributeValue,
  type Currency,
  type ListingType,
} from "@/lib/domain/types";
import { locales } from "@/lib/i18n/config";
import { slugify } from "@/lib/utils";

/* ============================================================================
   PUBLICAR UNA FICHA DESDE EL PANEL
   ----------------------------------------------------------------------------
   Las fotos y los vídeos no pasan por aquí: el navegador los sube directo al
   almacenamiento con una URL firmada, y a esta acción solo llega la lista de
   rutas. Es la única forma de manejar un vídeo de celular, porque el cuerpo de
   una server action está limitado a 1 MB.

   Los atributos —marca y kilometraje en vehículos, habitaciones en
   inmobiliario— no están escritos a mano en ningún sitio: se leen del
   `attributeSchema` de la categoría elegida. Añadir un campo a una categoría
   es cambiar ese esquema, no tocar este archivo.
   ========================================================================== */

const RESERVED_SLUGS = new Set(["sell"]);

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Sin sesión.");

  const user = getDemoUser();
  if (!can(user.role, "create", "opportunities")) {
    throw new Error("Sin permiso para publicar oportunidades.");
  }

  return session;
}

/* --- Paso 1: pedir sitio donde subir --------------------------------------- */

export type SlotRequest = { readonly mimeType: string; readonly bytes: number };

export async function requestUploadSlots(
  listingId: string,
  files: readonly SlotRequest[],
): Promise<{ ok: true; slots: readonly UploadSlot[] } | { ok: false; message: string }> {
  try {
    await requireAdmin();
    const slots = await createUploadSlots(listingId, files);
    return { ok: true, slots };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Error desconocido." };
  }
}

/* --- Paso 2: crear la ficha ------------------------------------------------ */

export type PublishState = {
  readonly status: "idle" | "success" | "error";
  readonly message?: string;
  readonly slug?: string;
  readonly vertical?: string;
};

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function amount(raw: string): number | undefined {
  const parsed = Number(raw.replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/** Slug libre, evitando los segmentos que ya son rutas estáticas. */
async function uniqueSlug(base: string, taken: ReadonlySet<string>): Promise<string> {
  const free = (candidate: string) => !taken.has(candidate) && !RESERVED_SLUGS.has(candidate);
  if (free(base)) return base;

  let n = 2;
  while (!free(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export async function publishListing(
  _previous: PublishState,
  formData: FormData,
): Promise<PublishState> {
  try {
    await requireAdmin();
  } catch {
    return { status: "error", message: "Sesión caducada. Vuelva a entrar." };
  }

  const listingId = text(formData, "listingId");
  const verticalRaw = text(formData, "vertical");
  const categoryId = text(formData, "categoryId");

  if (!listingId || !isVertical(verticalRaw)) {
    return { status: "error", message: "Sección no válida." };
  }

  const category = categoriesById.get(categoryId);
  if (!category || category.vertical !== verticalRaw) {
    return { status: "error", message: "La categoría no corresponde a la sección elegida." };
  }

  const titleEs = text(formData, "title");
  if (titleEs.length < 3) {
    return { status: "error", message: "El título es obligatorio." };
  }

  const summary = text(formData, "summary");
  const description = text(formData, "description");
  const city = text(formData, "city");
  const country = text(formData, "country").toUpperCase() || "CO";

  const priceMode = text(formData, "priceMode") === "on_request" ? "on_request" : "fixed";
  const priceAmount = amount(text(formData, "priceAmount"));
  if (priceMode === "fixed" && priceAmount === undefined) {
    return { status: "error", message: "Indique un precio o marque «a consultar»." };
  }

  const currencyRaw = text(formData, "currency");
  const currency: Currency = isCurrency(currencyRaw) ? currencyRaw : currencies[1];

  const listingTypeRaw = text(formData, "listingType");
  const listingType = (
    ["sale", "rent", "charter", "lease", "service", "opportunity"] as const
  ).includes(listingTypeRaw as ListingType)
    ? (listingTypeRaw as ListingType)
    : "sale";

  /**
   * Los atributos salen del esquema de la categoría, y solo se guardan los que
   * traen valor. Nada de campos escritos a mano por vertical.
   */
  const attributes: Record<string, AttributeValue> = {};
  for (const def of category.attributeSchema) {
    const raw = text(formData, `attr_${def.key}`);
    if (!raw) continue;

    if (def.type === "number") {
      const parsed = Number(raw.replace(/[^\d.-]/g, ""));
      if (Number.isFinite(parsed)) attributes[def.key] = parsed;
    } else if (def.type === "boolean") {
      attributes[def.key] = raw === "on" || raw === "true";
    } else {
      attributes[def.key] = raw;
    }
  }

  // Manifiesto de medios: qué dice el navegador que subió. Se comprueba contra
  // el almacenamiento antes de creer nada.
  let declared: string[] = [];
  try {
    const raw = text(formData, "mediaManifest");
    if (raw) declared = (JSON.parse(raw) as unknown[]).filter((p): p is string => typeof p === "string");
  } catch {
    declared = [];
  }

  try {
    const repo = createAdminOpportunities();
    const media = await verifyUploads(listingId, declared);

    const published = await repo.allPublished();
    const slug = await uniqueSlug(
      slugify(`${titleEs} ${city}`) || listingId,
      new Set(published.map((item) => item.slug)),
    );

    const at = new Date().toISOString();
    const client = createAdminClient();

    const row = {
      id: listingId,
      slug,
      reference: `DCM-${verticalRaw.slice(0, 2).toUpperCase()}-${listingId.slice(-6).toUpperCase()}`,
      vertical: verticalRaw,
      category_id: categoryId,
      // Se guarda en los dos idiomas con el mismo texto: es lo honesto cuando
      // no hay traducción, y `localized()` ya cae al idioma disponible.
      title: { es: titleEs, en: titleEs },
      summary: summary ? { es: summary, en: summary } : {},
      description: description ? { es: description, en: description } : null,
      availability: null,
      status: "published",
      visibility: "public",
      listing_type: listingType,
      price_mode: priceMode,
      price_amount: priceMode === "on_request" ? null : priceAmount,
      price_currency: currency,
      price_period: null,
      country,
      region: null,
      city: city || null,
      city_slug: city ? slugify(city).replace(/-/g, " ").trim() : null,
      area: null,
      attributes,
      provider_id: null,
      verification: "unverified",
      featured: false,
      // Jamás `is_demo`: esto es inventario real y no debe llevar la etiqueta.
      is_demo: false,
      published_at: at,
      updated_at: at,
    };

    const { error: insertError } = await client.from("opportunities").insert(row);
    if (insertError) throw new Error(insertError.message);

    if (media.length > 0) {
      const rows = media.map((item, index) => ({
        opportunity_id: listingId,
        position: index,
        kind: item.mimeType.startsWith("video/") ? "video" : "image",
        bucket: "listing-media",
        path: item.path,
        alt: titleEs,
        mime_type: item.mimeType,
        bytes: item.bytes,
      }));

      const { error: mediaError } = await client.from("opportunity_media").insert(rows);
      if (mediaError) throw new Error(mediaError.message);
    }

    // La parrilla Y la ficha: esta última está prerenderizada, y sin
    // revalidarla el vehículo sale en el listado pero su página da 404.
    revalidatePath("/admin/opportunities");
    for (const locale of locales) {
      revalidatePath(`/${locale}/${verticalRaw}`);
      revalidatePath(`/${locale}/${verticalRaw}/${slug}`);
    }

    return { status: "success", slug, vertical: verticalRaw };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo publicar.",
    };
  }
}
