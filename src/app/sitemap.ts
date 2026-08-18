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
  const { opportunities, providers } = getRepositories();

  const [published, approved] = await Promise.all([
    opportunities.allPublished(),
    providers.listApproved(),
  ]);

  type Entry = {
    readonly path: string;
    readonly priority: number;
    readonly changeFrequency: "daily" | "weekly" | "monthly";
    readonly lastModified?: Date;
  };

  const staticPaths: readonly Entry[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/opportunities", priority: 0.9, changeFrequency: "daily" },
    ...verticals.map((vertical) => ({
      path: `/${vertical}`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    })),
    { path: "/private", priority: 0.7, changeFrequency: "weekly" },
    { path: "/private/request", priority: 0.7, changeFrequency: "monthly" },
    { path: "/brokerage", priority: 0.7, changeFrequency: "monthly" },
    { path: "/partners", priority: 0.7, changeFrequency: "weekly" },
    { path: "/partners/apply", priority: 0.6, changeFrequency: "monthly" },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
    ...legalSlugs.map((slug) => ({
      path: `/legal/${slug}`,
      priority: 0.2,
      changeFrequency: "monthly" as const,
    })),
  ];

  const dynamicPaths: readonly Entry[] = [
    ...published.map((opportunity) => ({
      path: `/opportunities/${opportunity.slug}`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
      lastModified: new Date(opportunity.updatedAt),
    })),
    ...approved.map((provider) => ({
      path: `/partners/${provider.slug}`,
      priority: 0.6,
      changeFrequency: "monthly" as const,
      lastModified: provider.approvedAt ? new Date(provider.approvedAt) : undefined,
    })),
  ];

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
