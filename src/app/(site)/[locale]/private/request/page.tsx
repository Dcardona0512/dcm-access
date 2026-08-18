import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PrivateRequestForm } from "@/components/forms/PrivateRequestForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { getDictionary } from "@/content";
import { isVertical } from "@/lib/domain/types";
import { isLocale } from "@/lib/i18n/config";
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
    path: "/private/request",
    title: dict.privateRequest.heading,
    description: dict.privateRequest.lede,
  });
}

/**
 * Request an Opportunity (§21). Cada envío crea un lead con
 * `source: "private_request"` y su nivel de confidencialidad.
 */
export default async function PrivateRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const copy = dict.privateRequest;

  // La vertical puede venir preseleccionada desde una landing de categoría.
  const sp = await searchParams;
  const raw = Array.isArray(sp.vertical) ? sp.vertical[0] : sp.vertical;
  const defaultVertical = isVertical(raw) ? raw : undefined;

  return (
    <Container width="wide" as="div">
      <div className="grid gap-14 pt-36 pb-(--spacing-section) md:pt-44 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-20">
        <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-5">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1 className="font-display text-display-2 text-balance">{copy.heading}</h1>
            <p className="text-lede text-fg-muted max-w-[46ch] text-pretty">{copy.lede}</p>
          </div>

          <div className="border-line flex flex-col gap-4 border-t pt-8">
            <Eyebrow tone="muted">{copy.examplesHeading}</Eyebrow>
            <ul className="flex flex-col gap-3">
              {copy.examples.map((example) => (
                <li key={example} className="text-fg-muted/80 font-display text-lg text-pretty">
                  “{example}”
                </li>
              ))}
            </ul>
          </div>
        </div>

        <PrivateRequestForm locale={locale} dict={dict} defaultVertical={defaultVertical} />
      </div>
    </Container>
  );
}
