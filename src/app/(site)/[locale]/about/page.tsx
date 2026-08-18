import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Logo } from "@/components/brand/Logo";
import { ArrowEast, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import { getDictionary } from "@/content";
import { isLocale, localizePath } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo";
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
    path: "/about",
    title: dict.about.heading,
    description: dict.about.lede,
  });
}

/**
 * About (§1, §4, §47).
 *
 * Cuenta el origen y el modelo sin atribuirse operaciones, oficinas ni
 * trayectoria que no existan (§7, §48).
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const copy = dict.about;

  return (
    <>
      <section className="pt-36 pb-16 md:pt-44">
        <Container width="wide">
          <div className="flex max-w-4xl flex-col gap-6">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1 className="font-display text-display-1 text-balance">{copy.heading}</h1>
            <p className="text-lede text-fg-muted max-w-[58ch] text-pretty">{copy.lede}</p>
          </div>
        </Container>
      </section>

      <Section surface="raised" width="wide" divider>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
          <div className="flex flex-col gap-6">
            <SectionHeading heading={copy.originHeading} size="sm" />
            {copy.originBody.map((paragraph, index) => (
              <p key={index} className="text-fg-muted max-w-[58ch] leading-relaxed text-pretty">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <SectionHeading heading={copy.modelHeading} size="sm" />
            {copy.modelBody.map((paragraph, index) => (
              <p key={index} className="text-fg-muted max-w-[58ch] leading-relaxed text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section width="wide" divider>
        <SectionHeading heading={copy.principlesHeading} size="sm" />

        <div className="border-line mt-12 grid border-t sm:grid-cols-2">
          {copy.principles.map((principle, index) => (
            <div
              key={principle.key}
              className={cn(
                "border-line flex flex-col gap-3 border-b py-8",
                index % 2 === 1 && "sm:border-l sm:pl-10",
                index % 2 === 0 && "sm:pr-10",
              )}
            >
              <h3 className="font-display text-xl">{principle.title}</h3>
              <p className="text-fg-muted max-w-[46ch] text-sm text-pretty">{principle.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* --- Frase central (§47) ------------------------------------------- */}
      <Section width="narrow">
        <div className="flex flex-col items-center gap-10 text-center">
          <Logo variant="stacked" className="text-fg" />
          <p className="font-display text-display-3 max-w-[22ch] text-balance">
            {dict.brand.tagline
              .toLocaleLowerCase(locale)
              .replace(/^./, (character) => character.toLocaleUpperCase(locale))}
          </p>
          <p className="eyebrow text-accent">{dict.brand.signature}</p>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button href={localizePath("/private/request", locale)} variant="accent" size="lg">
              {dict.common.requestAccess}
              <ArrowEast />
            </Button>
            <Button href={localizePath("/contact", locale)} variant="outline" size="lg">
              {dict.contact.heading}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
