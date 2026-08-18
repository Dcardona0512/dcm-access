import type { Vertical } from "@/lib/domain/types";

import type { NavKey, RegionKey } from "./types";

/**
 * Invariantes de marca (§1, §30, §47).
 *
 * Aquí solo queda lo que NO depende del idioma: el nombre propio y la
 * estructura de rutas. Todas las etiquetas visibles —eslogan, descriptor,
 * navegación, regiones— viven en los diccionarios, para que el español se lea
 * íntegramente en español y el inglés íntegramente en inglés.
 */

export const brand = {
  /** Nombre propio. No se traduce en ningún idioma. */
  name: "DCM ACCESS",
  /** Iniciales del fundador: David Cardona Martínez. */
  initials: "DCM",
} as const;

/**
 * Datos de contacto.
 *
 * El correo es REAL y oficial desde ahora. La variable de entorno se conserva
 * para poder apuntar a otra dirección en previsualizaciones o en un dominio
 * propio el día que exista, sin recompilar: el valor de aquí es el que rige
 * mientras no se defina.
 *
 * El teléfono sigue siendo un marcador de posición vacío — se muestra solo si
 * tiene contenido, así que no aparece nada inventado.
 */
export const contact = {
  email: process.env.NEXT_PUBLIC_DCM_EMAIL ?? "dcmxaccess@gmail.com",
  phone: process.env.NEXT_PUBLIC_DCM_PHONE ?? "",
  baseCity: "Medellín",
  baseCountry: "CO",
} as const;

/** Ruta de cada destino. La etiqueta la pone `dict.navLabels[key]`. */
export const navHrefs: Record<NavKey, string> = {
  opportunities: "/opportunities",
  "real-estate": "/real-estate",
  motors: "/motors",
  aviation: "/aviation",
  "private-services": "/private-services",
  business: "/business",
  private: "/private",
  brokerage: "/brokerage",
  partners: "/partners",
  about: "/about",
  contact: "/contact",
};

/** Las cinco verticales, en el orden en que se presentan siempre (§14). */
export const verticalNav: readonly { readonly key: NavKey; readonly vertical: Vertical }[] = [
  { key: "real-estate", vertical: "real-estate" },
  { key: "motors", vertical: "motors" },
  { key: "aviation", vertical: "aviation" },
  { key: "private-services", vertical: "private-services" },
  { key: "business", vertical: "business" },
];

/** Destinos de la barra principal, además del desplegable de categorías (§30). */
export const primaryNavKeys: readonly NavKey[] = ["private", "brokerage", "partners", "about"];

/** Destino del CTA destacado único (§30, §42). Su texto es `dict.common.requestAccess`. */
export const primaryCtaHref = "/private/request";

/** Regiones de la red (§35). Su nombre lo pone `dict.regions[key]`. */
export const regionKeys: readonly RegionKey[] = [
  "latam",
  "north-america",
  "europe",
  "middle-east",
  "other",
];

export const legalSlugs = ["terms", "privacy", "cookies", "disclaimer", "partner-policy"] as const;

export type LegalSlug = (typeof legalSlugs)[number];
