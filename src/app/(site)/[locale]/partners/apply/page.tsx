import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PartnerApplicationForm } from "@/components/forms/PartnerApplicationForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { getDictionary } from "@/content";
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
    path: "/partners/apply",
    title: dict.partnerApply.heading,
    description: dict.partnerApply.lede,
  });
}

export default async function PartnerApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <Container width="default" as="div">
      <div className="flex flex-col gap-12 pt-36 pb-(--spacing-section) md:pt-44">
        <div className="flex max-w-2xl flex-col gap-5">
          <Eyebrow>{dict.partners.eyebrow}</Eyebrow>
          <h1 className="font-display text-display-2 text-balance">{dict.partnerApply.heading}</h1>
          <p className="text-lede text-fg-muted text-pretty">{dict.partnerApply.lede}</p>
        </div>

        <PartnerApplicationForm locale={locale} dict={dict} />
      </div>
    </Container>
  );
}
