import Link from "next/link";

import { AdminHeading, Cell, DataTable, Row } from "@/components/admin/AdminUI";
import { DemoTag, Tag } from "@/components/ui/Tag";
import { getRepositories } from "@/lib/data";
import { listingTypeLabels, verticalLabels, visibilityLabels } from "@/lib/domain/labels";
import { localized } from "@/lib/domain/types";
import { formatDateShort, formatLocation, formatPrice } from "@/lib/format";

/**
 * Datos vivos: el panel refleja los leads, postulaciones y cambios de etapa
 * creados en ejecución, así que no puede prerenderizarse.
 */
export const dynamic = "force-dynamic";

/**
 * Inventario de oportunidades.
 *
 * Muestra TODAS las visibilidades, incluida `private`: el panel es
 * precisamente el sitio donde lo reservado tiene que verse, porque es lo que
 * el broker gestiona a mano.
 */
export default async function AdminOpportunitiesPage() {
  const { opportunities, categories, providers } = getRepositories();

  const [results, allCategories, allProviders] = await Promise.all([
    opportunities.search({
      visibility: ["public", "members", "private"],
      sort: "newest",
    }),
    categories.list(),
    providers.listAll(),
  ]);

  const categoryName = (id: string) =>
    localized(allCategories.find((category) => category.id === id)?.name, "es") || "—";

  const providerName = (id?: string) =>
    id ? (allProviders.find((provider) => provider.id === id)?.name ?? "—") : "—";

  return (
    <>
      <AdminHeading
        eyebrow="Inventario"
        title="Oportunidades"
        lede={`${results.total} publicadas, incluidas las reservadas que no aparecen en el catálogo público.`}
      />

      <DataTable
        headers={[
          "Título",
          "Categoría",
          "Operación",
          "Ubicación",
          "Proveedor",
          "Visibilidad",
          "Precio",
          "Publicada",
        ]}
      >
        {results.items.map((opportunity) => {
          const price = formatPrice(opportunity.price, "es", {
            onRequest: "A consultar",
            from: "Desde",
          });

          return (
            <Row key={opportunity.id}>
              <Cell>
                <span className="flex items-center gap-2">
                  <Link
                    href={`/es/opportunities/${opportunity.slug}`}
                    className="hover:text-accent transition-colors"
                  >
                    {localized(opportunity.title, "es")}
                  </Link>
                  {opportunity.featured ? <Tag tone="champagne">Selección</Tag> : null}
                  {opportunity.isDemo ? <DemoTag /> : null}
                </span>
                <span className="text-fg-muted/50 mt-1 block text-xs" data-numeric>
                  {opportunity.reference} · {localized(verticalLabels[opportunity.vertical], "es")}
                </span>
              </Cell>

              <Cell className="text-fg-muted/70 text-xs">{categoryName(opportunity.categoryId)}</Cell>

              <Cell className="text-fg-muted/70 text-xs">
                {localized(listingTypeLabels[opportunity.listingType], "es")}
              </Cell>

              <Cell className="text-fg-muted/70 text-xs">
                {formatLocation(opportunity.location, "es")}
              </Cell>

              <Cell className="text-fg-muted/70 max-w-48 truncate text-xs">
                {providerName(opportunity.providerId)}
              </Cell>

              <Cell>
                <Tag tone={opportunity.visibility === "public" ? "muted" : "champagne"}>
                  {localized(visibilityLabels[opportunity.visibility], "es")}
                </Tag>
              </Cell>

              <Cell numeric className="whitespace-nowrap">
                {price.prefix ? (
                  <span className="text-fg-muted/50 mr-1 text-xs">{price.prefix}</span>
                ) : null}
                {price.value}
              </Cell>

              <Cell numeric className="text-fg-muted/60 text-xs whitespace-nowrap">
                {formatDateShort(opportunity.publishedAt, "es")}
              </Cell>
            </Row>
          );
        })}
      </DataTable>
    </>
  );
}
