import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { getDictionary } from "@/content";
import { legalSlugs } from "@/content/shared";
import { isLocale, localizePath, locales } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return locales.flatMap((locale) => legalSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);
  const document = dict.legal.documents.find((entry) => entry.slug === slug);
  if (!document) return {};

  return buildMetadata({
    locale,
    path: `/legal/${slug}`,
    title: document.title,
    description: document.summary,
    // Documentos en borrador: no tiene sentido posicionarlos todavía.
    noIndex: true,
  });
}

/**
 * Documentos legales (§26).
 *
 * Son una estructura base, y el sitio lo dice en voz alta: el aviso de
 * borrador va arriba del todo, no escondido al pie. Presentar textos legales
 * sin revisar como si fueran definitivos sería precisamente el tipo de
 * afirmación no verificada que §17 y §48 prohíben.
 */
export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const document = dict.legal.documents.find((entry) => entry.slug === slug);
  if (!document) notFound();

  return (
    <Container width="default" as="div">
      <div className="grid gap-14 pt-36 pb-(--spacing-section) md:pt-44 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-20">
        <nav aria-label={dict.legal.heading} className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow tone="muted">{dict.legal.heading}</Eyebrow>
          <ul className="mt-5 flex flex-col gap-2.5">
            {dict.legal.documents.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={localizePath(`/legal/${entry.slug}`, locale)}
                  aria-current={entry.slug === slug ? "page" : undefined}
                  className={cn(
                    "text-sm transition-colors",
                    entry.slug === slug ? "text-accent" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="flex flex-col gap-10">
          <header className="flex flex-col gap-5">
            <h1 className="font-display text-display-3 text-balance">{document.title}</h1>
            <p className="text-fg-muted max-w-[62ch] text-pretty">{document.summary}</p>

            <p className="border-pending/40 bg-pending/[0.06] text-pending rounded-(--radius-card) border px-4 py-3 text-sm text-pretty">
              {dict.legal.draftNotice}
            </p>
          </header>

          <div className="flex flex-col gap-8">
            {document.sections.map((section) => (
              <section key={section.heading} className="flex flex-col gap-3">
                <h2 className="font-display text-xl">{section.heading}</h2>
                <p className="text-fg-muted max-w-[70ch] leading-relaxed text-pretty">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </Container>
  );
}
