import type { Category, Opportunity, Visibility } from "@/lib/domain/types";
import { parseQuery, type SearchIntent } from "@/lib/search/parse";
import { normalize } from "@/lib/utils";

import type { Facets, FacetBucket, OpportunityQuery, Page } from "./repositories";

/* ============================================================================
   NÚCLEO DE BÚSQUEDA
   ----------------------------------------------------------------------------
   Filtrado, relevancia, orden y facetas, sobre un conjunto de oportunidades ya
   traído a memoria. Vive aparte del adaptador de demostración porque el
   adaptador de Supabase necesita exactamente lo mismo: SQL resuelve bien las
   igualdades y los rangos indexados, pero la relevancia textual y los
   recuentos de faceta —que deben contar el conjunto SIN paginar— se calculan
   aquí. Compartir el núcleo es lo que garantiza que las dos fuentes de datos
   respondan igual, y no "parecido".
   ========================================================================== */

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
export function stem(word: string): string {
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

export function haystackFor(opportunity: Opportunity, category: Category | undefined): Haystack {
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

export function score(
  opportunity: Opportunity,
  intent: SearchIntent,
  haystack: Haystack,
): Relevance {
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
  const relevant = intent.vertical ? verticalHit || termHit : cityHit || destinationHit || termHit;

  return { points, relevant };
}

/* --- Filtrado ----------------------------------------------------------------- */

const DEFAULT_VISIBILITY: readonly Visibility[] = ["public"];

/** Lee un atributo como número, o `null` si no lo es. */
function numericAttribute(opportunity: Opportunity, key: string): number | null {
  const raw = opportunity.attributes[key];
  if (raw === null || raw === undefined || raw === "") return null;
  const numeric = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

export function matchesFilters(opportunity: Opportunity, query: OpportunityQuery): boolean {
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

  if (query.attributeRanges) {
    for (const [key, range] of Object.entries(query.attributeRanges)) {
      if (!range || (range.min === undefined && range.max === undefined)) continue;

      // Misma regla que el precio a consultar: un atributo sin cifra no se
      // descarta. Un clásico sin kilometraje declarado debe seguir apareciendo
      // en "hasta 50.000 km", porque nadie ha dicho que tenga más.
      const value = numericAttribute(opportunity, key);
      if (value === null) continue;

      if (range.min !== undefined && value < range.min) return false;
      if (range.max !== undefined && value > range.max) return false;
    }
  }

  return true;
}

/* --- Facetas ------------------------------------------------------------------- */

function countBy<T>(items: readonly T[], pick: (item: T) => string | undefined): FacetBucket[] {
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

/**
 * Recuentos por atributo facetable.
 *
 * Las claves salen del esquema de categoría —`facet: true`—, no de una lista
 * escrita a mano aquí: marcar un atributo como faceta debe bastar para que
 * aparezca como filtro, sin tocar este archivo.
 */
function attributeFacets(
  items: readonly Opportunity[],
  categoriesById: ReadonlyMap<string, Category>,
): Record<string, readonly FacetBucket[]> {
  const keys = new Set<string>();

  for (const item of items) {
    const category = categoriesById.get(item.categoryId);
    if (!category) continue;
    for (const def of category.attributeSchema) {
      if (def.facet) keys.add(def.key);
    }
  }

  const result: Record<string, readonly FacetBucket[]> = {};

  for (const key of keys) {
    const buckets = countBy(items, (item) => {
      const value = item.attributes[key];
      if (value === null || value === undefined || value === "") return undefined;
      return Array.isArray(value) ? undefined : String(value);
    });
    if (buckets.length > 0) result[key] = buckets;
  }

  return result;
}

export function buildFacets(
  items: readonly Opportunity[],
  categoriesById?: ReadonlyMap<string, Category>,
): Facets {
  return {
    verticals: countBy(items, (item) => item.vertical),
    categories: countBy(items, (item) => item.categoryId),
    countries: countBy(items, (item) => item.location.country),
    cities: countBy(items, (item) => item.location.city),
    listingTypes: countBy(items, (item) => item.listingType),
    attributes: categoriesById ? attributeFacets(items, categoriesById) : undefined,
  };
}

/* --- Ordenación ------------------------------------------------------------------ */

/** Sin precio no hay orden por precio: esos registros van al final, no arriba. */
function priceOf(opportunity: Opportunity): number | null {
  return opportunity.price.amount ?? null;
}

export function sortItems(
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

/* --- Búsqueda completa ------------------------------------------------------------ */

/**
 * Filtra, puntúa, ordena, pagina y cuenta facetas sobre un conjunto en memoria.
 *
 * Los dos adaptadores entran por aquí. La diferencia entre ellos es solo QUÉ
 * conjunto le pasan: el de demostración pasa la semilla entera; el de Supabase
 * pasa lo que ya ha recortado la base de datos con los filtros que SQL indexa
 * bien. El resultado es idéntico.
 */
export function searchIn(
  source: readonly Opportunity[],
  query: OpportunityQuery,
  categoriesById: ReadonlyMap<string, Category>,
): Page<Opportunity> {
  const intent = query.q ? parseQuery(query.q) : null;

  /**
   * La intención completa los filtros que el usuario no marcó a mano, pero
   * nunca pisa una elección explícita suya.
   *
   * La vertical inferida se deja FUERA a propósito: es una conjetura y debe
   * influir en el orden, no excluir resultados. "Vehículo de seguridad"
   * contiene léxico de dos verticales a la vez —"vehículo" es de Motors y
   * "seguridad" de Private Services— y filtrar por la que gane el desempate
   * escondería justo la camioneta blindada que se está buscando. La vertical
   * solo filtra cuando llega del selector.
   *
   * La ubicación sí filtra: "en Miami" es una restricción explícita del
   * usuario, no una deducción del léxico.
   */
  const effective: OpportunityQuery = {
    ...query,
    country: query.country ?? intent?.country,
    maxPrice: query.maxPrice ?? intent?.maxPrice,
  };

  const filtered = source.filter((item) => matchesFilters(item, effective));

  const scores = new Map<string, number>();
  let matched = filtered;

  if (intent && intent.raw.length > 0) {
    const scored = filtered.map((item) => {
      const category = categoriesById.get(item.categoryId);
      const relevance = score(item, intent, haystackFor(item, category));
      scores.set(item.id, relevance.points);
      return { item, ...relevance };
    });

    // Si nada resulta relevante se devuelve todo lo filtrado en lugar de una
    // lista vacía: el catálogo completo es más útil que un callejón sin
    // salida, y el estado vacío ya empuja a la búsqueda privada.
    const relevant = scored.filter((entry) => entry.relevant);
    matched = relevant.length > 0 ? relevant.map((entry) => entry.item) : filtered;
  }

  const sorted = sortItems([...matched], effective.sort, scores);
  const offset = effective.offset ?? 0;
  const limit = effective.limit ?? sorted.length;

  return {
    items: sorted.slice(offset, offset + limit),
    total: sorted.length,
    facets: buildFacets(matched, categoriesById),
  };
}
