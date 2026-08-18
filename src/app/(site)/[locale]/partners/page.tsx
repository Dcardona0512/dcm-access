import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowEast, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import { DemoTag, VerificationBadge } from "@/components/ui/Tag";
import { getDictionary } from "@/content";
import { getRepositories } from "@/lib/data";
import { verticalLabels } from "@/lib/domain/labels";
import { localized } from "@/lib/domain/types";
import { formatLocation } from "@/lib/format";
import { isLocale, localizePath } from "@/lib/i18n/config";
import { breadcrumbSchema, buildMetadata, jsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

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
    path: "/partners",
    title: dict.partners.heading,
    description: dict.partners.lede,
  });
}

/** Become a DCM ACCESS Partner (§18, §19). */
export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const copy = dict.partners;

  const { providers } = getRepositories();
  const approved = await providers.listApproved();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema(locale, [
              { name: "DCM ACCESS", path: "/" },
              { name: copy.heading, path: "/partners" },
            ]),
          ),
        }}
      />

      <section className="pt-36 pb-16 md:pt-44">
        <Container width="wide">
          <div className="flex max-w-4xl flex-col gap-6">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1 className="font-display text-display-1 text-balance">{copy.heading}</h1>
            <p className="text-lede text-fg-muted max-w-[56ch] text-pretty">{copy.lede}</p>
            <div className="pt-2">
              <Button href={localizePath("/partners/apply", locale)} variant="accent" size="lg">
                {copy.cta}
                <ArrowEast />
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* --- Beneficios ---------------------------------------------------- */}
      <Section surface="raised" width="wide" divider>
        <SectionHeading heading={copy.benefitsHeading} size="sm" />

        <div className="border-line mt-12 grid border-t sm:grid-cols-2 lg:grid-cols-4">
          {copy.benefits.map((benefit, index) => (
            <div
              key={benefit.key}
              className={cn(
                "border-line flex flex-col gap-3 border-b py-8",
                index > 0 && "lg:border-l lg:pl-8",
                index < copy.benefits.length - 1 && "lg:pr-8",
              )}
            >
              <h3 className="font-display text-xl">{benefit.title}</h3>
              <p className="text-fg-muted max-w-[34ch] text-sm text-pretty">{benefit.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* --- Con quién trabajamos + curaduría ------------------------------ */}
      <Section width="wide" divider>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
          <div className="flex flex-col gap-6">
            <SectionHeading heading={copy.whoHeading} size="sm" />
            <ul className="border-line border-t">
              {copy.who.map((entry) => (
                <li
                  key={entry}
                  className="border-line text-fg-muted flex items-center gap-3 border-b py-3.5 text-sm"
                >
                  <span className="bg-accent-dim/60 h-px w-4 shrink-0" aria-hidden="true" />
                  {entry}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6 lg:pt-2">
            <SectionHeading heading={copy.curationHeading} size="sm" />
            <p className="text-fg-muted max-w-[56ch] leading-relaxed text-pretty">
              {copy.curationBody}
            </p>
            <div className="pt-2">
              <Button href={localizePath("/partners/apply", locale)} size="lg">
                {copy.cta}
                <ArrowEast />
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* --- Directorio de proveedores aprobados (§19) --------------------- */}
      <Section width="wide" divider>
        <SectionHeading
          eyebrow={copy.eyebrow}
          heading={copy.directoryHeading}
          lede={copy.directoryLede}
        />

        {approved.length === 0 ? (
          <EmptyState className="mt-12" heading={copy.directoryEmpty} />
        ) : (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {approved.map((provider) => (
              <li key={provider.id}>
                <Link
                  href={localizePath(`/partners/${provider.slug}`, locale)}
                  className="border-line hover:border-fg-muted/50 group flex h-full flex-col gap-4 rounded-(--radius-card) border p-6 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl text-balance transition-colors group-hover:text-accent">
                      {provider.name}
                    </h3>
                    {provider.isDemo ? <DemoTag /> : null}
                  </div>

                  <p className="text-fg-muted line-clamp-3 text-sm text-pretty">
                    {localized(provider.description, locale)}
                  </p>

                  <div className="mt-auto flex flex-col gap-3 pt-2">
                    <div className="text-fg-muted/70 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      {provider.verticals.map((vertical) => (
                        <span key={vertical} className="eyebrow text-[0.5rem]">
                          {localized(verticalLabels[vertical], locale)}
                        </span>
                      ))}
                    </div>

                    <div className="border-line-soft flex items-center justify-between gap-3 border-t pt-3">
                      <span className="text-fg-muted/70 text-xs">
                        {provider.locations[0]
                          ? formatLocation(provider.locations[0], locale)
                          : null}
                      </span>
                      <VerificationBadge status={provider.verification} dict={dict} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
