import { normalize } from "@/lib/utils";

/**
 * Lugares de referencia (§25).
 *
 * No son datos de demostración: es el vocabulario geográfico que el buscador
 * usa para reconocer "en Miami" o "Medellín Miami" dentro de una frase libre.
 * Crece a medida que la red entra en mercados nuevos.
 */

export type KnownLocation = {
  readonly city: string;
  readonly country: string;
  readonly region?: string;
  /** Variantes con las que un usuario puede escribirlo. */
  readonly aliases: readonly string[];
};

export const knownLocations: readonly KnownLocation[] = [
  { city: "Medellín", country: "CO", region: "Antioquia", aliases: ["medellin", "mde"] },
  { city: "Bogotá", country: "CO", region: "Cundinamarca", aliases: ["bogota", "bog"] },
  { city: "Cartagena", country: "CO", region: "Bolívar", aliases: ["cartagena", "ctg"] },
  { city: "Cali", country: "CO", region: "Valle del Cauca", aliases: ["cali"] },
  { city: "Barranquilla", country: "CO", region: "Atlántico", aliases: ["barranquilla"] },
  { city: "Santa Marta", country: "CO", region: "Magdalena", aliases: ["santa marta"] },
  { city: "Rionegro", country: "CO", region: "Antioquia", aliases: ["rionegro"] },
  { city: "Miami", country: "US", region: "Florida", aliases: ["miami", "mia"] },
  { city: "New York", country: "US", region: "New York", aliases: ["new york", "nueva york", "nyc"] },
  { city: "Madrid", country: "ES", region: "Comunidad de Madrid", aliases: ["madrid"] },
  { city: "Barcelona", country: "ES", region: "Cataluña", aliases: ["barcelona"] },
  { city: "London", country: "GB", aliases: ["london", "londres"] },
  { city: "Dubai", country: "AE", aliases: ["dubai", "dubái"] },
  { city: "Panamá", country: "PA", aliases: ["panama", "panama city", "ciudad de panama"] },
  { city: "Ciudad de México", country: "MX", aliases: ["ciudad de mexico", "cdmx", "mexico city"] },
  { city: "São Paulo", country: "BR", aliases: ["sao paulo"] },
];

/** Países en los que la red declara actividad o interés. */
export const knownCountries: readonly { code: string; aliases: readonly string[] }[] = [
  { code: "CO", aliases: ["colombia"] },
  { code: "US", aliases: ["estados unidos", "united states", "usa", "eeuu"] },
  { code: "ES", aliases: ["espana", "spain"] },
  { code: "GB", aliases: ["reino unido", "united kingdom", "uk"] },
  { code: "AE", aliases: ["emiratos", "uae", "emirates"] },
  { code: "PA", aliases: ["panama"] },
  { code: "MX", aliases: ["mexico"] },
  { code: "BR", aliases: ["brasil", "brazil"] },
];

/** Busca todas las ciudades mencionadas en un texto libre, en orden de aparición. */
export function findLocations(text: string): readonly KnownLocation[] {
  const haystack = normalize(text);
  const found: { location: KnownLocation; at: number }[] = [];

  for (const location of knownLocations) {
    const at = location.aliases
      .map((alias) => haystack.indexOf(alias))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)[0];

    if (at !== undefined) found.push({ location, at });
  }

  return found.sort((a, b) => a.at - b.at).map((entry) => entry.location);
}

export function findCountry(text: string): string | undefined {
  const haystack = normalize(text);
  return knownCountries.find((country) =>
    country.aliases.some((alias) => haystack.includes(alias)),
  )?.code;
}
