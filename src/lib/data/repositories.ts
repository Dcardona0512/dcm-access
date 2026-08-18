import type { CommissionPlan } from "@/lib/commerce/commissions";
import type {
  Category,
  ConfidentialityLevel,
  Currency,
  Deal,
  DealStage,
  Lead,
  LeadSource,
  LeadStatus,
  ListingType,
  Location,
  Opportunity,
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

export type Repositories = {
  readonly categories: CategoryRepository;
  readonly opportunities: OpportunityRepository;
  readonly providers: ProviderRepository;
  readonly leads: LeadRepository;
  readonly deals: DealRepository;
  readonly commissions: CommissionRepository;
};
