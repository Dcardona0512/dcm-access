import type { CommissionPlan } from "@/lib/commerce/commissions";
import type {
  Category,
  Deal,
  DealStage,
  Lead,
  LeadEvent,
  LeadStatus,
  Opportunity,
  Provider,
  Visibility,
} from "@/lib/domain/types";
import { parseQuery, type SearchIntent } from "@/lib/search/parse";
import { normalize, slugify } from "@/lib/utils";

import type {
  Facets,
  LeadInput,
  OpportunityQuery,
  Page,
  ProviderApplicationInput,
  Repositories,
} from "../repositories";
import { categories, categoriesById } from "./seed/categories";
import { opportunities } from "./seed/opportunities";
import { commissionPlans, commissionPlansById, deals, leads } from "./seed/pipeline";
import { providers } from "./seed/providers";

/* ============================================================================
   ADAPTADOR DE DEMOSTRACIÓN
   ----------------------------------------------------------------------------
   Implementa el contrato completo sobre memoria. Los leads y las postulaciones
   que se crean en tiempo de ejecución viven en estos arrays: se pierden al
   reiniciar el proceso, que es exactamente lo que debe pasar con datos de
   prueba, y es también el recordatorio de que aquí falta conectar Supabase.
   ========================================================================== */

const runtimeLeads: Lead[] = [...leads];
const runtimeProviders: Provider[] = [...providers];
const runtimeDeals: Deal[] = [...deals];

let leadCounter = leads.length;
let providerCounter = providers.length;

/* --- Coincidencia textual ---------------------------------------------------- */

/** Aplana todos los idiomas de un texto multilingüe para poder buscar en él. */
function flatten(value: Record<string, string | undefined> | undefined): string {
  if (!value) return "";
  return Object.values(value).filter(Boolean).join(" ");
}

type Haystack = {
  /** Texto completo, para coincidencias por subcadena (ciudades de dos palabras). */
  readonly text: string;
  /**
   * Palabras exactas. Los términos se comparan contra este conjunto y no con
   * `includes`, para que "privado" no case dentro de "privados" ni "auto"
   * dentro de "automático".
   */
  readonly words: ReadonlySet<string>;
};

/**
 * Despluralización mínima para español e inglés.
 *
 * No es un lematizador y no pretende serlo: solo cubre el caso que aparece
 * constantemente en este catálogo, donde las categorías van en plural
 * ("Fincas y haciendas") y la gente busca en singular ("finca"). Sin esto,
 * buscar "finca" no encontraba ninguna finca.
 */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function haystackFor(opportunity: Opportunity, category: Category | undefined): Haystack {
  const attributeText = Object.values(opportunity.attributes)
    .map((value) => (Array.isArray(value) ? value.join(" ") : String(value ?? "")))
    .join(" ");

  const text = normalize(
    [
      flatten(opportunity.title),
      flatten(opportunity.summary),
      flatten(opportunity.description),
      flatten(category?.name),
      opportunity.reference,
      opportunity.location.city ?? "",
      opportunity.location.region ?? "",
      opportunity.location.country,
      attributeText,
    ].join(" "),
  );

  const words = new Set<string>();
  for (const word of text.split(/[^a-z0-9]+/)) {
    if (!word) continue;
    words.add(word);
    words.add(stem(word));
  }

  return { text, words };
}

type Relevance = {
  /** Puntuación total, para ordenar. */
  readonly points: number;
  /**
   * Si la oportunidad merece aparecer siquiera.
   *
   * La distinción importa: coincidir en país o estar destacada sube en la
   * lista, pero no justifica salir en ella. Sin esta separación, "Vuelo
   * privado Medellín Miami" devolvería toda la oferta colombiana —maquinaria
   * incluida— porque todo comparte país, y §15 pide exactamente lo contrario:
   * una selección corta que transmita exclusividad.
   */
  readonly relevant: boolean;
};

