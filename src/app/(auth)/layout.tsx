import type { Metadata } from "next";
import type { ReactNode } from "react";

import { fontVariables } from "@/lib/fonts";
import { localeDeCookie } from "@/lib/i18n/cookie";
import { localeMeta } from "@/lib/i18n/config";

import "@/app/globals.css";

/* ============================================================================
   RAÍZ DE LAS PANTALLAS DE ACCESO
   ----------------------------------------------------------------------------
   Entrar y registrarse viven FUERA de `/[locale]`: una sesión no es contenido
   traducible, y duplicarla en dos idiomas daría dos direcciones para la misma
   pantalla, dos destinos de vuelta de Google y dos sitios donde equivocarse.

   El texto sí se traduce, pero el idioma sale de la cookie que el propio sitio
   escribe al visitar `/es` o `/en`, no de la URL.

   Tiene su propio `<html>` porque con varias raíces —el sitio, el panel y
   esto— ninguna hereda de otra.
   ========================================================================== */

export const metadata: Metadata = {
  // Una pantalla de acceso no aporta nada a un buscador y sí expone superficie.
  robots: { index: false, follow: false },
};

export default async function AuthLayout({ children }: { readonly children: ReactNode }) {
  const locale = await localeDeCookie();

  return (
    <html lang={localeMeta[locale].hreflang} className={fontVariables}>
      <body className="bg-surface text-fg font-sans antialiased">
        <main className="grid min-h-dvh place-items-center px-6 py-16">{children}</main>
      </body>
    </html>
  );
}
