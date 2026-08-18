import type { Metadata } from "next";

import { brand } from "@/content/shared";
import { defaultLocale, localeMeta, locales, type Locale } from "@/lib/i18n/config";

/* ============================================================================
   SEO (§27)
   ----------------------------------------------------------------------------
   SEO internacional desde el principio: cada página declara sus alternativas
   por idioma y su canónica. `buildMetadata` centraliza esa mecánica para que
   ninguna ruta se olvide de la mitad.
   ========================================================================== */

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Construye `alternates` con hreflang para los dos idiomas más `x-default`.
 * `path` es la ruta SIN el prefijo de idioma: "/opportunities", "/".
 */
export function alternatesFor(path: string) {
  const clean = path === "/" ? "" : path;

  const languages = Object.fromEntries(
    locales.map((code) => [localeMeta[code].hreflang, `${siteUrl}/${code}${clean}`]),
  );

  return {
    languages: {
      ...languages,
      "x-default": `${siteUrl}/${defaultLocale}${clean}`,
    },
  };
}

type BuildMetadataInput = {
  readonly locale: Locale;
  /** Ruta sin prefijo de idioma. */
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly noIndex?: boolean;
};

/*
 * Sin `image` ni `type`: ninguno tenía efecto una vez retirado el bloque
 * `openGraph` (ver abajo), y un parámetro que se acepta pero se ignora es peor
 * que no tenerlo. La imagen se resuelve por convención de archivo; el tipo lo
 * fija el layout.
 */

export function buildMetadata({
  locale,
  path,
  title,
  description,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const canonical = `${siteUrl}/${locale}${path === "/" ? "" : path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      ...alternatesFor(path),
    },
    /**
     * AQUÍ NO SE DECLARA `openGraph` NI `twitter`. Es deliberado y cuesta
     * explicarlo, así que queda escrito:
     *
     * `opengraph-image.tsx` vive en el segmento `[locale]`, y Next lo hereda a
     * todas las rutas hijas — MIENTRAS ninguna declare su propio `openGraph`.
     * En cuanto una lo hace, Next da por resuelta la lista de imágenes de esa
     * ruta y deja de fusionar la del archivo. Con el bloque puesto, la portada
     * era la única página con tarjeta social: el resto compartía sin
     * previsualización mientras `twitter:card` prometía `summary_large_image`.
     * Comprobado ruta por ruta.
     *
     * Sin el bloque, Next deriva `og:title` y `og:description` de `title` y
     * `description` de aquí arriba, hereda `og:site_name`, `og:locale` y
     * `og:type` del layout, y añade la imagen con su tipo, ancho, alto y alt.
     * La tarjeta de Twitter se completa sola a partir de lo mismo.
     *
     * Lo único que se pierde es `og:url`, que la canónica de arriba ya declara
     * — mal negocio sería cambiar eso por la imagen en todo el sitio.
     *
     * Si algún día una ruta necesita imagen PROPIA, no basta con pasarla por
     * `image`: hay que darle a esa ruta su propio `opengraph-image.tsx`, que
     * es el mecanismo que Next respeta sin efectos colaterales.
     */
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

/* --- Datos estructurados ---------------------------------------------------- */

/** Serializa un objeto JSON-LD evitando la ruptura de `</script>`. */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationSchema(description: string, slogan: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    alternateName: "DCM",
    url: siteUrl,
    logo: absoluteUrl("/icon.svg"),
    description,
    slogan,
    foundingLocation: { "@type": "Place", name: "Colombia" },
    areaServed: ["CO", "US", "ES", "GB", "AE"],
  };
}

export function websiteSchema(locale: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.name,
    url: `${siteUrl}/${locale}`,
    description,
    inLanguage: localeMeta[locale].hreflang,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/${locale}/opportunities?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(
  locale: Locale,
  trail: readonly { readonly name: string; readonly path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}/${locale}${item.path === "/" ? "" : item.path}`,
    })),
  };
}
