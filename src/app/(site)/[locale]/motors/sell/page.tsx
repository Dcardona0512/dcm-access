import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SellListingForm, type SelectOptions } from "@/components/forms/SellListingForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { getDictionary } from "@/content";
import { getRepositories } from "@/lib/data";
import { knownCountries } from "@/lib/data/locations";
import { motorsCategoryIds } from "@/lib/forms/schemas";
import { localized, type AttributeDef } from "@/lib/domain/types";
import { formatCountry } from "@/lib/format";
import { isLocale, localizePath } from "@/lib/i18n/config";
import { breadcrumbSchema, buildMetadata, jsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: "/motors/sell",
    title: dict.motorsMarket.sell.title,
    description: dict.motorsMarket.sell.lede,
  });
}

export default async function SellPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const copy = dict.motorsMarket.sell;

  const { categories } = getRepositories();
  const motorsCategories = await categories.byVertical("motors");

  /**
   * Las opciones de combustible, transmisión y estado se leen del esquema de
   * la categoría, que es donde ya viven traducidas. Duplicarlas en el
   * diccionario crearía dos verdades para "Gasolina/Petrol" y acabarían
   * separándose de lo que muestra el catálogo.
   */
  const schema: readonly AttributeDef[] = motorsCategories[0]?.attributeSchema ?? [];

  const optionsFor = (key: string): SelectOptions =>
    (schema.find((def) => def.key === key)?.options ?? []).map((option) => ({
      value: option.value,
      label: localized(option.label, locale),
    }));

  const categoryOptions: SelectOptions = motorsCategories
    .filter((category) =>
      (motorsCategoryIds as readonly string[]).includes(category.id),
    )
    .map((category) => ({ value: category.id, label: localized(category.name, locale) }));

  const countryOptions: SelectOptions = knownCountries
    .map((country) => ({ value: country.code, label: formatCountry(country.code, locale) }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema(locale, [
              { name: "DCM ACCESS", path: "/" },
              { name: dict.verticals.motors.eyebrow, path: "/motors" },
              { name: copy.title, path: "/motors/sell" },
            ]),
          ),
        }}
      />

      <Container width="default" as="div">
        <div className="pt-32 pb-6 md:pt-40">
          <Link
            href={localizePath("/motors", locale)}
            className="eyebrow text-fg-muted hover:text-fg inline-flex items-center gap-2 transition-colors"
          >
            <span aria-hidden="true">←</span>
            {dict.verticals.motors.eyebrow}
          </Link>
        </div>

        <div className="flex flex-col gap-12 pb-(--spacing-section)">
          <header className="flex flex-col gap-5">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1 className="font-display text-display-2 text-balance">{copy.title}</h1>
            <p className="text-lede text-fg-muted max-w-[58ch] text-pretty">{copy.lede}</p>
          </header>

          <SellListingForm
            locale={locale}
            dict={dict}
            categories={categoryOptions}
            fuels={optionsFor("fuel")}
            transmissions={optionsFor("transmission")}
            conditions={optionsFor("condition")}
            countries={countryOptions}
          />
        </div>
      </Container>
    </>
  );
}
