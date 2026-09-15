import { randomUUID } from "node:crypto";

import { Country } from "country-state-city";

import Link from "next/link";

import { AdminHeading } from "@/components/admin/AdminUI";
import { categories } from "@/lib/data/demo/seed/categories";
import { verticalLabels } from "@/lib/domain/labels";
import { currencies, isVertical, localized, verticals } from "@/lib/domain/types";
import { formatCountry } from "@/lib/format";
import { isSupabaseWritable } from "@/lib/supabase/server";

import { PublishForm, type CategoryOption } from "./PublishForm";

export const dynamic = "force-dynamic";

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
    attributes: category.attributeSchema.map((def) => ({
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
        eyebrow="Catálogo"
        title="Publicar una ficha"
        lede="Lo que publique aquí aparece de inmediato en el sitio. Las fotos y el vídeo suben directo al almacenamiento."
      />

      {isSupabaseWritable() ? (
        <PublishForm
          listingId={`opp-${randomUUID().slice(0, 12)}`}
          initialVertical={initialVertical}
          verticals={verticals.map((vertical) => ({
            value: vertical,
            label: localized(verticalLabels[vertical], "es"),
          }))}
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
