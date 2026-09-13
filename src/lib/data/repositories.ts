import type { CommissionPlan } from "@/lib/commerce/commissions";
import type {
  AttributeValue,
  Category,
  ConfidentialityLevel,
  Currency,
  Deal,
  DealStage,
  Lead,
  LeadSource,
  LeadStatus,
  ListingType,
  Localized,
  Location,
  Opportunity,
  Price,
  Provider,
  Vertical,
  Visibility,
} from "@/lib/domain/types";
import type { Locale } from "@/lib/i18n/config";

/* ============================================================================
   CONTRATO DE PERSISTENCIA (§38, §48)
   ----------------------------------------------------------------------------
   Las páginas nunca importan un adaptador concreto: importan `getRepositories()`
   y hablan con estas interfaces. Hoy detrás hay memoria y datos semilla; mañana
   habrá Supabase. Cambiar de una a otra es cambiar `DCM_DATA_SOURCE`, no
   reescribir el sitio.
   ========================================================================== */

export type SortOrder = "relevance" | "newest" | "price-asc" | "price-desc";

export type OpportunityQuery = {
  readonly q?: string;
  readonly vertical?: Vertical;
  readonly categoryId?: string;
  readonly country?: string;
  readonly city?: string;
  readonly listingType?: ListingType;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly currency?: Currency;
  /** Por defecto solo `public`. Private Access pide explícitamente `private`. */
  readonly visibility?: readonly Visibility[];
  readonly featured?: boolean;
  readonly providerId?: string;
  /** Filtros por atributos de categoría: `{ bedrooms: "3" }`. */
  readonly attributes?: Readonly<Record<string, string>>;
  /**
   * Rangos numéricos sobre atributos: `{ year: { min: 2015 }, mileage: { max: 50000 } }`.
   *
   * Vive aparte de `attributes` porque aquel es un mapa de igualdades y un
   * rango no se puede expresar con una cadena. Un atributo sin valor numérico
   * no se descarta por rango, igual que un precio "a consultar".
   */
  readonly attributeRanges?: Readonly<
    Record<string, { readonly min?: number; readonly max?: number }>
  >;
  readonly sort?: SortOrder;
  readonly limit?: number;
  readonly offset?: number;
};

export type FacetBucket = {
  readonly value: string;
  readonly count: number;
};

/** Recuentos calculados sobre el conjunto filtrado, para pintar los filtros. */
export type Facets = {
  readonly verticals: readonly FacetBucket[];
  readonly categories: readonly FacetBucket[];
  readonly countries: readonly FacetBucket[];
  readonly cities: readonly FacetBucket[];
  readonly listingTypes: readonly FacetBucket[];
  /**
   * Recuentos por atributo marcado `facet: true` en su `AttributeDef`:
   * `{ make: [{value:"Porsche", count:1}], fuel: [...] }`.
   *
   * Opcional para no romper a quien ya construye un `Facets`. Añadir un filtro
   * nuevo pasa a ser un cambio de datos —marcar `facet: true`— y no de código.
   */
  readonly attributes?: Readonly<Record<string, readonly FacetBucket[]>>;
};

export type Page<T> = {
  readonly items: readonly T[];
  readonly total: number;
  readonly facets: Facets;
};

export interface CategoryRepository {
  list(): Promise<readonly Category[]>;
  byVertical(vertical: Vertical): Promise<readonly Category[]>;
  byId(id: string): Promise<Category | null>;
  bySlug(slug: string): Promise<Category | null>;
}

export interface OpportunityRepository {
  search(query: OpportunityQuery): Promise<Page<Opportunity>>;
  bySlug(slug: string): Promise<Opportunity | null>;
  byId(id: string): Promise<Opportunity | null>;
  /** Misma vertical, distinta ficha. Alimenta "oportunidades relacionadas". */
  related(opportunity: Opportunity, limit?: number): Promise<readonly Opportunity[]>;
  /** Todo lo publicado y público. Solo para sitemap y feeds. */
  allPublished(): Promise<readonly Opportunity[]>;
  /**
   * ¿Queda algún registro de demostración visible en el catálogo público?
   *
   * El aviso de demo no puede seguir siendo pura configuración en cuanto un
   * vehículo real conviva con la semilla: se equivocaría en los dos sentidos.
   * Opcional para que un adaptador que aún no lo sepa responder no rompa.
   */
  hasDemoPublished?(): Promise<boolean>;
}

export interface ProviderRepository {
  listApproved(): Promise<readonly Provider[]>;
  listAll(): Promise<readonly Provider[]>;
  bySlug(slug: string): Promise<Provider | null>;
  byId(id: string): Promise<Provider | null>;
  createApplication(input: ProviderApplicationInput): Promise<Provider>;
  updateStatus(id: string, status: Provider["status"]): Promise<Provider | null>;
}

