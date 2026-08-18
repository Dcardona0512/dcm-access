import { findCountry, findLocations, type KnownLocation } from "@/lib/data/locations";
import type { ListingType, Vertical } from "@/lib/domain/types";
import { normalize } from "@/lib/utils";

/* ============================================================================
   INTERPRETACIÓN DE LA BÚSQUEDA (§13)
   ----------------------------------------------------------------------------
   El buscador "no debe sentirse como un buscador tradicional de clasificados".
   La diferencia práctica: aquí se escribe una frase, no se rellena un
   formulario. "Vuelo privado Medellín Miami" tiene que entenderse como
   vertical=aviation, origen=Medellín, destino=Miami — no como cinco palabras
   sueltas contra un índice de texto.

   `parseQuery` traduce lenguaje natural a intención estructurada. Es una
   función pura y sin dependencias, así que se puede probar aparte y se puede
   sustituir más adelante por un índice real o un modelo, sin tocar la UI.
   ========================================================================== */

type Lexicon = Readonly<Record<Vertical, readonly string[]>>;

/** Léxico bilingüe. Ampliarlo es la forma barata de afinar el buscador. */
const verticalLexicon: Lexicon = {
  "real-estate": [
    "apartamento", "apartamentos", "apartment", "apto", "penthouse", "casa", "casas", "house",
    "finca", "fincas", "hacienda", "estate", "farm", "lote", "lotes", "terreno", "terrenos",
    "land", "plot", "propiedad", "propiedades", "property", "inmueble", "inmuebles", "oficina",
    "oficinas", "office", "local", "bodega", "warehouse", "villa", "arriendo", "arrendamiento",
    "inmobiliaria", "real estate",
  ],
  motors: [
    "carro", "carros", "car", "cars", "auto", "autos", "vehiculo", "vehiculos", "vehicle",
    "camioneta", "camionetas", "suv", "moto", "motos", "motorcycle", "blindada", "blindado",
    "blindaje", "armoured", "armored", "clasico", "clasicos", "classic", "mercedes", "porsche",
    "toyota", "land cruiser", "bmw", "audi", "ferrari", "lamborghini", "range rover", "g63",
    "pickup", "flota", "fleet",
  ],
  aviation: [
    "avion", "aviones", "aircraft", "plane", "jet", "jets", "helicoptero", "helicopteros",
    "helicopter", "charter", "vuelo", "vuelos", "flight", "flights", "aeronave", "aeronaves",
    "aviacion", "aviation", "turbohelice", "turboprop", "hangar",
  ],
  "private-services": [
    "conductor", "conductores", "driver", "drivers", "chofer", "transporte", "transport",
    "concierge", "escolta", "escoltas", "guardaespaldas", "bodyguard", "seguridad", "security",
    "proteccion", "protection", "logistica", "logistics", "servicio", "servicios", "service",
    "services", "niñera", "asistente",
  ],
  business: [
    "maquinaria", "machinery", "equipo", "equipos", "equipment", "negocio", "negocios",
    "business", "empresa", "empresas", "company", "participacion", "stake", "alianza",
    "alianzas", "partnership", "activo", "activos", "asset", "assets", "proveedor",
    "proveedores", "supplier", "b2b", "inversion", "investment", "excavadora", "planta",
  ],
};

const listingLexicon: Readonly<Record<ListingType, readonly string[]>> = {
  sale: ["venta", "vender", "comprar", "compra", "sale", "buy", "for sale"],
  rent: ["alquiler", "alquilar", "arriendo", "arrendar", "renta", "rent", "rental", "for rent"],
  charter: ["charter", "vuelo privado", "private flight", "fletamento"],
  lease: ["leasing", "lease", "renting"],
  service: ["servicio", "service", "contratar", "hire"],
  opportunity: ["oportunidad", "opportunity", "sociedad", "participacion"],
};

export type SearchIntent = {
  /** Consulta original, tal cual la escribió el usuario. */
  readonly raw: string;
  readonly vertical?: Vertical;
  readonly listingType?: ListingType;
  readonly country?: string;
  readonly city?: string;
  /** Segunda ciudad detectada: en aviación es el destino. */
  readonly destination?: string;
  readonly maxPrice?: number;
  /** Palabras restantes, para el emparejamiento textual. */
  readonly terms: readonly string[];
};

/**
 * Palabras vacías.
 *
 * Además de las gramaticales, se descarta el vocabulario de marca: en un
 * catálogo donde TODO es privado, premium y exclusivo, esas palabras no
 * distinguen nada. Dejarlas dentro hacía que "vuelo privado" arrastrara un
 * penthouse por tener "terraza privada" en su descripción.
 */
const STOP_WORDS = new Set([
  // Gramaticales
  "de", "del", "la", "el", "los", "las", "un", "una", "en", "para", "con", "por", "y", "o",
  "a", "al", "the", "of", "in", "for", "with", "and", "or", "to", "at", "on",
  // Verbos de búsqueda
  "busco", "buscando", "quiero", "necesito", "looking", "need", "want", "search", "find",
  // Léxico de marca, sin poder discriminante aquí
  "privado", "privada", "privados", "privadas", "private", "premium", "exclusivo",
  "exclusiva", "exclusive", "lujo", "luxury", "alto", "valor",
]);

function matchLexicon<T extends string>(
  haystack: string,
  lexicon: Readonly<Record<T, readonly string[]>>,
): T | undefined {
  let best: { key: T; length: number } | undefined;

  for (const [key, words] of Object.entries(lexicon) as [T, readonly string[]][]) {
    for (const word of words) {
      // Coincidencia por palabra completa, para que "auto" no case en "automático".
      const hit = new RegExp(`(^|\\s)${escapeRegExp(word)}(\\s|$)`).test(haystack);
      if (!hit) continue;

      // Gana el término más largo: "vuelo privado" pesa más que "vuelo".
      if (!best || word.length > best.length) best = { key, length: word.length };
    }
  }

  return best?.key;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Detecta un techo de presupuesto escrito en lenguaje natural. */
function parseMaxPrice(haystack: string): number | undefined {
  const match = haystack.match(
    /(?:hasta|max(?:imo)?|under|below|up to)\s*\$?\s*([\d.,]+)\s*(k|m|mil|millones|million)?/,
  );
  if (!match) return undefined;

  const digits = Number(match[1].replace(/[.,]/g, ""));
  if (!Number.isFinite(digits) || digits === 0) return undefined;

  const scale = match[2];
  if (scale === "k" || scale === "mil") return digits * 1_000;
  if (scale === "m" || scale === "millones" || scale === "million") return digits * 1_000_000;
  return digits;
}

export function parseQuery(raw: string): SearchIntent {
  const trimmed = raw.trim();
  const haystack = normalize(trimmed);

  const vertical = matchLexicon(haystack, verticalLexicon);
  const listingType = matchLexicon(haystack, listingLexicon);
  const locations = findLocations(trimmed);
  const country = findCountry(trimmed) ?? locations[0]?.country;

  const terms = haystack
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .filter((word) => !isLocationWord(word, locations));

  return {
    raw: trimmed,
    vertical,
    listingType,
    country,
    city: locations[0]?.city,
    destination: locations[1]?.city,
    maxPrice: parseMaxPrice(haystack),
    terms,
  };
}

function isLocationWord(word: string, locations: readonly KnownLocation[]): boolean {
  return locations.some((location) =>
    location.aliases.some((alias) => alias.split(/\s+/).includes(word)),
  );
}
