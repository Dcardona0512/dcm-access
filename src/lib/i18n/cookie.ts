import { cookies } from "next/headers";

import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";

/**
 * El idioma de quien mira, fuera de las rutas que lo llevan en la URL.
 *
 * El sitio público lo toma del primer segmento (`/es`, `/en`). Las pantallas
 * que no viven bajo un idioma —entrar, registrarse, los paneles— leen la misma
 * cookie que el proxy ya escribe cuando alguien visita una u otra versión. Así
 * quien navega el sitio en inglés y pulsa «Sign in» sigue en inglés, sin
 * duplicar ninguna ruta.
 *
 * Sin cookie, español: es el mercado.
 */
export async function localeDeCookie(): Promise<Locale> {
  const valor = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(valor) ? valor : defaultLocale;
}
