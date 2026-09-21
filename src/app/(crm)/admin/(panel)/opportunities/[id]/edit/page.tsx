import { Country } from "country-state-city";

import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminHeading } from "@/components/admin/AdminUI";
import { categories } from "@/lib/data/demo/seed/categories";
import { fichaParaEditar } from "@/lib/data/supabase/panel";
import { verticalLabels } from "@/lib/domain/labels";
import { localized, type Vertical } from "@/lib/domain/types";
import { formatCountry } from "@/lib/format";
import { isSupabaseWritable } from "@/lib/supabase/server";

import { PublishForm, type CategoryOption } from "../../new/PublishForm";
import { FORM_ATTRIBUTES } from "../../new/page";

export const dynamic = "force-dynamic";

/* ============================================================================
   EDITAR UNA FICHA
   ----------------------------------------------------------------------------
   El mismo formulario que publica, relleno con lo que ya hay. No hay una
   segunda pantalla parecida: dos formularios para los mismos campos acabarían
   divergiendo, y el día que se añada un campo aparecería en uno y no en el
   otro sin que nadie lo note hasta ver una ficha a medias.

   Lo que NO se puede cambiar desde aquí es la sección: mover un carro a
   inmobiliaria cambiaría su categoría, su URL y sus campos a la vez. Si de
   verdad hiciera falta, se borra y se vuelve a publicar.
   ========================================================================== */

export default async function EditarFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseWritable()) {
    return (
      <p
        role="alert"
        className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm text-pretty"
      >
        Falta <code>SUPABASE_SECRET_KEY</code> en este entorno, así que no se puede editar.
      </p>
    );
  }

  const editable = await fichaParaEditar(id);
  if (!editable) notFound();

  const { ficha, rutas } = editable;

  const categoryOptions: CategoryOption[] = categories.map((category) => ({
    id: category.id,
    vertical: category.vertical,
    name: localized(category.name, "es"),
    attributes: category.attributeSchema
      .filter((def) => {
        const permitidos = FORM_ATTRIBUTES[category.vertical];
        return permitidos ? permitidos.includes(def.key) : true;
      })
      .map((def) => ({
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

  const countryOptions = Country.getAllCountries()
    .map((country) => ({
      code: country.isoCode,
      name: formatCountry(country.isoCode, "es") || country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  // Las etiquetas viven dentro de los atributos pero tienen su propio control,
  // así que se sacan aparte y no se pintan dos veces.
  const etiquetas = Array.isArray(ficha.attributes.tags)
    ? (ficha.attributes.tags as readonly string[])
    : [];

  return (
    <>
      <AdminHeading
        eyebrow={localized(verticalLabels[ficha.vertical as Vertical], "es")}
        title="Editar ficha"
      />

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href={`/es/${ficha.vertical}/${ficha.slug}`}
          target="_blank"
          className="eyebrow border-line text-fg-muted hover:text-fg rounded-(--radius-card) border px-3 py-2 text-[0.75rem] transition-colors"
        >
          Ver la ficha publicada
        </Link>
        <Link
          href="/admin/catalog"
          className="eyebrow border-line text-fg-muted hover:text-fg rounded-(--radius-card) border px-3 py-2 text-[0.75rem] transition-colors"
        >
          Volver al catálogo
        </Link>
      </div>

      <PublishForm
        listingId={ficha.id}
        initialVertical={ficha.vertical}
        categories={categoryOptions}
        currencies={[ficha.price.currency, ...["COP", "USD", "EUR"]].filter(
          (valor, indice, todos) => todos.indexOf(valor) === indice,
        )}
        countries={countryOptions}
        inicial={{
          categoryId: ficha.categoryId,
          title: localized(ficha.title, "es"),
          description: localized(ficha.description, "es"),
          listingType: ficha.listingType,
          priceAmount: ficha.price.amount ?? null,
          currency: ficha.price.currency,
          country: ficha.location.country,
          region: ficha.location.region ?? "",
          city: ficha.location.city ?? "",
          lat: ficha.location.lat ?? null,
          lng: ficha.location.lng ?? null,
          sku: ficha.sku ?? "",
          tags: etiquetas,
          attributes: ficha.attributes,
          media: ficha.media.map((item, index) => ({
            // El orden de `rutas` es el mismo que el de `media`: los dos salen
            // de la misma consulta ordenada por posición.
            path: rutas[index] ?? "",
            src: item.src ?? "",
            kind: item.kind,
          })),
        }}
      />
    </>
  );
}
