import { NextResponse, type NextRequest } from "next/server";

import { isLocale, locales, LOCALE_COOKIE, matchLocale } from "@/lib/i18n/config";

/**
 * Negociación de locale (§25).
 *
 * Toda ruta pública vive bajo `/{locale}`. Si la URL no trae locale, se elige
 * por cookie (preferencia explícita del usuario) y, en su defecto, por
 * `Accept-Language`. `/admin` queda fuera: el CRM interno no se traduce.
 *
 * La preferencia también se PERSISTE aquí. Visitar `/en/...` es la forma en
 * que el usuario ejerce su elección —el selector de idioma no es más que un
 * enlace a esa ruta—, así que la cookie la escribe el servidor y el cliente no
 * necesita tocar `document.cookie` ni cargar JavaScript para ello.
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const current = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (current) {
    const response = NextResponse.next();

    if (request.cookies.get(LOCALE_COOKIE)?.value !== current) {
      response.cookies.set(LOCALE_COOKIE, current, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }

    return response;
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : matchLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  // 307: la negociación depende de cabeceras, no debe cachearse como permanente.
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: [
    /**
     * Todo excepto: rutas internas de Next, el CRM en /admin, los archivos de
     * SEO servidos en la raíz y cualquier ruta con extensión (assets).
     */
    "/((?!_next|admin|api|favicon.ico|icon.svg|apple-icon.png|robots.txt|sitemap.xml|manifest.webmanifest|media|.*\\.).*)",
  ],
};
