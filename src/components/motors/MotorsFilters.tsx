import Link from "next/link";

import { Eyebrow } from "@/components/ui/Section";
import type { Dictionary } from "@/content/types";
import type { Facets } from "@/lib/data";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/* ============================================================================
   FILTROS DEL MERCADO DE VEHÍCULOS
   ----------------------------------------------------------------------------
   Formulario GET nativo dentro de un `<details>`, igual que el resto del sitio:
   el estado vive en la URL, se puede compartir, sobrevive a un refresco, lo
   indexa un buscador y —lo que importa de verdad— funciona con JavaScript
   desactivado, porque nada de esto se hidrata.

   Las marcas y las ciudades salen de las FACETAS calculadas sobre el conjunto
   ya filtrado, así que nunca se ofrece un filtro que devolvería cero. El año,
   el precio y el kilometraje son rangos y van como campos numéricos: el
   recuento no ayuda cuando cada valor es distinto.
   ========================================================================== */

export type MotorsFilterState = {
  /** Texto libre. Lo interpreta `parseQuery`, que entiende marca y ciudad. */
  readonly q?: string;
  readonly make?: string;
  readonly city?: string;
  readonly yearMin?: string;
  readonly yearMax?: string;
  readonly minPrice?: string;
  readonly maxPrice?: string;
  readonly kmMax?: string;
};

export function MotorsFilters({
  locale,
  dict,
  facets,
  state,
  total,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly facets: Facets;
  readonly state: MotorsFilterState;
  readonly total: number;
}) {
  const action = localizePath("/motors", locale);
  const copy = dict.motorsMarket.filters;

  const hasFilters = Object.values(state).some(Boolean);
  const makes = facets.attributes?.make ?? [];

  return (
    <details
      id="buscar"
      open={hasFilters}
      className="border-line bg-surface-raised/40 group rounded-(--radius-card) border"
    >
      {/*
        `<details>` es un desplegable nativo: accesible por teclado, anunciado
        por los lectores de pantalla y sin una línea de JavaScript. Abierto por
        defecto cuando ya hay filtros puestos, para que nadie pierda de vista
        por qué está viendo tres carros en lugar de veinte.
      */}
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 [&::-webkit-details-marker]:hidden">
        <Eyebrow tone="muted">{copy.legend}</Eyebrow>
        <span className="flex items-center gap-4">
          <span className="text-fg-muted/70 text-xs" data-numeric>
            {total === 1
              ? dict.catalog.resultsOne
              : dict.catalog.resultsMany.replace("{count}", String(total))}
          </span>
          <Chevron />
        </span>
      </summary>

      <form
        action={action}
        method="get"
        aria-label={copy.legend}
        className="border-line-soft flex flex-col gap-6 border-t px-6 pt-6 pb-6"
      >
        {/*
          Texto libre por delante de los desplegables: es como busca la gente
          —"porsche madrid"— y el analizador de consultas ya sabe reconocer
          marca, ciudad y tipo dentro de una frase suelta.
        */}
        <div className="flex flex-col gap-2">
          <label htmlFor="filter-q" className="eyebrow text-fg-muted text-[0.8rem]">
            {copy.queryLabel}
          </label>
          <input
            id="filter-q"
            type="search"
            name="q"
            defaultValue={state.q ?? ""}
            placeholder={copy.queryPlaceholder}
            className="border-line text-fg placeholder:text-fg-muted/50 h-11 w-full rounded-(--radius-card) border bg-transparent px-3 text-sm outline-none"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            name="make"
            label={copy.make}
            value={state.make}
            anyLabel={dict.catalog.facets.any}
            options={makes.map((bucket) => ({
              value: bucket.value,
              label: bucket.value,
              count: bucket.count,
            }))}
          />

          <Select
            name="city"
            label={copy.city}
            value={state.city}
            anyLabel={dict.catalog.facets.any}
            options={facets.cities.map((bucket) => ({
              value: bucket.value,
              label: bucket.value,
              count: bucket.count,
            }))}
          />

          <Range
            legend={dict.catalog.facets.priceRange}
            from={{ name: "minPrice", value: state.minPrice, placeholder: copy.priceFrom }}
            to={{ name: "maxPrice", value: state.maxPrice, placeholder: copy.priceTo }}
          />

          <Range
            legend={copy.year}
            from={{ name: "yearMin", value: state.yearMin, placeholder: copy.yearFrom }}
            to={{ name: "yearMax", value: state.yearMax, placeholder: copy.yearTo }}
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="filter-kmMax" className="eyebrow text-fg-muted text-[0.8rem]">
              {copy.kmMax}
            </label>
            <NumberInput
              id="filter-kmMax"
              name="kmMax"
              value={state.kmMax}
              placeholder={copy.kmMax}
              label={copy.kmMax}
            />
          </div>
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
              href={`${action}#buscar`}
              className="eyebrow text-fg-muted hover:text-fg transition-colors"
            >
              {dict.catalog.clearFilters}
            </Link>
          ) : null}
        </div>
      </form>
    </details>
  );
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="text-fg-muted h-3 w-3 transition-transform duration-(--duration-base) group-open:rotate-180"
    >
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
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
      <label htmlFor={id} className="eyebrow text-fg-muted text-[0.8rem]">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={value ?? ""}
        className={cn(
          "border-line text-fg h-10 w-full cursor-pointer appearance-none border bg-transparent px-3 text-sm",
          "hover:border-fg-muted/50 rounded-(--radius-card) transition-colors outline-none",
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

function Range({
  legend,
  from,
  to,
}: {
  readonly legend: string;
  readonly from: { name: string; value?: string; placeholder: string };
  readonly to: { name: string; value?: string; placeholder: string };
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="eyebrow text-fg-muted text-[0.8rem]">{legend}</span>
      <div className="flex items-center gap-2">
        <NumberInput
          name={from.name}
          value={from.value}
          placeholder={from.placeholder}
          label={`${legend} — ${from.placeholder}`}
        />
        <span className="text-line" aria-hidden="true">
          —
        </span>
        <NumberInput
          name={to.name}
          value={to.value}
          placeholder={to.placeholder}
          label={`${legend} — ${to.placeholder}`}
        />
      </div>
    </div>
  );
}

function NumberInput({
  id,
  name,
  value,
  placeholder,
  label,
}: {
  readonly id?: string;
  readonly name: string;
  readonly value?: string;
  readonly placeholder: string;
  readonly label: string;
}) {
  return (
    <input
      id={id}
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
