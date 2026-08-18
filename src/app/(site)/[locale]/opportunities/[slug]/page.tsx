import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InquiryForm } from "@/components/forms/InquiryForm";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { ArrowEast, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { PriceTag } from "@/components/ui/PriceTag";
import { Eyebrow } from "@/components/ui/Section";
import { DemoTag, Tag, VerificationBadge } from "@/components/ui/Tag";
import { getDictionary } from "@/content";
import { getRepositories } from "@/lib/data";
import { displayAttributes, groupAttributes } from "@/lib/domain/attributes";
import { listingTypeLabels } from "@/lib/domain/labels";
import { localized, type Opportunity, type Vertical } from "@/lib/domain/types";
import { formatDate, formatLocation } from "@/lib/format";
import { isLocale, localizePath, locales, type Locale } from "@/lib/i18n/config";
import { breadcrumbSchema, buildMetadata, jsonLd, siteUrl } from "@/lib/seo";

/** Prerenderiza las fichas públicas; las reservadas se sirven bajo demanda. */
export async function generateStaticParams() {
  const { opportunities } = getRepositories();
  const published = await opportunities.allPublished();

  return locales.flatMap((locale) =>
    published.map((opportunity) => ({ locale, slug: opportunity.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const { opportunities } = getRepositories();
  const opportunity = await opportunities.bySlug(slug);
  if (!opportunity) return {};

  const dict = getDictionary(locale);
  const restricted = opportunity.visibility !== "public";

  return buildMetadata({
    locale,
    path: `/opportunities/${slug}`,
    title: localized(opportunity.title, locale),
    description: localized(opportunity.summary, locale) || dict.meta.siteDescription,
    // Lo reservado no se indexa: publicarlo en buscadores contradiría el
    // propósito de que sea reservado (§16).
    noIndex: restricted,
  });
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const { opportunities, categories, providers } = getRepositories();

  const opportunity = await opportunities.bySlug(slug);
  if (!opportunity || opportunity.status !== "published") notFound();

  const [category, provider, related] = await Promise.all([
    categories.byId(opportunity.categoryId),
    opportunity.providerId ? providers.byId(opportunity.providerId) : Promise.resolve(null),
    opportunities.related(opportunity, 3),
  ]);

  const restricted = opportunity.visibility !== "public";
  const yesNo = { yes: locale === "es" ? "Sí" : "Yes", no: "No" };

  const attributes = displayAttributes(opportunity, category ?? undefined, locale, yesNo);
  const grouped = groupAttributes(attributes);
  const allCategories = await categories.list();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema(locale, [
              { name: "DCM ACCESS", path: "/" },
              { name: dict.catalog.title, path: "/opportunities" },
              { name: localized(opportunity.title, locale), path: `/opportunities/${slug}` },
            ]),
          ),
        }}
      />
      {!restricted ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(listingSchema(opportunity, locale)) }}
        />
      ) : null}

      <Container width="wide" as="div">
        <div className="pt-32 pb-6 md:pt-40">
          <Link
            href={localizePath("/opportunities", locale)}
            className="eyebrow text-fg-muted hover:text-fg inline-flex items-center gap-2 transition-colors"
          >
            <span aria-hidden="true">←</span>
            {dict.catalog.title}
          </Link>
        </div>
      </Container>

      <Container width="wide" as="article">
        <div className="grid gap-14 pb-(--spacing-section) lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-20">
          {/* --- Columna principal ------------------------------------------ */}
          <div className="flex flex-col gap-12">
            <header className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                {category ? <Tag>{localized(category.name, locale)}</Tag> : null}
                <Tag>{localized(listingTypeLabels[opportunity.listingType], locale)}</Tag>
                {restricted ? <Tag tone="champagne">{dict.tags.private}</Tag> : null}
                <VerificationBadge status={opportunity.verification} dict={dict} />
                {opportunity.isDemo ? <DemoTag /> : null}
              </div>

              <h1 className="font-display text-display-2 text-balance">
                {localized(opportunity.title, locale)}
              </h1>

              <p className="text-lede text-fg-muted max-w-[62ch] text-pretty">
                {localized(opportunity.summary, locale)}
              </p>
            </header>

            <EditorialImage
              media={opportunity.media[0]}
              ratio="16/9"
              priority
              sizes="(max-width: 1024px) 100vw, 62vw"
            />

            {restricted ? (
              <section className="border-accent/25 bg-accent/[0.03] flex flex-col gap-4 rounded-(--radius-card) border px-6 py-8">
                <Eyebrow>{dict.opportunity.confidentialHeading}</Eyebrow>
                <p className="text-fg-muted max-w-[62ch] text-pretty">
                  {dict.opportunity.confidentialBody}
                </p>
              </section>
            ) : null}

            {localized(opportunity.description, locale) ? (
              <section className="flex flex-col gap-5">
                <h2 className="font-display text-2xl">{dict.opportunity.overview}</h2>
                <p className="text-fg-muted max-w-[68ch] leading-relaxed text-pretty">
                  {localized(opportunity.description, locale)}
                </p>
              </section>
            ) : null}

            {attributes.length > 0 ? (
              <section className="flex flex-col gap-6">
                <h2 className="font-display text-2xl">{dict.opportunity.specifications}</h2>

                <div className="flex flex-col gap-8">
                  {grouped.map((group) => (
                    <div key={group.group} className="flex flex-col gap-3">
                      {group.group ? <Eyebrow tone="muted">{group.group}</Eyebrow> : null}
                      <dl className="border-line grid gap-x-10 border-t sm:grid-cols-2">
                        {group.items.map((attribute) => (
                          <div
                            key={attribute.key}
                            className="border-line flex items-baseline justify-between gap-6 border-b py-3.5"
                          >
                            <dt className="text-fg-muted/70 text-sm">{attribute.label}</dt>
                            <dd className="text-fg text-right text-sm" data-numeric>
                              {attribute.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {provider ? (
              <section className="border-line flex flex-col gap-5 rounded-(--radius-card) border p-6">
                <Eyebrow tone="muted">{dict.opportunity.provider}</Eyebrow>

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-xl">{provider.name}</h3>
                    <p className="text-fg-muted max-w-[52ch] text-sm text-pretty">
                      {localized(provider.description, locale)}
                    </p>
                  </div>
                  <VerificationBadge status={provider.verification} dict={dict} />
                </div>

                {provider.status === "approved" ? (
                  <Link
                    href={localizePath(`/partners/${provider.slug}`, locale)}
                    className="eyebrow text-accent hover:text-fg w-fit transition-colors"
                  >
                    {dict.common.learnMore}
                  </Link>
                ) : null}
              </section>
            ) : null}
          </div>

          {/* --- Columna lateral: precio y acciones -------------------------- */}
          <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
            <div className="border-line bg-surface-raised edge-light flex flex-col gap-6 rounded-(--radius-card) border p-6">
              <div className="flex flex-col gap-2">
                <Eyebrow tone="muted">{dict.opportunity.reference}</Eyebrow>
                <span className="text-fg-muted text-sm" data-numeric>
                  {opportunity.reference}
                </span>
              </div>

              <PriceTag price={opportunity.price} locale={locale} dict={dict} size="lg" />

              <dl className="border-line flex flex-col gap-3 border-t pt-5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-muted/70">{dict.opportunity.location}</dt>
                  <dd className="text-right">
                    {formatLocation(opportunity.location, locale, { detail: "full" })}
                  </dd>
                </div>
                {opportunity.availability ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-fg-muted/70">{dict.opportunity.availability}</dt>
                    <dd className="text-right">{localized(opportunity.availability, locale)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-muted/70">{dict.opportunity.published}</dt>
                  <dd className="text-right" data-numeric>
                    {formatDate(opportunity.publishedAt, locale)}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-col gap-3">
                <Button href="#inquiry" variant="accent" fullWidth>
                  {dict.common.requestDetails}
                  <ArrowEast />
                </Button>
                <Button href={localizePath("/private/request", locale)} variant="outline" fullWidth>
                  {dict.common.privateRequest}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      {/* --- Consulta ------------------------------------------------------- */}
      <section id="inquiry" className="border-line border-t py-(--spacing-section)">
        <Container width="narrow">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Eyebrow>{dict.opportunity.inquiryHeading}</Eyebrow>
              <h2 className="font-display text-display-3 text-balance">
                {dict.common.contactBroker}
              </h2>
              <p className="text-fg-muted max-w-[58ch] text-pretty">
                {dict.opportunity.inquiryLede}
              </p>
            </div>

            <InquiryForm
              locale={locale}
              dict={dict}
              opportunityId={opportunity.id}
              vertical={opportunity.vertical}
            />
          </div>
        </Container>
      </section>

      {related.length > 0 ? (
        <section className="border-line border-t py-(--spacing-section)">
          <Container width="wide">
            <h2 className="font-display text-display-3 mb-12">{dict.opportunity.related}</h2>
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id} className="flex">
                  <OpportunityCard
                    opportunity={item}
                    category={allCategories.find((c) => c.id === item.categoryId)}
                    locale={locale}
                    dict={dict}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}

/** Tipo de Schema.org según la vertical (§27). */
function listingSchema(opportunity: Opportunity, locale: Locale) {
  const schemaTypes: Record<Vertical, string> = {
    "real-estate": "RealEstateListing",
    motors: "Product",
    aviation: "Service",
    "private-services": "Service",
    business: "Product",
  };

  const offers =
    opportunity.price.amount !== undefined
      ? {
          "@type": "Offer",
          price: opportunity.price.amount,
          priceCurrency: opportunity.price.currency,
          availability: "https://schema.org/InStock",
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": schemaTypes[opportunity.vertical],
    name: localized(opportunity.title, locale),
    description: localized(opportunity.summary, locale),
    url: `${siteUrl}/${locale}/opportunities/${opportunity.slug}`,
    sku: opportunity.reference,
    ...(offers ? { offers } : {}),
    ...(opportunity.location.city
      ? {
          areaServed: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: opportunity.location.city,
              addressCountry: opportunity.location.country,
            },
          },
        }
      : {}),
  };
}
