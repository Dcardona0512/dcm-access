import type { Currency, Price, PricePeriod } from "@/lib/domain/types";
import type { Locale } from "@/lib/i18n/config";

/* ============================================================================
   FORMATO DE CIFRAS Y FECHAS (§25)
   ----------------------------------------------------------------------------
   Multi-moneda desde el principio. En este mercado los importes son grandes,
   así que nunca se muestran decimales: "USD 2.400.000", no "USD 2.400.000,00".
   ========================================================================== */

const intlLocales: Record<Locale, string> = {
  es: "es-CO",
  en: "en-US",
};

export function formatCurrency(
  amount: number,
  currency: Currency,
  locale: Locale,
  options: { readonly compact?: boolean } = {},
): string {
  return new Intl.NumberFormat(intlLocales[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    notation: options.compact ? "compact" : "standard",
    currencyDisplay: "code",
  }).format(amount);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocales[locale], { maximumFractionDigits: 0 }).format(value);
}

const periodLabels: Record<PricePeriod, Record<Locale, string>> = {
  hour: { es: "/hora", en: "/hour" },
  day: { es: "/día", en: "/day" },
  week: { es: "/semana", en: "/week" },
  month: { es: "/mes", en: "/month" },
  year: { es: "/año", en: "/year" },
  flight: { es: "/vuelo", en: "/flight" },
};

export type FormattedPrice = {
  /** Cifra principal, o el texto de "precio a consultar". */
  readonly value: string;
  /** "Desde", cuando el precio es un punto de partida. */
  readonly prefix?: string;
  /** "/hora", "/mes"… */
  readonly suffix?: string;
  readonly onRequest: boolean;
};

export function formatPrice(
  price: Price,
  locale: Locale,
  labels: { readonly onRequest: string; readonly from: string },
): FormattedPrice {
  if (price.mode === "on_request" || price.amount === undefined) {
    return { value: labels.onRequest, onRequest: true };
  }

  return {
    value: formatCurrency(price.amount, price.currency, locale),
    prefix: price.mode === "from" ? labels.from : undefined,
    suffix: price.period ? periodLabels[price.period][locale] : undefined,
    onRequest: false,
  };
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocales[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export function formatDateShort(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocales[locale], {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(iso));
}

/** Nombre legible de un país a partir de su código ISO 3166-1 alpha-2. */
export function formatCountry(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([intlLocales[locale]], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** "Medellín, Colombia" — omite los niveles que falten. */
export function formatLocation(
  location: { country: string; region?: string; city?: string; area?: string },
  locale: Locale,
  options: { readonly detail?: "short" | "full" } = {},
): string {
  const parts =
    options.detail === "full"
      ? [location.area, location.city, location.region, formatCountry(location.country, locale)]
      : [location.city, formatCountry(location.country, locale)];

  return parts.filter(Boolean).join(", ");
}
