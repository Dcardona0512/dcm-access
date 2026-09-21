import Link from "next/link";

import { AdminHeading } from "@/components/admin/AdminUI";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { Tag } from "@/components/ui/Tag";
import { catalogoDelPanel } from "@/lib/data/supabase/panel";
import { verticalLabels } from "@/lib/domain/labels";
import { isVertical, localized, verticals, type Vertical } from "@/lib/domain/types";
import { formatDateShort, formatLocation, formatPrice } from "@/lib/format";

import { marcarVendida, reabrir } from "../opportunities/actions";

/**
 * Datos vivos: lo que se publica y se vende cambia en ejecución.
 */
export const dynamic = "force-dynamic";

/* ============================================================================
   CATÁLOGO DEL PANEL
   ----------------------------------------------------------------------------
   Ver lo subido como se ve en el sitio: con su foto, su precio y su ciudad.

   Es deliberadamente distinto del inventario, que es una tabla. Una tabla
   sirve para comparar veinte filas por una columna —cuáles llevan más días,
   cuáles se vendieron— y es pésima para lo que se hace aquí, que es reconocer
   un carro de un vistazo. La misma información, dos formas, cada una para su
   pregunta.

   Incluye las vendidas: esto es el catálogo de lo que se ha subido, no el
   escaparate. Van marcadas y con la imagen apagada.
   ========================================================================== */

/** Placeholder por sección, mientras una ficha no traiga fotografía. */
const tones = {
  "real-estate": "architecture",
  motors: "motors",
  aviation: "aviation",
  services: "services",
  business: "business",
} as const;

export default async function AdminCatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const crudo = Array.isArray(sp.seccion) ? sp.seccion[0] : sp.seccion;
  const seccion: Vertical | null = crudo && isVertical(crudo) ? (crudo as Vertical) : null;

  const todo = await catalogoDelPanel();
  const items = seccion ? todo.filter((o) => o.vertical === seccion) : todo;

  // La cuenta se saca del mismo listado: la pestaña que dice «Vehículos 3»
  // tiene que contar exactamente lo que se ve al pulsarla.
  const cuenta = (vertical: Vertical) => todo.filter((o) => o.vertical === vertical).length;

  return (
    <>
      <AdminHeading
        title="Catálogo"
        lede="Lo que ya está subido, sección por sección, como se ve en el sitio."
      />

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Pestana href="/admin/catalog" activa={seccion === null}>
          Todas <Cuenta n={todo.length} />
        </Pestana>

        {verticals.map((vertical) => (
          <Pestana
            key={vertical}
            href={`/admin/catalog?seccion=${vertical}`}
            activa={seccion === vertical}
          >
            {localized(verticalLabels[vertical], "es")} <Cuenta n={cuenta(vertical)} />
          </Pestana>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="border-line-soft text-fg-muted rounded-(--radius-media) border border-dashed px-5 py-12 text-center text-sm text-pretty">
          {seccion
            ? `Todavía no hay nada publicado en ${localized(verticalLabels[seccion], "es")}.`
            : "Todavía no hay nada publicado."}{" "}
          <Link href="/admin/publish" className="text-accent underline">
            Crear publicación
          </Link>
          .
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((opportunity) => {
            const price = formatPrice(opportunity.price, "es", {
              onRequest: "A consultar",
              from: "Desde",
            });
            const vendida = opportunity.status === "closed";
            const portada = opportunity.media[0];
            const fotos = opportunity.media.length;

            return (
              <li key={opportunity.id} className="flex flex-col gap-3">
                <Link
                  href={`/es/${opportunity.vertical}/${opportunity.slug}`}
                  className="dcm-card-media group relative block overflow-hidden rounded-(--radius-media)"
                >
                  <EditorialImage
                    media={
                      portada ?? {
                        id: opportunity.id,
                        kind: "image",
                        alt: localized(opportunity.title, "es"),
                        tone: tones[opportunity.vertical],
                      }
                    }
                    ratio="4/3"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    // Una ficha vendida se reconoce antes por la imagen apagada
                    // que por leer su etiqueta.
                    className={vendida ? "opacity-40 grayscale" : undefined}
                  />

                  {fotos > 1 ? (
                    <span className="eyebrow bg-surface/85 text-fg-muted absolute right-3 bottom-3 rounded-(--radius-card) px-2 py-1 text-[0.75rem] backdrop-blur-sm">
                      {fotos} archivos
                    </span>
                  ) : null}
                </Link>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-lg" data-numeric>
                      {price.prefix ? (
                        <span className="text-fg-muted/50 mr-1 text-xs">{price.prefix}</span>
                      ) : null}
                      {price.value}
                    </span>
                    {vendida ? <Tag tone="muted">Vendida</Tag> : null}
                  </div>

                  <Link
                    href={`/es/${opportunity.vertical}/${opportunity.slug}`}
                    className="hover:text-accent text-sm transition-colors"
                  >
                    {localized(opportunity.title, "es")}
                  </Link>

                  <span className="text-fg-muted/60 text-xs">
                    {formatLocation(opportunity.location, "es")} ·{" "}
                    {formatDateShort(opportunity.publishedAt, "es")}
                  </span>

                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/opportunities/${opportunity.id}/edit`}
                      className="eyebrow border-accent/50 text-accent hover:bg-accent/10 rounded-(--radius-card) border px-2.5 py-1.5 text-[0.75rem] transition-colors"
                    >
                      Editar
                    </Link>

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
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Pestana({
  href,
  activa,
  children,
}: {
  readonly href: string;
  readonly activa: boolean;
  readonly children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={activa ? "page" : undefined}
      className={`eyebrow inline-flex items-center gap-1.5 rounded-(--radius-card) border px-3 py-2 text-[0.75rem] transition-colors ${
        activa
          ? "border-accent/60 text-accent bg-accent/10"
          : "border-line text-fg-muted hover:text-fg"
      }`}
    >
      {children}
    </Link>
  );
}

/** La cuenta en gris: acompaña a la etiqueta sin competir con ella. */
function Cuenta({ n }: { readonly n: number }) {
  return (
    <span className="text-fg-muted/50" data-numeric>
      {n}
    </span>
  );
}
