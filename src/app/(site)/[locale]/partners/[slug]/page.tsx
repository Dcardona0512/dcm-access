import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow } from "@/components/ui/Section";
import { DemoTag, Tag, VerificationBadge } from "@/components/ui/Tag";
import { getDictionary } from "@/content";
import { getRepositories } from "@/lib/data";
import { verticalLabels } from "@/lib/domain/labels";
import { localized } from "@/lib/domain/types";
import { formatLocation } from "@/lib/format";
import { isLocale, localizePath, locales } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const { providers } = getRepositories();
  const approved = await providers.listApproved();

  return locales.flatMap((locale) =>
    approved.map((provider) => ({ locale, slug: provider.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const { providers } = getRepositories();
  const provider = await providers.bySlug(slug);
  if (!provider) return {};

  return buildMetadata({
    locale,
    path: `/partners/${slug}`,
    title: provider.name,
    description: localized(provider.description, locale),
  });
}

/**
 * Perfil de proveedor (§19).
 *
 * Solo se sirven los perfiles aprobados: una postulación en revisión no tiene
 * página pública, que es justamente lo que promete §18.
 */
export default async function ProviderPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const { providers, opportunities, categories } = getRepositories();

  const provider = await providers.bySlug(slug);
  if (!provider || provider.status !== "approved") notFound();

  const [published, allCategories] = await Promise.all([
    opportunities.search({ providerId: provider.id, sort: "newest", limit: 6 }),
    categories.list(),
  ]);

  return (
    <>
      <Container width="wide" as="div">
        <div className="pt-32 pb-6 md:pt-40">
          <Link
            href={localizePath("/partners", locale)}
            className="eyebrow text-fg-muted hover:text-fg inline-flex items-center gap-2 transition-colors"
          >
            <span aria-hidden="true">←</span>
            {dict.partners.directoryHeading}
          </Link>
        </div>
      </Container>

      <Container width="wide" as="article">
        <div className="grid gap-14 pb-(--spacing-section) lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
          <div className="flex flex-col gap-12">
            <header className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                {provider.verticals.map((vertical) => (
                  <Tag key={vertical}>{localized(verticalLabels[vertical], locale)}</Tag>
                ))}
                <VerificationBadge status={provider.verification} dict={dict} />
                {provider.isDemo ? <DemoTag /> : null}
              </div>

              <h1 className="font-display text-display-2 text-balance">{provider.name}</h1>
              <p className="text-lede text-fg-muted max-w-[62ch] text-pretty">
                {localized(provider.description, locale)}
              </p>
            </header>

            {provider.services.length > 0 ? (
              <section className="flex flex-col gap-5">
                <h2 className="font-display text-2xl">{dict.provider.services}</h2>
                <ul className="border-line grid gap-x-10 border-t sm:grid-cols-2">
                  {provider.services.map((service, index) => (
                    <li
                      key={index}
                      className="border-line text-fg-muted flex items-center gap-3 border-b py-3.5 text-sm"
                    >
                      <span className="bg-accent-dim/60 h-px w-4 shrink-0" aria-hidden="true" />
                      {localized(service, locale)}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* La distinción entre acreditación comprobada y declarada es
                explícita, no letra pequeña (§26). */}
            <section className="border-line flex flex-col gap-5 rounded-(--radius-card) border p-6">
              <Eyebrow tone="muted">{dict.provider.verificationHeading}</Eyebrow>

              {provider.certifications.length > 0 ? (
                <ul className="flex flex-col gap-2.5">
                  {provider.certifications.map((certification) => (
                    <li
                      key={certification.name}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
                    >
                      <span className="text-fg-muted text-sm">{certification.name}</span>
                      <Tag tone={certification.verified ? "verified" : "muted"}>
                        {certification.verified
                          ? dict.opportunity.verifiedLabel
                          : dict.opportunity.unverifiedLabel}
                      </Tag>
                    </li>
                  ))}
                </ul>
              ) : null}

              <p className="text-fg-muted/70 max-w-[62ch] text-xs text-pretty">
                {dict.provider.verificationBody}
              </p>
            </section>
          </div>

          <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
            <div className="border-line bg-surface-raised edge-light flex flex-col gap-6 rounded-(--radius-card) border p-6">
              <div className="flex flex-col gap-3">
                <Eyebrow tone="muted">{dict.provider.coverage}</Eyebrow>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {provider.locations.map((location, index) => (
                    <li key={index} className="text-fg-muted">
                      {formatLocation(location, locale)}
                    </li>
                  ))}
                </ul>
              </div>

              {provider.operatingAreas.length > 0 ? (
                <div className="border-line flex flex-col gap-3 border-t pt-5">
                  <Eyebrow tone="muted">{dict.partnerApply.fields.operatingAreas.label}</Eyebrow>
                  <p className="text-fg-muted text-sm text-pretty">
                    {provider.operatingAreas.join(" · ")}
                  </p>
                </div>
              ) : null}

              <div className="border-line flex flex-col gap-3 border-t pt-5">
                <Eyebrow tone="muted">{dict.provider.contact}</Eyebrow>
                {/* El contacto pasa por la mesa de brokerage: es el modelo de
                    negocio, y también lo que permite registrar el lead (§2). */}
                <p className="text-fg-muted/70 text-xs text-pretty">{dict.opportunity.inquiryLede}</p>
                <Link
                  href={localizePath("/private/request", locale)}
                  className="eyebrow text-accent hover:text-fg transition-colors"
                >
                  {dict.common.contactBroker}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      <section className="border-line border-t py-(--spacing-section)">
        <Container width="wide">
          <h2 className="font-display text-display-3 mb-12">{dict.provider.openOpportunities}</h2>

          {published.items.length === 0 ? (
            <EmptyState heading={dict.catalog.empty.heading} body={dict.catalog.empty.body} />
          ) : (
            <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {published.items.map((opportunity) => (
                <li key={opportunity.id} className="flex">
                  <OpportunityCard
                    opportunity={opportunity}
                    category={allCategories.find((c) => c.id === opportunity.categoryId)}
                    locale={locale}
                    dict={dict}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
