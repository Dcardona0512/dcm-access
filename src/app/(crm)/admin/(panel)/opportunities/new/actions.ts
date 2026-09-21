"use server";

import { revalidatePath } from "next/cache";

import { can, TEAM_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { categoriesById } from "@/lib/data/demo/seed/categories";
import { createAdminOpportunities } from "@/lib/data/supabase";
import { createUploadSlots, verifyUploads, type UploadSlot } from "@/lib/media/storage";
import { createAdminClient } from "@/lib/supabase/server";
import {
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

/**
 * Sesión con permiso para publicar.
 *
 * Dos capas, y las dos hacen falta: `requireRole` comprueba QUIÉN entra —el
 * layout ya lo hizo, pero una server action es una URL a la que se puede
 * llamar directamente— y `can()` comprueba QUÉ puede hacer ese rol. Un gestor
 * de contenido entra al panel y no publica; el segundo filtro es el que lo
 * distingue.
 */
async function requireAdmin() {
  const session = await requireRole(TEAM_ROLES);

  if (!can(session.role, "create", "opportunities")) {
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

/**
 * El resumen sale de la descripción, no de un campo aparte.
 *
 * Pedir dos textos para lo mismo es pedir que el segundo se quede vacío o
 * repita al primero. Aquí se toma la primera frase —que es lo que alguien
 * escribe primero cuando describe un carro— y se recorta a la longitud que
 * los buscadores muestran sin cortar.
 *
 * Si no hay descripción no se inventa nada: un resumen vacío se nota menos
 * que uno que repite el título palabra por palabra.
 */
function summarize(description: string): string {
  const flat = description.replace(/\s+/g, " ").trim();
  if (!flat) return "";

  const firstSentence = flat.match(/^[^.!?]+[.!?]?/)?.[0]?.trim() ?? flat;
  const candidate = firstSentence.length >= 40 ? firstSentence : flat;

  if (candidate.length <= 160) return candidate;

  // Se corta en un espacio, nunca a mitad de palabra.
  const clipped = candidate.slice(0, 160);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 100 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

/**
 * Referencia de la ficha: solo dígitos.
 *
 * Antes era `DCM-MO-3D-EC7`, que mezclaba marca, sección y un trozo del
 * identificador. Se lee mal por teléfono, no se dicta sin deletrear y no dice
 * nada que la ficha no diga ya. Un número se canta de corrido.
 *
 * Son los segundos transcurridos desde el 1 de enero de 2026, así que crece
 * siempre —una referencia mayor es una ficha más reciente—, no se repite
 * mientras no se publiquen dos en el mismo segundo, y se mantiene en ocho o
 * nueve cifras durante décadas. Recortar los últimos dígitos de la marca de
 * tiempo habría sido más corto y habría empezado a repetirse cada once días.
 */
function nuevaReferencia(): string {
  const ORIGEN = Date.UTC(2026, 0, 1);
  return String(Math.floor((Date.now() - ORIGEN) / 1000));
}

/** Slug libre, evitando los segmentos que ya son rutas estáticas. */
async function uniqueSlug(base: string, taken: ReadonlySet<string>): Promise<string> {
  const free = (candidate: string) => !taken.has(candidate) && !RESERVED_SLUGS.has(candidate);
  if (free(base)) return base;

  let n = 2;
  while (!free(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/* --- Leer el formulario ----------------------------------------------------
   Publicar y editar reciben EXACTAMENTE los mismos campos, así que los leen
   con el mismo código. Tener dos copias sería garantizar que un día el tope
   de etiquetas, el redondeo del precio o la lista de atributos se arreglen en
   una y no en la otra, y que nadie lo note hasta ver una ficha rara.

   Devuelve lo leído, o el primer motivo por el que no se puede seguir.
   ------------------------------------------------------------------------ */

type Leido = {
  readonly listingId: string;
  readonly verticalRaw: string;
  readonly categoryId: string;
  readonly titleEs: string;
  readonly description: string;
  readonly summary: string;
  readonly city: string;
  readonly region: string;
  readonly country: string;
  readonly priceAmount: number;
  readonly currency: Currency;
  readonly listingType: ListingType;
  readonly pricePeriod: "month" | null;
  readonly attributes: Record<string, AttributeValue>;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly sku: string;
  readonly manifest: string[];
};

function leerFormulario(formData: FormData): Leido | { readonly error: string } {
  const listingId = text(formData, "listingId");
  const verticalRaw = text(formData, "vertical");
  const categoryId = text(formData, "categoryId");

  if (!listingId || !isVertical(verticalRaw)) {
    return { error: "Sección no válida." };
  }

  const category = categoriesById.get(categoryId);
  if (!category || category.vertical !== verticalRaw) {
    return { error: "La categoría no corresponde a la sección elegida." };
  }

  const titleEs = text(formData, "title");
  if (titleEs.length < 3) {
    return { error: "El título es obligatorio." };
  }

  // Se normaliza al guardar para que en la base no convivan dos formas del
  // mismo salto según el sistema desde el que se publicó.
  const description = text(formData, "description").replace(/\r\n?/g, "\n");
  const summary = summarize(description);
  const city = text(formData, "city");
  const region = text(formData, "region");
  const country = text(formData, "country").toUpperCase() || "CO";

  // Siempre hay importe. El modo «a consultar» se quitó del formulario: quien
  // publica aquí sabe lo que pide, y una ficha sin precio no es una oferta.
  const priceAmount = amount(text(formData, "priceAmount"));
  if (priceAmount === undefined) {
    return { error: "Indique el precio." };
  }

  const currencyRaw = text(formData, "currency");
  const currency: Currency = isCurrency(currencyRaw) ? currencyRaw : "COP";

  /**
   * La operación solo llega desde inmobiliaria, y solo puede ser una de dos.
   * Cualquier otra cosa —incluido un campo inventado a mano en la petición—
   * cae en venta, que es lo que publica el resto de las secciones.
   */
  const listingType: ListingType =
    verticalRaw === "real-estate" && text(formData, "listingType") === "rent" ? "rent" : "sale";

  // Un arriendo se cobra al mes. Sin esto, un canon de 4.000.000 se leería
  // como el precio de venta del apartamento.
  const pricePeriod = listingType === "rent" ? "month" : null;

  /**
   * Los atributos salen del esquema de la categoría, y solo se guardan los que
   * traen valor. Nada de campos escritos a mano por vertical.
   */
  const attributes: Record<string, AttributeValue> = {};
  for (const def of category.attributeSchema) {
    // Las etiquetas no vienen del esquema: tienen su propio control y su
    // propio campo, así que se saltan aquí y se añaden abajo.
    if (def.key === "tags") continue;

    // Una lista de casillas manda un valor por casilla marcada bajo el mismo
    // nombre, así que hay que leerlas TODAS: `formData.get` devolvería solo la
    // primera y se perderían las demás sin que nada avisara.
    if (def.type === "multi-enum") {
      const marcadas = formData
        .getAll(`attr_${def.key}`)
        .filter((valor): valor is string => typeof valor === "string" && valor.length > 0);

      if (marcadas.length > 0) attributes[def.key] = marcadas;
      continue;
    }

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

  /**
   * Etiquetas: hasta veinte, normalizadas y sin repetir. El tope se comprueba
   * también aquí y no solo en el formulario, porque el formulario es una
   * comodidad y esto es la frontera de confianza.
   */
  const tags = [
    ...new Set(
      text(formData, "tags")
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 20);

  if (tags.length > 0) attributes.tags = tags;

  const coordinate = (key: string): number | null => {
    const raw = text(formData, key);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const lat = coordinate("lat");
  const lng = coordinate("lng");
  const sku = text(formData, "sku");

  // Manifiesto de medios: qué dice el navegador que subió. Se comprueba contra
  // el almacenamiento antes de creer nada.
  let declared: string[] = [];
  try {
    const raw = text(formData, "mediaManifest");
    if (raw) declared = (JSON.parse(raw) as unknown[]).filter((p): p is string => typeof p === "string");
  } catch {
    declared = [];
  }

  return {
    listingId,
    verticalRaw,
    categoryId,
    titleEs,
    description,
    summary,
    city,
    region,
    country,
    priceAmount,
    currency,
    listingType,
    pricePeriod,
    attributes,
    lat,
    lng,
    sku,
    manifest: declared,
  };
}

/* --- Paso 3: editar una ficha ya publicada --------------------------------- */

/**
 * Guardar cambios NO es volver a publicar, y tres campos lo demuestran.
 *
 * El `slug` se queda como está aunque cambie el título: es la URL, y cambiarla
 * rompe todo enlace que alguien haya mandado por WhatsApp. La `reference` es
 * la que el cliente cantó por teléfono. Y `published_at` es cuándo salió al
 * mercado, no cuándo se corrigió una falta de ortografía.
 *
 * Los medios se reescriben enteros con lo que traiga el formulario: es la
 * única forma de que quitar una foto la quite de verdad, y mantiene el orden
 * que se ve en pantalla.
 */
export async function updateListing(
  _previous: PublishState,
  formData: FormData,
): Promise<PublishState> {
  try {
    await requireAdmin();
  } catch {
    return { status: "error", message: "Sesión caducada. Vuelva a entrar." };
  }

  const datos = leerFormulario(formData);
  if ("error" in datos) return { status: "error", message: datos.error };

  const listingId = text(formData, "listingId");
  if (!listingId) return { status: "error", message: "Falta la ficha que se edita." };

  try {
    const client = createAdminClient();

    // Se relee la ficha en lugar de fiarse de lo que mande el formulario: el
    // slug y la vertical deciden qué páginas hay que refrescar, y llegan del
    // navegador, donde se pueden cambiar.
    const { data: actual, error: errorLectura } = await client
      .from("opportunities")
      .select("slug, vertical, is_demo")
      .eq("id", listingId)
      .maybeSingle();

    if (errorLectura) throw new Error(errorLectura.message);
    if (!actual) return { status: "error", message: "Esa ficha ya no existe." };
    if (actual.is_demo) {
      return { status: "error", message: "Las fichas de demostración no se editan." };
    }

    const media = await verifyUploads(listingId, datos.manifest);

    const { error: errorUpdate } = await client
      .from("opportunities")
      .update({
        category_id: datos.categoryId,
        title: { es: datos.titleEs, en: datos.titleEs },
        summary: datos.summary ? { es: datos.summary, en: datos.summary } : {},
        description: datos.description
          ? { es: datos.description, en: datos.description }
          : null,
        listing_type: datos.listingType,
        price_mode: "fixed",
        price_amount: datos.priceAmount,
        price_period: datos.pricePeriod,
        price_currency: datos.currency,
        country: datos.country,
        region: datos.region || null,
        city: datos.city || null,
        city_slug: datos.city ? slugify(datos.city).replace(/-/g, " ").trim() : null,
        lat: datos.lat,
        lng: datos.lng,
        sku: datos.sku || null,
        attributes: datos.attributes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    if (errorUpdate) throw new Error(errorUpdate.message);

    // Fuera los medios viejos y dentro los actuales, en su orden. Borrar
    // primero es lo que hace que quitar una foto tenga efecto.
    const { error: errorBorrado } = await client
      .from("opportunity_media")
      .delete()
      .eq("opportunity_id", listingId);
    if (errorBorrado) throw new Error(errorBorrado.message);

    if (media.length > 0) {
      const rows = media.map((item, index) => ({
        opportunity_id: listingId,
        position: index,
        kind: item.mimeType.startsWith("video/") ? "video" : "image",
        bucket: "listing-media",
        path: item.path,
        alt: datos.titleEs,
        mime_type: item.mimeType,
        bytes: item.bytes,
      }));

      const { error: errorMedia } = await client.from("opportunity_media").insert(rows);
      if (errorMedia) throw new Error(errorMedia.message);
    }

    revalidatePath("/admin/opportunities");
    revalidatePath("/admin/catalog");
    for (const locale of locales) {
      revalidatePath(`/${locale}/${actual.vertical}`);
      revalidatePath(`/${locale}/${actual.vertical}/${actual.slug}`);
    }

    return { status: "success", slug: actual.slug, vertical: actual.vertical };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo guardar.",
    };
  }
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

  const datos = leerFormulario(formData);
  if ("error" in datos) return { status: "error", message: datos.error };

  const {
    listingId,
    verticalRaw,
    titleEs,
    description,
    summary,
    city,
    region,
    country,
    priceAmount,
    currency,
    listingType,
    pricePeriod,
    attributes,
    lat,
    lng,
    sku,
    categoryId,
    manifest: declared,
  } = datos;

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
      reference: nuevaReferencia(),
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
      price_mode: "fixed",
      price_amount: priceAmount,
      price_period: pricePeriod,
      price_currency: currency,
      country,
      region: region || null,
      city: city || null,
      // El punto exacto se guarda; la ficha pública solo muestra la ciudad.
      lat,
      lng,
      sku: sku || null,
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
