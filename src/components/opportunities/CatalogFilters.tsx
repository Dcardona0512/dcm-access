import Link from "next/link";

import { Eyebrow } from "@/components/ui/Section";
import type { Dictionary } from "@/content/types";
import type { Facets } from "@/lib/data";
import { listingTypeLabels } from "@/lib/domain/labels";
import { localized, type Category, type Vertical } from "@/lib/domain/types";
import { formatCountry } from "@/lib/format";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/* ============================================================================
   FILTROS DEL CATÁLOGO
   ----------------------------------------------------------------------------
   Formulario GET, igual que el buscador: sin JavaScript, con estado en la URL
   y por tanto compartible, indexable y capaz de sobrevivir a un refresco.

   Las opciones se construyen a partir de las FACETAS calculadas sobre el
   conjunto ya filtrado, así que nunca se ofrece un filtro que devolvería cero
   resultados.
   ========================================================================== */

export type CatalogSearchState = {
  readonly q?: string;
  readonly vertical?: string;
  readonly categoryId?: string;
  readonly country?: string;
  readonly city?: string;
  readonly listingType?: string;
  readonly minPrice?: string;
  readonly maxPrice?: string;
  readonly sort?: string;
};

export function CatalogFilters({
  locale,
  dict,
  facets,
  categories,
  state,
  total,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly facets: Facets;
  readonly categories: readonly Category[];
  readonly state: CatalogSearchState;
  readonly total: number;
}) {
  const action = localizePath("/opportunities", locale);
  const hasFilters = Boolean(
    state.vertical ||
      state.categoryId ||
      state.country ||
      state.city ||
      state.listingType ||
      state.minPrice ||
      state.maxPrice,
  );

  const categoryName = (id: string) =>
    localized(categories.find((category) => category.id === id)?.name, locale) || id;

  return (
    <form
      action={action}
      method="get"
      className="border-line bg-surface-raised/40 flex flex-col gap-6 rounded-(--radius-card) border p-6"
      aria-label={dict.catalog.filters}
    >
      {/* La consulta viaja escondida para que filtrar no borre lo que se buscó. */}
      {state.q ? <input type="hidden" name="q" value={state.q} /> : null}

      <div className="flex items-baseline justify-between gap-4">
        <Eyebrow tone="muted">{dict.catalog.filters}</Eyebrow>
        <span className="text-fg-muted/70 text-xs" data-numeric>
          {total === 1
            ? dict.catalog.resultsOne
            : dict.catalog.resultsMany.replace("{count}", String(total))}
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Select
          name="vertical"
          label={dict.catalog.facets.vertical}
          value={state.vertical}
          anyLabel={dict.catalog.facets.any}
          options={facets.verticals.map((bucket) => ({
            value: bucket.value,
            label: dict.verticals[bucket.value as Vertical]?.eyebrow ?? bucket.value,
            count: bucket.count,
          }))}
        />

        <Select
          name="categoryId"
          label={dict.catalog.facets.category}
          value={state.categoryId}
          anyLabel={dict.catalog.facets.any}
          options={facets.categories.map((bucket) => ({
            value: bucket.value,
            label: categoryName(bucket.value),
            count: bucket.count,
          }))}
        />

        <Select
          name="country"
          label={dict.catalog.facets.country}
          value={state.country}
          anyLabel={dict.catalog.facets.any}
          options={facets.countries.map((bucket) => ({
            value: bucket.value,
            label: formatCountry(bucket.value, locale),
            count: bucket.count,
          }))}
        />

        <Select
          name="city"
          label={dict.catalog.facets.city}
          value={state.city}
          anyLabel={dict.catalog.facets.any}
          options={facets.cities.map((bucket) => ({
            value: bucket.value,
            label: bucket.value,
            count: bucket.count,
          }))}
        />

        <Select
          name="listingType"
          label={dict.catalog.facets.listingType}
          value={state.listingType}
          anyLabel={dict.catalog.facets.any}
          options={facets.listingTypes.map((bucket) => ({
            value: bucket.value,
            label: localized(listingTypeLabels[bucket.value as never], locale) || bucket.value,
            count: bucket.count,
          }))}
        />

        <div className="flex flex-col gap-2">
          <span className="eyebrow text-fg-muted text-[0.5625rem]">
            {dict.catalog.facets.priceRange}
          </span>
          <div className="flex items-center gap-2">
            <NumberInput
              name="minPrice"
              value={state.minPrice}
              placeholder={dict.catalog.facets.minPrice}
              label={`${dict.catalog.facets.priceRange} — ${dict.catalog.facets.minPrice}`}
            />
            <span className="text-line" aria-hidden="true">
              —
            </span>
            <NumberInput
              name="maxPrice"
              value={state.maxPrice}
              placeholder={dict.catalog.facets.maxPrice}
              label={`${dict.catalog.facets.priceRange} — ${dict.catalog.facets.maxPrice}`}
            />
          </div>
        </div>

        <Select
          name="sort"
          label={dict.catalog.sortLabel}
          value={state.sort}
          anyLabel={dict.catalog.sort.relevance}
          options={[
            { value: "newest", label: dict.catalog.sort.newest },
            { value: "price-asc", label: dict.catalog.sort.priceAsc },
            { value: "price-desc", label: dict.catalog.sort.priceDesc },
          ]}
        />
      </div>

      <div className="border-line-soft flex items-center gap-4 border-t pt-5">
        <button
          type="submit"
          className="eyebrow bg-fg text-surface rounded-(--radius-card) px-5 py-2.5 transition-colors hover:opacity-90"
        >
          {dict.catalog.applyFilters}
        </button>

        {hasFilters ? (
          <Link
            href={state.q ? `${action}?q=${encodeURIComponent(state.q)}` : action}
            className="eyebrow text-fg-muted hover:text-fg transition-colors"
          >
            {dict.catalog.clearFilters}
          </Link>
        ) : null}
      </div>
    </form>
  );
}

function Select({
  name,
  label,
  value,
  anyLabel,
  options,
}: {
  readonly name: string;
  readonly label: string;
  readonly value?: string;
  readonly anyLabel: string;
  readonly options: readonly { value: string; label: string; count?: number }[];
}) {
  const id = `filter-${name}`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="eyebrow text-fg-muted text-[0.5625rem]">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={value ?? ""}
        className={cn(
          "border-line text-fg h-10 w-full cursor-pointer appearance-none border bg-transparent px-3 text-sm",
          "rounded-(--radius-card) hover:border-fg-muted/50 transition-colors outline-none",
        )}
      >
        <option value="" className="bg-surface-raised">
          {anyLabel}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-surface-raised">
            {option.label}
            {option.count !== undefined ? ` (${option.count})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberInput({
  name,
  value,
  placeholder,
  label,
}: {
  readonly name: string;
  readonly value?: string;
  readonly placeholder: string;
  readonly label: string;
}) {
  return (
    <input
      type="number"
      name={name}
      inputMode="numeric"
      min={0}
      defaultValue={value ?? ""}
      placeholder={placeholder}
      aria-label={label}
      className="border-line text-fg placeholder:text-fg-muted/50 h-10 w-full rounded-(--radius-card) border bg-transparent px-3 text-sm outline-none"
    />
  );
}
