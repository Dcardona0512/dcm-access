import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

/**
 * robots.txt (§27).
 *
 * El CRM y el área de cliente quedan fuera del índice. Las fichas reservadas
 * ya se excluyen una a una con `noindex` desde su propio `generateMetadata`,
 * porque comparten prefijo de ruta con las públicas.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/es/account", "/en/account", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
