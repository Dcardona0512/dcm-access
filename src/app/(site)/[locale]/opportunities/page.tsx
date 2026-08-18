import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogFilters, type CatalogSearchState } from "@/components/opportunities/CatalogFilters";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { SearchPanel } from "@/components/search/SearchPanel";
import { ArrowEast, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow } from "@/components/ui/Section";
import { getDictionary } from "@/content";
import { getRepositories, type SortOrder } from "@/lib/data";
import { isCurrency, isVertical, type ListingType } from "@/lib/domain/types";
import { isLocale, localizePath } from "@/lib/i18n/config";
import { breadcrumbSchema, buildMetadata, jsonLd, siteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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
    path: "/opportunities",
    title: dict.catalog.title,
    description: dict.catalog.lede,
  });
}

function first(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

const SORTS: readonly SortOrder[] = ["relevance", "newest", "price-asc", "price-desc"];

/**
 * Catálogo (§15).
 *
 * Todo el estado vive en la URL. Eso hace que cada combinación de filtros sea
 * una página compartible y rastreable, y que el servidor pueda renderizar el
 * resultado sin un solo kilobyte de JavaScript de listado.
 */
export default async function OpportunitiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const sp = await searchParams;

  const state: CatalogSearchState = {
    q: first(sp.q),
    vertical: first(sp.vertical),
    categoryId: first(sp.categoryId),
    country: first(sp.country),
    city: first(sp.city),
    listingType: first(sp.listingType),
    minPrice: first(sp.minPrice),
    maxPrice: first(sp.maxPrice),
    sort: first(sp.sort),
  };

  const page = Math.max(1, Number(first(sp.page) ?? 1) || 1);
  const sort = SORTS.includes(state.sort as SortOrder) ? (state.sort as SortOrder) : "relevance";
  const currency = first(sp.currency);

  const { opportunities, categories } = getRepositories();

  const [results, allCategories] = await Promise.all([
    opportunities.search({
      q: state.q,
      vertical: isVertical(state.vertical) ? state.vertical : undefined,
      categoryId: state.categoryId,
      country: state.country,
      city: state.city,
      listingType: state.listingType as ListingType | undefined,
      currency: isCurrency(currency) ? currency : undefined,
      minPrice: toNumber(state.minPrice),
      maxPrice: toNumber(state.maxPrice),
      sort,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    categories.list(),
  ]);

  const categoryFor = (id: string) => allCategories.find((category) => category.id === id);
  const totalPages = Math.max(1, Math.ceil(results.total / PAGE_SIZE));

  const buildPageHref = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(state)) {
      if (value) query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const suffix = query.toString();
    return `${localizePath("/opportunities", locale)}${suffix ? `?${suffix}` : ""}`;
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            ...breadcrumbSchema(locale, [
              { name: "DCM ACCESS", path: "/" },
              { name: dict.catalog.title, path: "/opportunities" },
            ]),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: dict.catalog.title,
            numberOfItems: results.total,
            itemListElement: results.items.map((item, index) => ({
              "@type": "ListItem",
              position: (page - 1) * PAGE_SIZE + index + 1,
              url: `${siteUrl}/${locale}/opportunities/${item.slug}`,
            })),
          }),
        }}
      />

      <Container width="wide" as="div">
        <div className="flex flex-col gap-10 pt-36 pb-14 md:pt-44">
          <div className="flex max-w-3xl flex-col gap-5">
            <Eyebrow>{dict.home.selected.eyebrow}</Eyebrow>
            <h1 className="font-display text-display-2 text-balance">{dict.catalog.title}</h1>
            <p className="text-lede text-fg-muted max-w-[58ch] text-pretty">{dict.catalog.lede}</p>
          </div>

          <SearchPanel
            locale={locale}
            dict={dict}
            defaultQuery={state.q}
            defaultVertical={state.vertical}
          />

          <CatalogFilters
            locale={locale}
            dict={dict}
            facets={results.facets}
            categories={allCategories}
            state={{ ...state, sort }}
            total={results.total}
          />
        </div>
      </Container>

      <Container width="wide" as="section">
        <div className="pb-(--spacing-section)">
          {results.items.length === 0 ? (
            <EmptyState
              heading={dict.catalog.empty.heading}
              body={dict.catalog.empty.body}
              action={
                <Button href={localizePath("/private/request", locale)} variant="accent">
                  {dict.catalog.empty.cta}
                  <ArrowEast />
                </Button>
              }
            />
          ) : (
            <>
              <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {results.items.map((opportunity, index) => (
                  <li key={opportunity.id} className="flex">
                    <OpportunityCard
                      opportunity={opportunity}
                      category={categoryFor(opportunity.categoryId)}
                      locale={locale}
                      dict={dict}
                      priority={index < 3}
                      className="w-full"
                    />
                  </li>
                ))}
              </ul>

              {totalPages > 1 ? (
                <nav
                  aria-label="Paginación"
                  className="border-line mt-16 flex items-center justify-between gap-4 border-t pt-8"
                >
                  <PageLink href={buildPageHref(page - 1)} disabled={page === 1}>
                    {dict.common.previous}
                  </PageLink>

                  <span className="eyebrow text-fg-muted text-[0.5625rem]" data-numeric>
                    {page} / {totalPages}
                  </span>

                  <PageLink href={buildPageHref(page + 1)} disabled={page >= totalPages}>
                    {dict.common.continue}
                  </PageLink>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </Container>
    </>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  readonly href: string;
  readonly disabled: boolean;
  readonly children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="eyebrow text-fg-muted/30 cursor-not-allowed">{children}</span>;
  }

  return (
    <Link href={href} className={cn("eyebrow text-fg-muted hover:text-fg transition-colors")}>
      {children}
    </Link>
  );
}
