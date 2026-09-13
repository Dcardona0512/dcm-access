import Link from "next/link";

import { EditorialImage } from "@/components/ui/EditorialImage";
import { PriceTag } from "@/components/ui/PriceTag";
import { DemoTag, Tag } from "@/components/ui/Tag";
import type { Dictionary } from "@/content/types";
import { localized, type Opportunity } from "@/lib/domain/types";
import { formatLocation, formatNumber } from "@/lib/format";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/* ============================================================================
   TARJETA DE VEHÍCULO
   ----------------------------------------------------------------------------
   No es una variante de `OpportunityCard`: invierte su jerarquía. En el
   catálogo editorial manda el título y el precio cierra; aquí manda la
   fotografía, el precio va inmediatamente después y el resto se comprime a una
   sola línea. Es la diferencia entre presentar una oportunidad y listar un
   carro en venta.

   Vive aparte, además, porque `OpportunityCard` la usan la portada, el
   catálogo, cuatro verticales y la tira de relacionadas: un `layout` allí
   convertiría cada retoque del mercado en un riesgo de regresión en cuatro
   superficies.
   ========================================================================== */

type MotorsCardProps = {
  readonly opportunity: Opportunity;
  readonly locale: Locale;
  readonly dict: Dictionary;
  /**
   * Carga temprana para la primera fila visible. En Next 16 `priority` está
   * deprecado a favor de `preload`; `EditorialImage` sigue exponiendo el
   * nombre antiguo y aquí solo se decide QUIÉN lo recibe.
   */
  readonly eager?: boolean;
  readonly className?: string;
};

/** Lee un atributo numérico, o `null` si no viene o no es una cifra. */
function numeric(opportunity: Opportunity, key: string): number | null {
  const raw = opportunity.attributes[key];
  if (raw === null || raw === undefined || raw === "") return null;
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function MotorsCard({ opportunity, locale, dict, eager = false, className }: MotorsCardProps) {
  const cover = opportunity.media[0];
  const hasVideo = opportunity.media.some((item) => item.kind === "video");
  const restricted = opportunity.visibility !== "public";

  const year = numeric(opportunity, "year");
  const mileage = numeric(opportunity, "mileage");

  /**
   * Una sola línea de datos, no una lista de `etiqueta: valor`. Nadie necesita
   * que le digan que "2024" es un año o que "8.400 km" es el kilometraje: en
   * un mercado de carros el formato ya lo dice, y quitar las etiquetas es lo
   * que deja respirar a la tarjeta.
   */
  const meta = [
    year !== null ? String(year) : null,
    mileage !== null ? `${formatNumber(mileage, locale)} ${dict.motorsMarket.card.km}` : null,
    formatLocation(opportunity.location, locale),
  ].filter((part): part is string => Boolean(part));

  return (
    <article className={cn("group", className)}>
      <Link
        href={localizePath(`/${opportunity.vertical}/${opportunity.slug}`, locale)}
        className="flex h-full flex-col gap-4 rounded-(--radius-card)"
      >
        <div className="relative overflow-hidden rounded-(--radius-card)">
          <EditorialImage
            media={cover}
            ratio="3/2"
            priority={eager}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="transition-transform duration-(--duration-slow) ease-(--ease-brand) group-hover:scale-[1.03]"
          />

          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {hasVideo ? (
                <Tag tone="neutral" className="bg-surface/80 backdrop-blur-sm">
                  <PlayGlyph />
                  {dict.motorsMarket.card.video}
                </Tag>
              ) : null}
              {restricted ? <Tag tone="champagne">{dict.tags.private}</Tag> : null}
            </div>
            {opportunity.isDemo ? <DemoTag /> : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {/* El precio primero: es el dato por el que se entra a un mercado. */}
          <PriceTag price={opportunity.price} locale={locale} dict={dict} size="lg" />

          <h3 className="font-display group-hover:text-accent text-xl leading-snug text-balance transition-colors">
            {localized(opportunity.title, locale)}
          </h3>

          <p className="text-fg-muted mt-auto pt-1 text-xs" data-numeric>
            {meta.join(" · ")}
          </p>
        </div>
      </Link>
    </article>
  );
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="h-2.5 w-2.5">
      <path d="M3 2.2 10 6l-7 3.8Z" fill="currentColor" />
    </svg>
  );
}
