import { defaultLocale, type Locale, locales } from "@/lib/i18n/config";

/* ============================================================================
   DCM ACCESS — MODELO DE DOMINIO
   ----------------------------------------------------------------------------
   Una sola entidad `Opportunity` sirve a las cinco verticales. Lo que cambia
   entre un apartamento, un helicóptero y una línea de maquinaria no es la
   forma del registro, sino sus atributos: por eso `attributes` es un mapa
   libre validado contra el `attributeSchema` de su categoría.

   Consecuencia deliberada: añadir una vertical, una subcategoría o un campo
   nuevo no toca este archivo, no toca la UI y no migra nada. Solo se declara
   una categoría más en el catálogo de categorías (§2, §3).
   ========================================================================== */

/* --- Texto multilingüe ---------------------------------------------------- */

/**
 * Parcial a propósito: el contenido que cargan los proveedores rara vez llega
 * traducido a todo. `localized()` resuelve la cascada.
 */
export type Localized = Readonly<Partial<Record<Locale, string>>>;

/** Resuelve un texto multilingüe: idioma pedido → idioma por defecto → lo que haya. */
export function localized(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return (
    value[locale] ??
    value[defaultLocale] ??
    locales.map((l) => value[l]).find(Boolean) ??
    ""
  );
}

/* --- Verticales y taxonomía ----------------------------------------------- */

export const verticals = [
  "real-estate",
  "motors",
  "aviation",
  "private-services",
  "business",
] as const;

export type Vertical = (typeof verticals)[number];

export function isVertical(value: string | undefined | null): value is Vertical {
  return value != null && (verticals as readonly string[]).includes(value);
}

export type AttributeType = "text" | "number" | "boolean" | "enum" | "multi-enum" | "date";

export type AttributeOption = {
  readonly value: string;
  readonly label: Localized;
};

/**
 * Definición de un atributo dentro de una categoría. Es lo que permite que el
 * catálogo genere sus propias facetas sin que nadie escriba un filtro a mano:
 * `facet: true` basta para que el campo aparezca como filtro.
 */
export type AttributeDef = {
  readonly key: string;
  readonly type: AttributeType;
  readonly label: Localized;
  /** Sufijo de unidad: m², km, hp, pax, h. */
  readonly unit?: string;
  /**
   * Separador de miles. Se desactiva en años y en cualquier número que sea
   * un identificador y no una cantidad: "2024", nunca "2.024".
   */
  readonly grouping?: boolean;
  readonly options?: readonly AttributeOption[];
  /** Aparece como filtro en el catálogo. */
  readonly facet?: boolean;
  /** Aparece en la tarjeta y en la cabecera de la ficha. */
  readonly highlight?: boolean;
  /** Agrupa atributos en la tabla de especificaciones. */
  readonly group?: Localized;
};

export type AttributeValue = string | number | boolean | readonly string[] | null;

export type Category = {
  readonly id: string;
  readonly vertical: Vertical;
  readonly slug: string;
  readonly name: Localized;
  readonly parentId?: string;
  readonly attributeSchema: readonly AttributeDef[];
};

/* --- Dinero, lugar y medios ----------------------------------------------- */

export const currencies = ["COP", "USD", "EUR", "GBP", "AED"] as const;
export type Currency = (typeof currencies)[number];

export function isCurrency(value: string | undefined | null): value is Currency {
  return value != null && (currencies as readonly string[]).includes(value);
}

/** Periodicidad de un precio recurrente (alquiler, charter, leasing). */
export type PricePeriod = "hour" | "day" | "week" | "month" | "year" | "flight";

export type Price = {
  /** `on_request` es de primera clase: en este mercado es la norma, no un vacío. */
  readonly mode: "fixed" | "from" | "on_request";
  readonly amount?: number;
  readonly currency: Currency;
  readonly period?: PricePeriod;
};

export type Location = {
  /** ISO 3166-1 alpha-2. */
  readonly country: string;
  readonly region?: string;
  readonly city?: string;
  readonly area?: string;
};

/** Familia visual del placeholder cuando todavía no hay fotografía real. */
export type MediaTone = "architecture" | "motors" | "aviation" | "services" | "business";

export type MediaItem = {
  readonly id: string;
  readonly kind: "image" | "video";
  /** Ruta bajo `/public/media`. Si falta, se renderiza el placeholder editorial. */
  readonly src?: string;
  /** Obligatorio, nunca opcional: sin alt no hay accesibilidad ni SEO (§27, §39). */
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
  readonly tone?: MediaTone;
};

/* --- Oportunidad ----------------------------------------------------------- */

export type OpportunityStatus = "draft" | "in_review" | "published" | "reserved" | "closed";

