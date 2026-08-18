import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { getDictionary } from "@/content";
import { contact } from "@/content/shared";
import { isLocale, localizePath } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

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
    path: "/contact",
    title: dict.contact.heading,
    description: dict.contact.lede,
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <Container width="default" as="div">
      <div className="grid gap-14 pt-36 pb-(--spacing-section) md:pt-44 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20">
        <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-5">
            <Eyebrow>{dict.contact.eyebrow}</Eyebrow>
            <h1 className="font-display text-display-2 text-balance">{dict.contact.heading}</h1>
            <p className="text-fg-muted max-w-[44ch] text-pretty">{dict.contact.lede}</p>
          </div>

          <div className="border-line flex flex-col gap-4 border-t pt-8">
            <Eyebrow tone="muted">{dict.footer.contactHeading}</Eyebrow>
            <a
              href={`mailto:${contact.email}`}
              className="text-fg hover:text-accent text-sm transition-colors"
            >
              {contact.email}
            </a>
            <Link
              href={localizePath("/private/request", locale)}
              className="eyebrow text-accent hover:text-fg w-fit transition-colors"
            >
              {dict.privateRequest.eyebrow}
            </Link>
          </div>
        </div>

        <ContactForm locale={locale} dict={dict} />
      </div>
    </Container>
  );
}
