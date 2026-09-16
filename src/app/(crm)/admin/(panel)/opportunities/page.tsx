import Link from "next/link";

import { AdminHeading, Cell, DataTable, Row } from "@/components/admin/AdminUI";
import { Tag } from "@/components/ui/Tag";
import { getRepositories } from "@/lib/data";
import { DIAS_PARA_VETERANA, type VistaPanel } from "@/lib/data/panel-shared";
import { publicacionesDelPanel } from "@/lib/data/supabase/panel";
import { verticalLabels, visibilityLabels } from "@/lib/domain/labels";
import { localized } from "@/lib/domain/types";
import { formatDateShort, formatLocation, formatPrice } from "@/lib/format";

import { marcarVendida, reabrir } from "./actions";

/**
 * Datos vivos: el panel refleja lo que se publica y se vende en ejecución, así
 * que no puede prerenderizarse.
 */
export const dynamic = "force-dynamic";

const VISTAS: readonly { readonly clave: VistaPanel; readonly etiqueta: string }[] = [
  { clave: "disponibles", etiqueta: "Disponibles" },
  { clave: "veteranas", etiqueta: `Más de ${DIAS_PARA_VETERANA} días` },
  { clave: "vendidas", etiqueta: "Vendidas" },
];

const LEDES: Record<VistaPanel, string> = {
  disponibles: "Todo lo que está publicado ahora mismo en el sitio.",
  veteranas: `Publicadas hace más de ${DIAS_PARA_VETERANA} días y todavía sin vender.`,
  vendidas: "Fuera del catálogo público, aquí para el historial. Se pueden reabrir.",
};

function esVista(valor: string): valor is VistaPanel {
  return VISTAS.some((vista) => vista.clave === valor);
}

/** Días transcurridos, para señalar en la propia fila lo que el contador cuenta. */
function diasDesde(fecha: string): number {
  return Math.floor((Date.now() - new Date(fecha).getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Inventario propio.
 *
 * No pasa por `search()` del catálogo, que descarta cualquier estado que no
 * sea «publicada»: una ficha vendida tiene que seguir viéndose desde aquí o
 * venderla la haría desaparecer sin forma de reabrirla. Las de demostración
 * quedan fuera: son ejemplos, no inventario.
 */
export default async function AdminOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const crudo = Array.isArray(sp.vista) ? sp.vista[0] : sp.vista;
  const vista: VistaPanel = crudo && esVista(crudo) ? crudo : "disponibles";

  const { categories } = getRepositories();
  const [items, allCategories] = await Promise.all([
    publicacionesDelPanel(vista),
    categories.list(),
  ]);

  const categoryName = (id: string) =>
    localized(allCategories.find((category) => category.id === id)?.name, "es") || "—";

  return (
    <>
      <AdminHeading title="Inventario" lede={LEDES[vista]} />

      <div className="mb-8 flex flex-wrap items-center gap-2">
        {VISTAS.map((opcion) => {
          const activa = opcion.clave === vista;

          return (
            <Link
              key={opcion.clave}
              href={`/admin/opportunities?vista=${opcion.clave}`}
              aria-current={activa ? "page" : undefined}
              className={`eyebrow rounded-(--radius-card) border px-3 py-2 text-[0.75rem] transition-colors ${
                activa
                  ? "border-accent/60 text-accent bg-accent/10"
                  : "border-line text-fg-muted hover:text-fg"
              }`}
            >
              {opcion.etiqueta}
            </Link>
          );
        })}

        <Link
          href="/admin"
          className="eyebrow border-line text-fg-muted hover:text-fg ml-auto rounded-(--radius-card) border px-3 py-2 text-[0.75rem] transition-colors"
        >
          Crear publicación
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="border-line-soft text-fg-muted rounded-(--radius-card) border border-dashed px-5 py-10 text-center text-sm text-pretty">
          {vista === "vendidas"
            ? "Todavía no ha marcado ninguna ficha como vendida."
            : vista === "veteranas"
              ? `Ninguna ficha lleva más de ${DIAS_PARA_VETERANA} días publicada.`
              : "No hay nada publicado todavía."}
        </p>
      ) : (
        <DataTable
          headers={["Título", "Categoría", "Ubicación", "Visibilidad", "Precio", "Publicada", ""]}
        >
          {items.map((opportunity) => {
            const price = formatPrice(opportunity.price, "es", {
              onRequest: "A consultar",
              from: "Desde",
            });
            const dias = diasDesde(opportunity.publishedAt);
            const vendida = opportunity.status === "closed";

            return (
              <Row key={opportunity.id}>
                <Cell>
                  <span className="flex items-center gap-2">
                    <Link
                      href={`/es/${opportunity.vertical}/${opportunity.slug}`}
                      className="hover:text-accent transition-colors"
                    >
                      {localized(opportunity.title, "es")}
                    </Link>
                    {vendida ? <Tag tone="muted">Vendida</Tag> : null}
                  </span>
                  <span className="text-fg-muted/50 mt-1 block text-xs" data-numeric>
                    {opportunity.reference} ·{" "}
                    {localized(verticalLabels[opportunity.vertical], "es")}
                  </span>
                </Cell>

                <Cell className="text-fg-muted/70 text-xs">
                  {categoryName(opportunity.categoryId)}
                </Cell>

                <Cell className="text-fg-muted/70 text-xs">
                  {formatLocation(opportunity.location, "es")}
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
                  {/* Los días van junto a la fecha, en ámbar cuando pasan del
                      corte: es la misma cifra que cuenta la barra lateral, y
                      así se ve POR QUÉ una ficha está en esa lista. */}
                  <span
                    className={`mt-0.5 block ${
                      !vendida && dias >= DIAS_PARA_VETERANA ? "text-accent" : "text-fg-muted/40"
                    }`}
                  >
                    {dias} {dias === 1 ? "día" : "días"}
                  </span>
                </Cell>

                <Cell className="whitespace-nowrap">
                  <form action={vendida ? reabrir : marcarVendida}>
                    <input type="hidden" name="id" value={opportunity.id} />
                    <input type="hidden" name="vertical" value={opportunity.vertical} />
                    <input type="hidden" name="slug" value={opportunity.slug} />
                    <button
                      type="submit"
                      className="eyebrow border-line text-fg-muted hover:border-fg-muted/60 hover:text-fg rounded-(--radius-card) border px-2.5 py-1.5 text-[0.75rem] transition-colors"
                    >
                      {vendida ? "Reabrir" : "Marcar vendida"}
                    </button>
                  </form>
                </Cell>
              </Row>
            );
          })}
        </DataTable>
      )}
    </>
  );
}