function score(opportunity: Opportunity, intent: SearchIntent, haystack: Haystack): Relevance {
  let points = 0;

  const verticalHit = Boolean(intent.vertical) && opportunity.vertical === intent.vertical;
  if (verticalHit) points += 40;

  if (intent.listingType && opportunity.listingType === intent.listingType) points += 15;

  let cityHit = false;
  if (intent.city) {
    const city = normalize(intent.city);
    if (normalize(opportunity.location.city ?? "") === city) {
      points += 25;
      cityHit = true;
    } else if (haystack.text.includes(city)) {
      points += 10;
      cityHit = true;
    }
  }

  let destinationHit = false;
  if (intent.destination && haystack.text.includes(normalize(intent.destination))) {
    points += 8;
    destinationHit = true;
  }

  // Señales de refuerzo: ordenan, no seleccionan.
  if (intent.country && opportunity.location.country === intent.country) points += 6;
  if (opportunity.featured) points += 3;

  let termHit = false;
  for (const term of intent.terms) {
    if (!haystack.words.has(term) && !haystack.words.has(stem(term))) continue;
    points += 6;
    termHit = true;
  }

  /**
   * Cuando el texto identifica una vertical, esa vertical manda: pedir "vuelo
   * privado" y recibir un apartamento porque está en la misma ciudad no es un
   * resultado, es ruido. Sin vertical reconocida, basta con la ubicación o con
   * cualquier término.
   */
  const relevant = intent.vertical
    ? verticalHit || termHit
    : cityHit || destinationHit || termHit;

  return { points, relevant };
}

/* --- Filtrado ----------------------------------------------------------------- */

const DEFAULT_VISIBILITY: readonly Visibility[] = ["public"];

function matchesFilters(opportunity: Opportunity, query: OpportunityQuery): boolean {
  const visibility = query.visibility ?? DEFAULT_VISIBILITY;

  if (opportunity.status !== "published") return false;
  if (!visibility.includes(opportunity.visibility)) return false;
  if (query.vertical && opportunity.vertical !== query.vertical) return false;
  if (query.categoryId && opportunity.categoryId !== query.categoryId) return false;
  if (query.providerId && opportunity.providerId !== query.providerId) return false;
  if (query.listingType && opportunity.listingType !== query.listingType) return false;
  if (query.featured !== undefined && opportunity.featured !== query.featured) return false;
  if (query.country && opportunity.location.country !== query.country) return false;

  if (query.city && normalize(opportunity.location.city ?? "") !== normalize(query.city)) {
    return false;
  }

  if (query.currency && opportunity.price.currency !== query.currency) return false;

  // Un precio "a consultar" nunca se descarta por rango: descartarlo escondería
  // justo las oportunidades de mayor valor, que son las que no publican cifra.
  if (opportunity.price.amount !== undefined) {
    if (query.minPrice !== undefined && opportunity.price.amount < query.minPrice) return false;
    if (query.maxPrice !== undefined && opportunity.price.amount > query.maxPrice) return false;
  }

  if (query.attributes) {
    for (const [key, expected] of Object.entries(query.attributes)) {
      if (!expected) continue;
      const actual = opportunity.attributes[key];
      const matches = Array.isArray(actual)
        ? actual.map(String).includes(expected)
        : String(actual ?? "") === expected;
      if (!matches) return false;
    }
  }

  return true;
}

/* --- Facetas ------------------------------------------------------------------- */

