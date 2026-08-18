import Link from "next/link";

import { EditorialImage } from "@/components/ui/EditorialImage";
import { PriceTag } from "@/components/ui/PriceTag";
import { DemoTag, Tag } from "@/components/ui/Tag";
import type { Dictionary } from "@/content/types";
import { displayAttributes } from "@/lib/domain/attributes";
import { localized, type Category, type Opportunity } from "@/lib/domain/types";
import { formatLocation } from "@/lib/format";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Tarjeta de oportunidad (§15).
 *
 * Toda la tarjeta es el enlace, así que hay un solo destino y ningún objetivo
 * táctil ambiguo. Las acciones secundarias viven en la ficha, no aquí: §42
 * pide no acumular llamadas a la acción compitiendo entre sí.
 */

type OpportunityCardProps = {
  readonly opportunity: Opportunity;
  readonly category?: Category;
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly priority?: boolean;
  readonly size?: "default" | "feature";
  readonly className?: string;
};

export function OpportunityCard({
  opportunity,
  category,
  locale,
  dict,
  priority = false,
  size = "default",
  className,
}: OpportunityCardProps) {
  const isFeature = size === "feature";
  const restricted = opportunity.visibility !== "public";

  const highlights = displayAttributes(
    opportunity,
    category,
    locale,
    { yes: "Sí", no: "No" },
    { onlyHighlights: true, limit: isFeature ? 4 : 3 },
  );

  return (
    <article className={cn("group", className)}>
      <Link
        href={localizePath(`/opportunities/${opportunity.slug}`, locale)}
        className="flex h-full flex-col gap-5 rounded-(--radius-card)"
      >
        <div className="relative overflow-hidden rounded-(--radius-card)">
          <EditorialImage
            media={opportunity.media[0]}
            ratio={isFeature ? "3/2" : "4/3"}
            priority={priority}
            sizes={
              isFeature
                ? "(max-width: 768px) 100vw, 60vw"
                : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            }
            className="transition-transform duration-(--duration-slow) ease-(--ease-brand) group-hover:scale-[1.02]"
          />

          <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {opportunity.featured ? <Tag tone="champagne">{dict.tags.selected}</Tag> : null}
              {restricted ? <Tag tone="champagne">{dict.tags.private}</Tag> : null}
            </div>
            {opportunity.isDemo ? <DemoTag /> : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="text-fg-muted flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {category ? (
              <span className="eyebrow text-[0.5625rem]">{localized(category.name, locale)}</span>
            ) : null}
            <span className="bg-line h-px w-4" aria-hidden="true" />
            <span className="text-xs">{formatLocation(opportunity.location, locale)}</span>
          </div>

          <h3
            className={cn(
              "font-display text-balance transition-colors group-hover:text-accent",
              isFeature ? "text-display-3" : "text-xl leading-snug",
            )}
          >
            {localized(opportunity.title, locale)}
          </h3>

          {isFeature ? (
            <p className="text-fg-muted max-w-[56ch] text-pretty">
              {localized(opportunity.summary, locale)}
            </p>
          ) : null}

          {highlights.length > 0 ? (
            <ul className="text-fg-muted flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              {highlights.map((attribute) => (
                <li key={attribute.key} data-numeric>
                  <span className="text-fg-muted/60">{attribute.label}: </span>
                  {attribute.value}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="border-line-soft mt-auto flex items-end justify-between gap-4 border-t pt-4">
            <PriceTag
              price={opportunity.price}
              locale={locale}
              dict={dict}
              size={isFeature ? "lg" : "md"}
            />
            <span className="eyebrow text-accent shrink-0 text-[0.5625rem] opacity-0 transition-opacity duration-(--duration-base) group-hover:opacity-100 group-focus-visible:opacity-100">
              {dict.common.viewOpportunity}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
