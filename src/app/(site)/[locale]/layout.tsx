import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DemoNotice } from "@/components/layout/DemoNotice";
import { AccessIntro } from "@/components/intro/AccessIntro";
import { AccessIntroGate } from "@/components/intro/AccessIntroGate";
import { getDictionary } from "@/content";
import { brand } from "@/content/shared";
import { isDemoData } from "@/lib/data";
import { fontVariables } from "@/lib/fonts";
import { isLocale, localeMeta, locales, type Locale } from "@/lib/i18n/config";
import { alternatesFor, jsonLd, organizationSchema, siteUrl, websiteSchema } from "@/lib/seo";

import "@/app/globals.css";

/**
 * Raíz del sitio público. El CRM en `/admin` tiene su propia raíz, por eso el
 * proyecto usa layouts raíz múltiples: es la única forma de que `<html lang>`
 * refleje el idioma real sin renunciar al renderizado estático (§28).
 */

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${brand.name} — ${dict.meta.homeTitle}`,
      template: `%s — ${brand.name}`,
    },
    description: dict.meta.siteDescription,
    applicationName: brand.name,
    alternates: alternatesFor("/"),
    openGraph: {
      type: "website",
      siteName: brand.name,
      locale: localeMeta[locale].hreflang,
    },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <html
      lang={localeMeta[locale].hreflang}
      dir={localeMeta[locale].dir}
      className={fontVariables}
      /**
       * El guardián de la introducción escribe `data-intro` en este elemento
       * durante el parseo, antes de que React hidrate. Es deliberado: la
       * decisión depende de `sessionStorage`, que el servidor no puede conocer,
       * y hacerlo después provocaría un destello de la página antes de la
       * cortina.
       *
       * Esto suprime el aviso ÚNICAMENTE para los atributos de <html>. No
       * afecta a `<body>` ni a nada más abajo, así que cualquier desajuste real
       * en el árbol se seguiría reportando.
       */
      suppressHydrationWarning
    >
      <body className="bg-surface text-fg font-sans antialiased">
        {/* Debe ir primero: se ejecuta durante el parseo, antes de pintar. */}
        <AccessIntroGate />

        <a
          href="#main"
          className="eyebrow bg-accent text-surface sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-3"
        >
          {dict.common.skipToContent}
        </a>

        <SiteHeader locale={locale} dict={dict} />

        {/* Compensa la cabecera fija sin empujar el hero, que sangra bajo ella. */}
        <main id="main" className="min-h-dvh">
          {children}
        </main>

        <SiteFooter locale={locale} dict={dict} />

        {isDemoData() ? <DemoNotice dict={dict} /> : null}

        {/* Cortina de entrada. Va al final del body para que el contenido de la
            página ya esté en el documento cuando aparezca (§27, §28). */}
        <AccessIntro descriptor={dict.brand.descriptor} />

        <script
          type="application/ld+json"
          // Datos estructurados de organización y sitio, presentes en todas las rutas.
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema(dict.meta.siteDescription, dict.brand.tagline)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(websiteSchema(locale, dict.meta.siteDescription)),
          }}
        />
      </body>
    </html>
  );
}