function countBy<T>(items: readonly T[], pick: (item: T) => string | undefined) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = pick(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function buildFacets(items: readonly Opportunity[]): Facets {
  return {
    verticals: countBy(items, (item) => item.vertical),
    categories: countBy(items, (item) => item.categoryId),
    countries: countBy(items, (item) => item.location.country),
    cities: countBy(items, (item) => item.location.city),
    listingTypes: countBy(items, (item) => item.listingType),
  };
}

/* --- Ordenación ------------------------------------------------------------------ */

/** Sin precio no hay orden por precio: esos registros van al final, no arriba. */
function priceOf(opportunity: Opportunity): number | null {
  return opportunity.price.amount ?? null;
}

function sortItems(
  items: Opportunity[],
  sort: OpportunityQuery["sort"],
  scores: Map<string, number>,
): Opportunity[] {
  const byDate = (a: Opportunity, b: Opportunity) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

  switch (sort) {
    case "newest":
      return items.sort(byDate);

    case "price-asc":
    case "price-desc": {
      const direction = sort === "price-asc" ? 1 : -1;
      return items.sort((a, b) => {
        const pa = priceOf(a);
        const pb = priceOf(b);
        if (pa === null && pb === null) return byDate(a, b);
        if (pa === null) return 1;
        if (pb === null) return -1;
        return (pa - pb) * direction;
      });
    }

    default:
      return items.sort((a, b) => {
        const diff = (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0);
        if (diff !== 0) return diff;
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return byDate(a, b);
      });
  }
}

/* --- Utilidades ------------------------------------------------------------------- */

function nextReference(prefix: string, counter: number): string {
  return `DCM-${prefix}-${String(8800 + counter).padStart(4, "0")}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/* --- Repositorios ------------------------------------------------------------------ */

export function createDemoRepositories(): Repositories {
  return {
    categories: {
      async list() {
        return categories;
      },
      async byVertical(vertical) {
        return categories.filter((category) => category.vertical === vertical);
      },
      async byId(id) {
        return categoriesById.get(id) ?? null;
      },
      async bySlug(slug) {
        return categories.find((category) => category.slug === slug) ?? null;
      },
    },

    opportunities: {
      async search(query): Promise<Page<Opportunity>> {
        const intent = query.q ? parseQuery(query.q) : null;

        /**
         * La intención completa los filtros que el usuario no marcó a mano,
         * pero nunca pisa una elección explícita suya.
         *
         * La vertical inferida se deja FUERA a propósito: es una conjetura y
         * debe influir en el orden, no excluir resultados. "Vehículo de
         * seguridad" contiene léxico de dos verticales a la vez —"vehículo" es
         * de Motors y "seguridad" de Private Services— y filtrar por la que
         * gane el desempate escondería justo la camioneta blindada que se está
         * buscando. La vertical solo filtra cuando llega del selector.
         *
         * La ubicación sí filtra: "en Miami" es una restricción explícita del
         * usuario, no una deducción del léxico.
         */
        const effective: OpportunityQuery = {
          ...query,
          country: query.country ?? intent?.country,
          maxPrice: query.maxPrice ?? intent?.maxPrice,
        };

        const filtered = opportunities.filter((item) => matchesFilters(item, effective));

        const scores = new Map<string, number>();
        let matched = filtered;

        if (intent && intent.raw.length > 0) {
          const scored = filtered.map((item) => {
            const category = categoriesById.get(item.categoryId);
            const relevance = score(item, intent, haystackFor(item, category));
            scores.set(item.id, relevance.points);
            return { item, ...relevance };
          });

          // Si nada resulta relevante se devuelve todo lo filtrado en lugar de
          // una lista vacía: el catálogo completo es más útil que un callejón
          // sin salida, y el estado vacío ya empuja a la búsqueda privada.
          const relevant = scored.filter((entry) => entry.relevant);
          matched = relevant.length > 0 ? relevant.map((entry) => entry.item) : filtered;
        }

        const sorted = sortItems([...matched], effective.sort, scores);
        const offset = effective.offset ?? 0;
        const limit = effective.limit ?? sorted.length;

        return {
          items: sorted.slice(offset, offset + limit),
          total: sorted.length,
          facets: buildFacets(matched),
        };
      },

      async bySlug(slug) {
        return opportunities.find((item) => item.slug === slug) ?? null;
      },

      async byId(id) {
        return opportunities.find((item) => item.id === id) ?? null;
      },

      async related(opportunity, limit = 3) {
        return opportunities
          .filter(
            (item) =>
              item.id !== opportunity.id &&
              item.status === "published" &&
              item.visibility === "public" &&
              item.vertical === opportunity.vertical,
          )
          .slice(0, limit);
      },

      async allPublished() {
        return opportunities.filter(
          (item) => item.status === "published" && item.visibility === "public",
        );
      },
    },

    providers: {
      async listApproved() {
        return runtimeProviders.filter((provider) => provider.status === "approved");
      },
      async listAll() {
        return runtimeProviders;
      },
      async bySlug(slug) {
        return runtimeProviders.find((provider) => provider.slug === slug) ?? null;
      },
      async byId(id) {
        return runtimeProviders.find((provider) => provider.id === id) ?? null;
      },

      async createApplication(input: ProviderApplicationInput) {
        providerCounter += 1;

        const provider: Provider = {
          id: `prv-app-${providerCounter}`,
          slug: slugify(input.name) || `partner-${providerCounter}`,
          name: input.name,
          description: { es: input.description, en: input.description },
          verticals: input.verticals,
          locations: [{ country: input.country, city: input.city }],
          services: input.services.map((service) => ({ es: service, en: service })),
          gallery: [],
          website: input.website,
          email: input.email,
          phone: input.phone,
          verification: "unverified",
          certifications: input.certifications.map((name) => ({ name, verified: false })),
          operatingAreas: input.operatingAreas,
          // Nunca `approved`: la curaduría es manual y es parte del producto (§18).
          status: "applied",
          isDemo: true,
          appliedAt: nowIso(),
        };

        runtimeProviders.unshift(provider);
        return provider;
      },

      async updateStatus(id, status) {
        const index = runtimeProviders.findIndex((provider) => provider.id === id);
        if (index === -1) return null;

        const updated: Provider = {
          ...runtimeProviders[index],
          status,
          approvedAt: status === "approved" ? nowIso() : runtimeProviders[index].approvedAt,
        };

        runtimeProviders[index] = updated;
        return updated;
      },
    },

    leads: {
      async create(input: LeadInput) {
        leadCounter += 1;
        const at = nowIso();

        const lead: Lead = {
          id: `lead-${String(leadCounter).padStart(4, "0")}`,
          reference: nextReference("LD", leadCounter),
          source: input.source,
          status: "new",
          locale: input.locale,
          contact: input.contact,
          vertical: input.vertical,
          opportunityId: input.opportunityId,
          providerId: input.providerId,
          message: input.message,
          budget: input.budget,
          location: input.location,
          timeline: input.timeline,
          confidentiality: input.confidentiality ?? "standard",
          timeline_events: [{ at, status: "new" }],
          isDemo: true,
          createdAt: at,
        };

        runtimeLeads.unshift(lead);
        return lead;
      },

      async list(filter) {
        const all = [...runtimeLeads].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return filter?.status ? all.filter((lead) => lead.status === filter.status) : all;
      },

      async byId(id) {
        return runtimeLeads.find((lead) => lead.id === id) ?? null;
      },

      async updateStatus(id: string, status: LeadStatus, note?: string) {
        const index = runtimeLeads.findIndex((lead) => lead.id === id);
        if (index === -1) return null;

        const event: LeadEvent = { at: nowIso(), status, note };
        const updated: Lead = {
          ...runtimeLeads[index],
          status,
          timeline_events: [...runtimeLeads[index].timeline_events, event],
        };

        runtimeLeads[index] = updated;
        return updated;
      },
    },

    deals: {
      async list() {
        return runtimeDeals;
      },
      async byId(id) {
        return runtimeDeals.find((deal) => deal.id === id) ?? null;
      },
      async updateStage(id: string, stage: DealStage) {
        const index = runtimeDeals.findIndex((deal) => deal.id === id);
        if (index === -1) return null;

        const updated: Deal = {
          ...runtimeDeals[index],
          stage,
          outcome: stage === "close" ? "won" : runtimeDeals[index].outcome,
          updatedAt: nowIso(),
        };

        runtimeDeals[index] = updated;
        return updated;
      },
    },

    commissions: {
      async listPlans(): Promise<readonly CommissionPlan[]> {
        return commissionPlans;
      },
      async planById(id) {
        return commissionPlansById.get(id) ?? null;
      },
    },
  };
}
