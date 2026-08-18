/**
 * Configuración de internacionalización (§25).
 *
 * Español e inglés están activos. Portugués, francés y árabe están declarados
 * como mercados previstos: añadir uno consiste en moverlo a `locales`, crear su
 * diccionario en `src/content/` y nada más. El campo `dir` existe desde ahora
 * para que el soporte RTL del árabe no obligue a un refactor posterior.
 */

export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

/** Locales previstos pero todavía no traducidos. No se enrutan. */
export const plannedLocales = ["pt", "fr", "ar"] as const;

export const defaultLocale: Locale = "es";

/** Cookie donde se guarda la preferencia explícita del selector de idioma. */
export const LOCALE_COOKIE = "dcm_locale";

type LocaleMeta = {
  /** Etiqueta en su propio idioma, como debe mostrarse en el selector. */
  readonly label: string;
  /** Código BCP 47 para el atributo `lang` y para `hreflang`. */
  readonly hreflang: string;
  readonly dir: "ltr" | "rtl";
};

export const localeMeta: Record<Locale, LocaleMeta> = {
  es: { label: "Español", hreflang: "es", dir: "ltr" },
  en: { label: "English", hreflang: "en", dir: "ltr" },
};

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && locales.includes(value as Locale);
}

/**
 * Elige el mejor locale a partir de la cabecera `Accept-Language`.
 * Ignora los pesos `q` deliberadamente: con dos idiomas, el primer match
 * es suficiente y evita traer un parser completo de RFC 4647.
 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  for (const part of acceptLanguage.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase();
    if (!tag) continue;

    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return defaultLocale;
}

/** Reemplaza el segmento de locale de una ruta, conservando el resto. */
export function localizePath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/");
  // segments[0] es "" porque la ruta empieza por "/".
  if (isLocale(segments[1])) {
    segments[1] = locale;
    return segments.join("/");
  }
  return `/${locale}${pathname === "/" ? "" : pathname}`;
}
