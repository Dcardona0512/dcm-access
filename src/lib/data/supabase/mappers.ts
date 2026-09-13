import type {
  AttributeValue,
  Currency,
  ListingType,
  Localized,
  MediaItem,
  Opportunity,
  OpportunityStatus,
  Vertical,
  Verification,
  Visibility,
} from "@/lib/domain/types";
import { normalize } from "@/lib/utils";

/* ============================================================================
   TRADUCCIÓN ENTRE FILA Y DOMINIO
   ----------------------------------------------------------------------------
   El resto de la aplicación no sabe que existe Supabase: habla el tipo
   `Opportunity` y nada más. Todo el conocimiento sobre columnas, jsonb y rutas
   de almacenamiento vive aquí dentro.

   `publicUrl` llega inyectado en lugar de construirse aquí para que el mapper
   siga siendo una función pura —comprobable sin red— y para que el día que
   haya fichas privadas servidas con URL firmada sea un parámetro distinto, no
   una reescritura.
   ========================================================================== */

export type OpportunityRow = {
  id: string;
  slug: string;
  reference: string;
  vertical: string;
  category_id: string;
  title: Localized;
  summary: Localized;
  description: Localized | null;
  availability: Localized | null;
  status: string;
  visibility: string;
  listing_type: string;
  price_mode: string;
  price_amount: string | number | null;
  price_currency: string;
  price_period: string | null;
  country: string;
  region: string | null;
  city: string | null;
  area: string | null;
  lat: string | number | null;
  lng: string | number | null;
  sku: string | null;
  attributes: Record<string, AttributeValue>;
  provider_id: string | null;
  verification: string;
  featured: boolean;
  is_demo: boolean;
  published_at: string;
  updated_at: string;
};

export type MediaRow = {
  id: string;
  opportunity_id: string;
  position: number;
  kind: string;
  bucket: string;
  path: string;
  alt: string;
  width: number | null;
  height: number | null;
  duration_s: string | number | null;
  poster_path: string | null;
  mime_type: string;
  bytes: string | number | null;
};

/** `numeric` de Postgres llega como cadena para no perder precisión. */
function num(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function clean<T>(value: T | null | undefined): T | undefined {
  return value === null ? undefined : value;
}

export type PublicUrl = (bucket: string, path: string) => string;

export function rowToOpportunity(
  row: OpportunityRow,
  media: readonly MediaRow[],
  publicUrl: PublicUrl,
): Opportunity {
  const items: MediaItem[] = [...media]
    .sort((a, b) => a.position - b.position)
    .map((item) => ({
      id: item.id,
      kind: item.kind === "video" ? "video" : "image",
      src: publicUrl(item.bucket, item.path),
      alt: item.alt,
      width: clean(item.width),
      height: clean(item.height),
      durationS: num(item.duration_s),
      poster: item.poster_path ? publicUrl(item.bucket, item.poster_path) : undefined,
      tone: "motors",
    }));

  return {
    id: row.id,
    slug: row.slug,
    reference: row.reference,
    vertical: row.vertical as Vertical,
    categoryId: row.category_id,
    title: row.title,
    summary: row.summary,
    description: clean(row.description),
    status: row.status as OpportunityStatus,
    visibility: row.visibility as Visibility,
    listingType: row.listing_type as ListingType,
    price: {
      mode: row.price_mode as Opportunity["price"]["mode"],
      amount: num(row.price_amount),
      currency: row.price_currency as Currency,
      period: clean(row.price_period) as Opportunity["price"]["period"],
    },
    location: {
      country: row.country,
      region: clean(row.region),
      city: clean(row.city),
      lat: num(row.lat),
      lng: num(row.lng),
    },
    // Una ficha sin fotografía conserva un medio sin `src`, que es lo que hace
    // que `EditorialImage` dibuje la placa editorial en vez de un hueco roto.
    media:
      items.length > 0
        ? items
        : [{ id: `${row.id}-placeholder`, kind: "image", alt: "", tone: "motors" }],
    attributes: row.attributes ?? {},
    providerId: clean(row.provider_id),
    verification: row.verification as Verification,
    featured: row.featured,
    availability: clean(row.availability),
    isDemo: row.is_demo,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

/** Lo que se escribe. `city_slug` se calcula aquí para que la búsqueda por
 *  ciudad compare siempre con la misma normalización que usa el núcleo. */
export function opportunityToRow(opportunity: Opportunity): Record<string, unknown> {
  return {
    id: opportunity.id,
    slug: opportunity.slug,
    reference: opportunity.reference,
    vertical: opportunity.vertical,
    category_id: opportunity.categoryId,
    title: opportunity.title,
    summary: opportunity.summary,
    description: opportunity.description ?? null,
    availability: opportunity.availability ?? null,
    status: opportunity.status,
    visibility: opportunity.visibility,
    listing_type: opportunity.listingType,
    price_mode: opportunity.price.mode,
    price_amount: opportunity.price.amount ?? null,
    price_currency: opportunity.price.currency,
    price_period: opportunity.price.period ?? null,
    country: opportunity.location.country,
    region: opportunity.location.region ?? null,
    city: opportunity.location.city ?? null,
    city_slug: opportunity.location.city ? normalize(opportunity.location.city) : null,
    area: opportunity.location.area ?? null,
    lat: opportunity.location.lat ?? null,
    lng: opportunity.location.lng ?? null,
    sku: opportunity.sku ?? null,
    attributes: opportunity.attributes,
    provider_id: opportunity.providerId ?? null,
    verification: opportunity.verification,
    featured: opportunity.featured,
    is_demo: opportunity.isDemo,
    published_at: opportunity.publishedAt,
    updated_at: opportunity.updatedAt,
  };
}
