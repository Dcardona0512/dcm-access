import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

import {
  localized,
  type AttributeDef,
  type AttributeValue,
  type Category,
  type Opportunity,
} from "./types";

/* ============================================================================
   PRESENTACIÓN DE ATRIBUTOS
   ----------------------------------------------------------------------------
   Traduce el par (esquema de categoría, valores de la oportunidad) en algo
   mostrable. Como el esquema manda, una categoría nueva se pinta sola: ni la
   tarjeta ni la ficha saben qué es una habitación o un nivel de blindaje.
   ========================================================================== */

export type DisplayAttribute = {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly group?: string;
};

function formatValue(
  def: AttributeDef,
  value: AttributeValue,
  locale: Locale,
  labels: { yes: string; no: string },
): string | null {
  if (value === null || value === undefined || value === "") return null;

  switch (def.type) {
    case "boolean":
      return value ? labels.yes : labels.no;

    case "number": {
      const numeric = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numeric)) return null;

      const rendered =
        def.grouping === false ? String(numeric) : formatNumber(numeric, locale);
      return def.unit ? `${rendered} ${def.unit}` : rendered;
    }

    case "enum": {
      const option = def.options?.find((candidate) => candidate.value === value);
      return option ? localized(option.label, locale) : String(value);
    }

    case "multi-enum": {
      const values = Array.isArray(value) ? value : [String(value)];
      const rendered = values.map((entry) => {
        const option = def.options?.find((candidate) => candidate.value === entry);
        return option ? localized(option.label, locale) : entry;
      });
      return rendered.join(" · ");
    }

    default:
      return String(value);
  }
}

export function displayAttributes(
  opportunity: Opportunity,
  category: Category | undefined,
  locale: Locale,
  labels: { yes: string; no: string },
  options: { readonly onlyHighlights?: boolean; readonly limit?: number } = {},
): readonly DisplayAttribute[] {
  if (!category) return [];

  const defs = options.onlyHighlights
    ? category.attributeSchema.filter((def) => def.highlight)
    : category.attributeSchema;

  const result: DisplayAttribute[] = [];

  for (const def of defs) {
    const value = formatValue(def, opportunity.attributes[def.key], locale, labels);
    if (value === null) continue;

    result.push({
      key: def.key,
      label: localized(def.label, locale),
      value,
      group: def.group ? localized(def.group, locale) : undefined,
    });

    if (options.limit && result.length >= options.limit) break;
  }

  return result;
}

/** Agrupa los atributos por su `group` para la tabla de especificaciones. */
export function groupAttributes(
  attributes: readonly DisplayAttribute[],
): readonly { readonly group: string; readonly items: readonly DisplayAttribute[] }[] {
  const groups = new Map<string, DisplayAttribute[]>();

  for (const attribute of attributes) {
    const key = attribute.group ?? "";
    const bucket = groups.get(key);
    if (bucket) bucket.push(attribute);
    else groups.set(key, [attribute]);
  }

  return [...groups.entries()].map(([group, items]) => ({ group, items }));
}

/** Atributos marcados como faceta, para construir los filtros del catálogo. */
export function facetableAttributes(
  categories: readonly Category[],
  locale: Locale,
): readonly { readonly def: AttributeDef; readonly label: string }[] {
  const seen = new Set<string>();
  const result: { def: AttributeDef; label: string }[] = [];

  for (const category of categories) {
    for (const def of category.attributeSchema) {
      if (!def.facet || seen.has(def.key)) continue;
      seen.add(def.key);
      result.push({ def, label: localized(def.label, locale) });
    }
  }

  return result;
}