export type ProviderApplicationInput = {
  readonly name: string;
  readonly country: string;
  readonly city?: string;
  readonly verticals: readonly Vertical[];
  readonly services: readonly string[];
  readonly website?: string;
  readonly email: string;
  readonly phone?: string;
  readonly description: string;
  readonly operatingAreas: readonly string[];
  readonly commercialInfo?: string;
  readonly certifications: readonly string[];
  readonly licences?: string;
  readonly documentation?: string;
};

export type LeadInput = {
  readonly source: LeadSource;
  readonly locale: Locale;
  readonly contact: Lead["contact"];
  readonly vertical?: Vertical;
  readonly opportunityId?: string;
  readonly providerId?: string;
  readonly message?: string;
  readonly budget?: { readonly amount?: number; readonly currency: Currency };
  readonly location?: Location;
  readonly timeline?: string;
  readonly confidentiality?: ConfidentialityLevel;
};

export interface LeadRepository {
  create(input: LeadInput): Promise<Lead>;
  list(filter?: { readonly status?: LeadStatus }): Promise<readonly Lead[]>;
  byId(id: string): Promise<Lead | null>;
  updateStatus(id: string, status: LeadStatus, note?: string): Promise<Lead | null>;
}

export interface DealRepository {
  list(): Promise<readonly Deal[]>;
  byId(id: string): Promise<Deal | null>;
  updateStage(id: string, stage: DealStage): Promise<Deal | null>;
}

export interface CommissionRepository {
  listPlans(): Promise<readonly CommissionPlan[]>;
  planById(id: string): Promise<CommissionPlan | null>;
}

/* --- Solicitudes de publicación -----------------------------------------------
   Quien quiere vender no publica: solicita. La solicitud vive en su PROPIA
   tabla, nunca como una oportunidad en borrador, por tres razones:

     · `opportunities` se queda sin ninguna ruta de escritura alcanzable desde
       fuera. Una política mal puesta no puede convertirse en un anuncio vivo.
     · Los datos del vendedor son PII y no tienen por qué tocar la tabla del
       catálogo, que es pública por diseño.
     · Aprobar deja de ser "cambiar un estado" y pasa a ser una copia curada,
       que es exactamente lo que hace un intermediario.
   ---------------------------------------------------------------------------- */

export type SubmissionStatus = "received" | "in_review" | "approved" | "rejected";

export type SubmissionMedia = {
  readonly kind: "image" | "video";
  readonly bucket: string;
  readonly path: string;
  readonly mimeType: string;
  readonly bytes: number;
  readonly width?: number;
  readonly height?: number;
  readonly durationS?: number;
};

export type ListingSubmissionInput = {
  readonly locale: Locale;
  readonly vertical: Vertical;
  readonly categoryId: string;
  readonly title: Localized;
  readonly summary: Localized;
  readonly description?: Localized;
  readonly listingType: ListingType;
  readonly price: Price;
  readonly location: Location;
  readonly attributes: Readonly<Record<string, AttributeValue>>;
  readonly seller: {
    readonly name: string;
    readonly email: string;
    readonly phone?: string;
    readonly note?: string;
  };
  readonly media: readonly SubmissionMedia[];
  /** Trazas para moderación. La IP va HASHEADA, nunca en claro. */
  readonly trace?: { readonly ipHash?: string; readonly userAgent?: string };
};

export type ListingSubmission = ListingSubmissionInput & {
  readonly id: string;
  readonly reference: string;
  readonly status: SubmissionStatus;
  /** Cuándo se avisó al administrador. Sin esto, un correo perdido es invisible. */
  readonly notifiedAt?: string;
  readonly notifyError?: string;
  readonly publishedOpportunityId?: string;
  readonly createdAt: string;
};

export interface SubmissionRepository {
  create(input: ListingSubmissionInput): Promise<ListingSubmission>;
  list(filter?: { readonly status?: SubmissionStatus }): Promise<readonly ListingSubmission[]>;
  byId(id: string): Promise<ListingSubmission | null>;
  markNotified(id: string, error?: string): Promise<void>;
  /** Único camino hacia una ficha publicada. Exige permiso de `create` sobre oportunidades. */
  approve(id: string): Promise<Opportunity>;
  reject(id: string): Promise<ListingSubmission | null>;
}

export type Repositories = {
  readonly categories: CategoryRepository;
  readonly opportunities: OpportunityRepository;
  readonly providers: ProviderRepository;
  readonly leads: LeadRepository;
  readonly deals: DealRepository;
  readonly commissions: CommissionRepository;
  readonly submissions: SubmissionRepository;
};
