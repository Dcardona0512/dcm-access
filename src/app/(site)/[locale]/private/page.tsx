import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccessMark } from "@/components/brand/AccessMark";
import { ArrowEast, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import { DemoTag, Tag } from "@/components/ui/Tag";
import { getDictionary } from "@/content";
import { getRepositories } from "@/lib/data";
import { localized } from "@/lib/domain/types";
import { formatCountry } from "@/lib/format";
import { isLocale, localizePath } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo";

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
    path: "/private",
    title: dict.privateAccess.eyebrow,
    description: dict.privateAccess.lede,
  });
}

/**
 * DCM ACCESS PRIVATE (§16, §46).
 *
 * Debe sentirse más exclusiva que el resto de la plataforma, y lo consigue por
 * sustracción: sin buscador, sin filtros, sin precios, sin fotografías. Las
 * oportunidades reservadas se enumeran con lo justo para que se entienda que
 * existen — categoría, país y poco más — y todo lo demás pasa por solicitud.
 */
export default async function PrivateAccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const copy = dict.privateAccess;

  const { opportunities, categories } = getRepositories();
  const [reserved, allCategories] = await Promise.all([
    opportunities.search({ visibility: ["private"], sort: "newest", limit: 6 }),
    categories.list(),
  ]);

  return (
    <>
      {/* --- Portada ------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden pt-40 pb-24 md:pt-52 md:pb-32">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(75% 60% at 50% 0%, rgb(var(--c-glow-accent) / 0.09) 0%, transparent 65%)",
            }}
          />
          <AccessMark
            className="text-fg absolute top-0 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/4 opacity-[0.025]"
            weight={3}
          />
        </div>

        <Container>
          <div className="flex flex-col items-center gap-8 text-center">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1 className="font-display text-display-1 max-w-[16ch] text-balance">
              {copy.heading}
            </h1>
            <p className="text-lede text-fg-muted max-w-[58ch] text-pretty">{copy.lede}</p>
            <Button href={localizePath("/private/request", locale)} variant="accent" size="lg">
              {copy.cta}
              <ArrowEast />
            </Button>
          </div>
        </Container>
      </section>

      {/* --- Qué incluye --------------------------------------------------- */}
      <Section surface="raised" width="wide" divider>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-24">
          <SectionHeading eyebrow={copy.statement} heading={copy.discretionHeading} size="sm" />

          <div className="flex flex-col gap-10">
            <ul className="border-line grid gap-x-10 border-t sm:grid-cols-2">
              {copy.includes.map((item) => (
                <li
                  key={item}
                  className="border-line text-fg-muted flex items-center gap-3 border-b py-4 text-sm"
                >
                  <span className="bg-accent-dim/60 h-px w-4 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-fg-muted max-w-[62ch] text-pretty">{copy.discretionBody}</p>
          </div>
        </div>
      </Section>

      {/* --- Oportunidades reservadas -------------------------------------- */}
      <Section width="wide" divider>
        <SectionHeading
          eyebrow={copy.eyebrow}
          heading={copy.offMarketHeading}
          lede={copy.offMarketLede}
        />

        <ul className="border-line mt-14 grid border-t sm:grid-cols-2 lg:grid-cols-3">
          {reserved.items.map((opportunity) => {
            const category = allCategories.find((c) => c.id === opportunity.categoryId);

            return (
              <li
                key={opportunity.id}
                className="border-line flex flex-col gap-5 border-b py-8 sm:px-8 sm:first:pl-0 lg:not-first:border-l"
              >
                <div className="relative">
                  <EditorialImage
                    media={opportunity.media[0]}
                    ratio="3/2"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="opacity-40"
                  />
                  {/* El velo no es decorativo: comunica que hay algo detrás
                      que no se está mostrando. */}
                  <div className="absolute inset-0 grid place-items-center">
                    <Tag tone="champagne">{dict.tags.reserved}</Tag>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {category ? (
                    <span className="eyebrow text-fg-muted text-[0.5625rem]">
                      {localized(category.name, locale)}
                    </span>
                  ) : null}
                  {opportunity.isDemo ? <DemoTag /> : null}
                </div>

                <h3 className="font-display text-xl text-balance">
                  {localized(opportunity.title, locale)}
                </h3>

                <p className="text-fg-muted/80 text-sm text-pretty">
                  {localized(opportunity.summary, locale)}
                </p>

                <dl className="text-fg-muted/60 mt-auto flex flex-wrap gap-x-5 gap-y-1 text-xs">
                  <div className="flex gap-1.5">
                    <dt>{dict.opportunity.location}:</dt>
                    <dd>{formatCountry(opportunity.location.country, locale)}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt>{dict.opportunity.reference}:</dt>
                    <dd data-numeric>{opportunity.reference}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 flex justify-center">
          <Button href={localizePath("/private/request", locale)} variant="accent" size="lg">
            {copy.cta}
            <ArrowEast />
          </Button>
        </div>
      </Section>
    </>
  );
}
