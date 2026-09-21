import type { MetadataRoute } from "next";

import { legalSlugs } from "@/content/shared";
import { getRepositories } from "@/lib/data";
import { verticals } from "@/lib/domain/types";
import { defaultLocale, localeMeta, locales } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/seo";

/**
 * Sitemap (§27).
 *
 * Se genera desde los repositorios, así que no hay una lista de URLs que
 * mantener a mano y no puede quedarse obsoleta. Cada entrada declara sus
 * alternativas por idioma, que es lo que hace que el SEO internacional
 * funcione de verdad y no solo esté "preparado".
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { opportunities } = getRepositories();
  const published = await opportunities.allPublished();

  type Entry = {
    readonly path: string;
    readonly priority: number;
    readonly changeFrequency: "daily" | "weekly" | "monthly";
    readonly lastModified?: Date;
  };

  const staticPaths: readonly Entry[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    ...verticals.map((vertical) => ({
      path: `/${vertical}`,
      priority: 0.9,
      changeFrequency: "daily" as const,
    })),
    // La entrada de la oferta: es la página que trae inventario, así que pesa
    // más que el resto de las estáticas.
    { path: "/sell", priority: 0.8, changeFrequency: "monthly" },
    { path: "/motors/sell", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
    ...legalSlugs.map((slug) => ({
      path: `/legal/${slug}`,
      priority: 0.2,
      changeFrequency: "monthly" as const,
    })),
  ];

  // Cada ficha vive dentro de su categoría: no hay catálogo general.
  const dynamicPaths: readonly Entry[] = published.map((opportunity) => ({
    path: `/${opportunity.vertical}/${opportunity.slug}`,
    priority: 0.8,
    changeFrequency: "weekly" as const,
    lastModified: new Date(opportunity.updatedAt),
  }));

  const alternates = (path: string) => ({
    languages: Object.fromEntries(
      locales.map((locale) => [
        localeMeta[locale].hreflang,
        `${siteUrl}/${locale}${path === "/" ? "" : path}`,
      ]),
    ),
  });

  return [...staticPaths, ...dynamicPaths].flatMap((entry) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${entry.path === "/" ? "" : entry.path}`,
      lastModified: entry.lastModified ?? new Date(),
      changeFrequency: entry.changeFrequency,
      // El idioma por defecto pesa algo más; el resto son alternativas.
      priority: locale === defaultLocale ? entry.priority : entry.priority * 0.9,
      alternates: alternates(entry.path),
    })),
  );
}
