import type { Locale } from "@/lib/i18n/config";

import { en } from "./en";
import { es } from "./es";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = { es, en };

/**
 * Los diccionarios son módulos estáticos, no se cargan por red: resolver el
 * idioma es una búsqueda en un objeto y el resultado es serializable hacia
 * los Server Components sin coste.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Interpola `{clave}` dentro de un mensaje del diccionario. */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type { Dictionary } from "./types";
export * from "./shared";
