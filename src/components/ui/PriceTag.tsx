import type { Dictionary } from "@/content/types";
import type { Price } from "@/lib/domain/types";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * "Price on Request" no es un caso degradado: en este mercado es la norma
 * (§15). Se muestra con el mismo peso tipográfico que una cifra, en champagne,
 * para que se lea como una señal de exclusividad y no como un dato ausente.
 */

type PriceTagProps = {
  readonly price: Price;
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
};

const sizes = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-[clamp(1.375rem,2.2vw,1.75rem)]",
} as const;

export function PriceTag({ price, locale, dict, size = "md", className }: PriceTagProps) {
  const formatted = formatPrice(price, locale, {
    onRequest: dict.common.priceOnRequest,
    from: dict.common.from,
  });

  if (formatted.onRequest) {
    return (
      <span className={cn("text-accent", sizes[size], "font-display", className)}>
        {formatted.value}
      </span>
    );
  }

  return (
    <span className={cn("text-fg inline-flex items-baseline gap-1.5", className)} data-numeric>
      {formatted.prefix ? (
        <span className="eyebrow text-fg-muted text-[0.625rem]">{formatted.prefix}</span>
      ) : null}
      <span className={cn(sizes[size], "font-medium tracking-tight")}>{formatted.value}</span>
      {formatted.suffix ? <span className="text-fg-muted text-sm">{formatted.suffix}</span> : null}
    </span>
  );
}
