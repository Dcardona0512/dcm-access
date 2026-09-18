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
 * `path` es la ruta SIN el prefijo de idioma: "/motors", "/".
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
  /**
   * Imagen propia de esta página, cuando la tiene.
   *
   * Solo la usan las fichas: al pegar el enlace en WhatsApp, lo que se ve es
   * el carro o el apartamento, no la tarjeta de marca. Sin ella, todas las
   * páginas comparten la misma tarjeta —que es lo correcto para las que no
   * tienen fotografía propia.
   */
  readonly image?: { readonly url: string; readonly alt: string };
};

export function buildMetadata({
  locale,
  path,
  title,
  description,
  noIndex = false,
  image,
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
     * `openGraph` SOLO se declara cuando la página trae imagen propia. Es
     * deliberado y cuesta explicarlo, así que queda escrito:
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
     * Y cuando SÍ hay imagen propia —las fichas, que enseñan su fotografía—
     * se aprovecha justo ese comportamiento: declarar el bloque apaga la
     * herencia, que es exactamente lo que hace falta para que WhatsApp no
     * muestre la tarjeta de marca en lugar del carro. El título y la
     * descripción se repiten dentro a propósito: al declarar el bloque, Next
     * deja de derivarlos.
     *
     * VA POR PROPAGACIÓN CONDICIONAL Y NO POR `openGraph: image ? … :
     * undefined`. No es estilo: Next recorre las CLAVES del objeto, así que
     * una clave presente con valor `undefined` sí entra en el reparto y
     * sobrescribe con nada lo que venía del layout. Se vio en producción —
     * `/es/motors` se quedó sin una sola etiqueta de vista previa—. Sin la
     * clave, no hay nada que sobrescribir.
     */
    ...(image
      ? {
          openGraph: {
            title,
            description,
            url: canonical,
            images: [{ url: image.url, width: 1200, height: 900, alt: image.alt }],
          },
          twitter: {
            card: "summary_large_image" as const,
            title,
            description,
            images: [image.url],
          },
        }
      : {}),
    /*
      Mismo motivo que arriba: `robots: undefined` no es «no opino», es
      «bórralo», y dejaba a todo el sitio sin la etiqueta `index, follow` que
      declara el layout. Solo se habla de robots cuando hay algo que decir.
    */
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
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
    // Sin `potentialAction`: ya no hay una búsqueda global a la que apuntar, y
    // declarar un SearchAction cuyo destino ignora el término sería mentir en
    // los datos estructurados.
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