/**
 * `private` alimenta DCM ACCESS PRIVATE (§16): existe, se insinúa, pero sus
 * datos no se sirven al público hasta que hay una solicitud.
 */
export type Visibility = "public" | "members" | "private";

export type ListingType = "sale" | "rent" | "charter" | "lease" | "service" | "opportunity";

export type Verification = "unverified" | "documents_pending" | "verified";

export type Opportunity = {
  readonly id: string;
  readonly slug: string;
  readonly reference: string;
  readonly vertical: Vertical;
  readonly categoryId: string;
  readonly title: Localized;
  readonly summary: Localized;
  readonly description?: Localized;
  readonly status: OpportunityStatus;
  readonly visibility: Visibility;
  readonly listingType: ListingType;
  readonly price: Price;
  readonly location: Location;
  readonly media: readonly MediaItem[];
  readonly attributes: Readonly<Record<string, AttributeValue>>;
  readonly providerId?: string;
  readonly verification: Verification;
  readonly featured: boolean;
  readonly availability?: Localized;
  /** Marca de dato de demostración. Nunca se muestra sin su etiqueta (§48). */
  readonly isDemo: boolean;
  readonly publishedAt: string;
  readonly updatedAt: string;
};

/* --- Proveedores ----------------------------------------------------------- */

export type ProviderStatus = "applied" | "in_review" | "approved" | "suspended" | "rejected";

export type Provider = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly logo?: MediaItem;
  readonly description: Localized;
  readonly verticals: readonly Vertical[];
  readonly locations: readonly Location[];
  readonly services: readonly Localized[];
  readonly gallery: readonly MediaItem[];
  readonly website?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly verification: Verification;
  /**
   * Acreditaciones declaradas por el proveedor. `verified` distingue lo que
   * DCM ACCESS ha comprobado de lo que simplemente le han dicho (§26).
   */
  readonly certifications: readonly {
    readonly name: string;
    readonly authority?: string;
    readonly verified: boolean;
  }[];
  readonly operatingAreas: readonly string[];
  readonly status: ProviderStatus;
  readonly isDemo: boolean;
  readonly appliedAt: string;
  readonly approvedAt?: string;
};

/* --- Leads (§23) ----------------------------------------------------------- */

export const leadSources = [
  "inquiry",
  "private_request",
  "contact",
  "partner_application",
  "broker_contact",
  "quote_request",
] as const;

export type LeadSource = (typeof leadSources)[number];

export const leadStatuses = [
  "new",
  "qualified",
  "contacted",
  "negotiation",
  "closed",
  "commission",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export type ConfidentialityLevel = "standard" | "discreet" | "strictly_private";

export type LeadEvent = {
  readonly at: string;
  readonly status: LeadStatus;
  readonly note?: string;
  readonly actor?: string;
};

export type Lead = {
  readonly id: string;
  readonly reference: string;
  readonly source: LeadSource;
  readonly status: LeadStatus;
  readonly locale: Locale;
  readonly contact: {
    readonly name: string;
    readonly email: string;
    readonly phone?: string;
    readonly preferredChannel?: "email" | "phone" | "whatsapp";
  };
  readonly vertical?: Vertical;
  readonly opportunityId?: string;
  readonly providerId?: string;
  readonly message?: string;
  readonly budget?: { readonly amount?: number; readonly currency: Currency };
  readonly location?: Location;
  readonly timeline?: string;
  readonly confidentiality: ConfidentialityLevel;
  readonly timeline_events: readonly LeadEvent[];
  readonly isDemo: boolean;
  readonly createdAt: string;
};

/* --- Operaciones (§5) ------------------------------------------------------ */

/** Las seis etapas del modelo de brokerage, en orden. */
export const dealStages = [
  "request",
  "source",
  "verify",
  "connect",
  "negotiate",
  "close",
] as const;

export type DealStage = (typeof dealStages)[number];

export type DealOutcome = "open" | "won" | "lost";

export type Deal = {
  readonly id: string;
  readonly reference: string;
  readonly leadId: string;
  readonly opportunityId?: string;
  readonly providerId?: string;
  readonly vertical: Vertical;
  readonly stage: DealStage;
  readonly outcome: DealOutcome;
  /** Valor bruto de la operación, base de cálculo de la comisión. */
  readonly value: number;
  readonly currency: Currency;
  readonly commissionPlanId: string;
  /** Meses de duración, para revenue share y suscripciones. */
  readonly termMonths?: number;
  readonly leadCount?: number;
  readonly ownerId?: string;
  readonly isDemo: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/* --- Roles (§22) ----------------------------------------------------------- */

export const roles = [
  "super_admin",
  "broker",
  "sales",
  "content_manager",
  "provider",
  "customer",
] as const;

export type Role = (typeof roles)[number];

export type User = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly providerId?: string;
  readonly isDemo: boolean;
};
