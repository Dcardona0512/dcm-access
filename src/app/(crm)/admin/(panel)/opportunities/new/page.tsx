import { randomUUID } from "node:crypto";

import { Country } from "country-state-city";

import Link from "next/link";

import { AdminHeading } from "@/components/admin/AdminUI";
import { categories } from "@/lib/data/demo/seed/categories";
import { verticalLabels } from "@/lib/domain/labels";
import { currencies, isVertical, localized, type Vertical } from "@/lib/domain/types";
import { formatCountry } from "@/lib/format";
import { isSupabaseWritable } from "@/lib/supabase/server";

import { PublishForm, type CategoryOption } from "./PublishForm";

export const dynamic = "force-dynamic";

/**
 * Qué campos del esquema pregunta el FORMULARIO.
 *
 * Un esquema de categoría describe todo lo que una ficha puede llegar a
 * decir: marca, modelo, año, kilometraje, combustible, transmisión, potencia,
 * plazas, blindaje. Eso es lo correcto para la ficha publicada y para los
 * filtros, y es exactamente lo que no se debe poner delante de alguien que
 * está subiendo un carro: once desplegables entre el título y la descripción.
 *
 * En vehículos el formulario pregunta una sola cosa —el estado— y el resto
 * del esquema sigue intacto para las fichas que ya lo traen. Las demás
 * secciones no se tocan: nadie ha dicho todavía qué debe preguntar cada una.
 *
 * `tags` además venía en el esquema de vehículos, así que pintaba una segunda
 * casilla de etiquetas junto a la de verdad. Este filtro también la quita.
 */
export const FORM_ATTRIBUTES: Partial<Record<string, readonly string[]>> = {
  motors: ["condition"],
};

function asksFor(vertical: string) {
  const allowed = FORM_ATTRIBUTES[vertical];
  return (def: { readonly key: string }) => (allowed ? allowed.includes(def.key) : true);
}

/**
 * Alta de ficha.
 *
 * Las categorías y sus atributos se serializan aquí y viajan al formulario ya
 * traducidos. El cliente no conoce el dominio: solo pinta lo que le llega, de
 * modo que añadir un campo a una categoría cambia el formulario sin tocarlo.
 */
export default async function NewOpportunityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.vertical) ? sp.vertical[0] : sp.vertical;

  // La sección se elige en la pantalla anterior. Si llega una que no existe,
  // se cae a vehículos en lugar de romper.
  const initialVertical = isVertical(raw ?? "") ? (raw as string) : "motors";

  const categoryOptions: CategoryOption[] = categories.map((category) => ({
    id: category.id,
    vertical: category.vertical,
    name: localized(category.name, "es"),
    attributes: category.attributeSchema.filter(asksFor(category.vertical)).map((def) => ({
      key: def.key,
      label: localized(def.label, "es"),
      type: def.type,
      unit: def.unit,
      options: def.options?.map((option) => ({
        value: option.value,
        label: localized(option.label, "es"),
      })),
    })),
  }));

  /**
   * Los 250 países del catálogo mundial, con el nombre en español cuando el
   * navegador sabe traducirlo. Son unos pocos kilobytes de HTML: la lista
   * completa cabe en la página, y lo que NO cabe —cinco mil divisiones y
   * ciento cuarenta y ocho mil ciudades— se pide al servidor bajo demanda.
   */
  const countryOptions = Country.getAllCountries()
    .map((country) => ({
      code: country.isoCode,
      name: formatCountry(country.isoCode, "es") || country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <>
      <AdminHeading
        eyebrow={localized(verticalLabels[initialVertical as Vertical], "es")}
        title="Publicar una ficha"
      />

      {isSupabaseWritable() ? (
        <PublishForm
          listingId={`opp-${randomUUID().slice(0, 12)}`}
          initialVertical={initialVertical}
          categories={categoryOptions}
          currencies={[...currencies]}
          countries={countryOptions}
        />
      ) : (
        <p
          role="alert"
          className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm text-pretty"
        >
          Falta <code>SUPABASE_SECRET_KEY</code> en este entorno, así que no se puede publicar ni
          subir archivos. Configúrela y vuelva a desplegar.{" "}
          <Link href="/admin/opportunities" className="underline">
            Volver al catálogo
          </Link>
          .
        </p>
      )}
    </>
  );
}
