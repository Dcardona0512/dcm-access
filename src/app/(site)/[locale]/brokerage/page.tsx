import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { ArrowEast, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import { getDictionary } from "@/content";
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
    path: "/brokerage",
    title: dict.brokerage.eyebrow,
    description: dict.brokerage.lede,
  });
}

/**
 * DCM BROKERAGE (§17).
 *
 * Explica el proceso y, sobre todo, delimita el alcance: §17 pide no hacer
 * afirmaciones legales sin verificar, así que la sección "qué significa y qué
 * no" es parte del contenido principal, no letra pequeña al pie.
 */
export default async function BrokeragePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const copy = dict.brokerage;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema(locale, [
              { name: "DCM ACCESS", path: "/" },
              { name: copy.eyebrow, path: "/brokerage" },
            ]),
          ),
        }}
      />

      <section className="pt-36 pb-16 md:pt-44">
        <Container width="wide">
          <div className="flex max-w-4xl flex-col gap-6">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1 className="font-display text-display-1 text-balance">{copy.heading}</h1>
            <p className="text-lede text-fg-muted max-w-[58ch] text-pretty">{copy.lede}</p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button href={localizePath("/private/request", locale)} size="lg">
                {copy.cta}
                <ArrowEast />
              </Button>
              <Button href={localizePath("/opportunities", locale)} variant="outline" size="lg">
                {dict.common.explore}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <ProcessSteps locale={locale} dict={dict} variant="page" />

      {/* --- Alcance real del servicio (§17, §26) -------------------------- */}
      <Section surface="inverse" width="wide" divider>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-24">
          <SectionHeading heading={copy.scopeHeading} size="sm" onInverse />
          <p className="text-inverse-muted max-w-[68ch] leading-relaxed text-pretty">{copy.scopeBody}</p>
        </div>
      </Section>

      <Section width="wide">
        <div className="flex flex-col items-center gap-8 text-center">
          <Eyebrow>{dict.privateRequest.eyebrow}</Eyebrow>
          <h2 className="font-display text-display-2 max-w-[20ch] text-balance">
            {dict.privateRequest.heading}
          </h2>
          <p className="text-fg-muted max-w-[54ch] text-pretty">{dict.privateRequest.lede}</p>
          <Button href={localizePath("/private/request", locale)} variant="accent" size="lg">
            {dict.privateRequest.submit}
            <ArrowEast />
          </Button>
        </div>
      </Section>
    </>
  );
}
