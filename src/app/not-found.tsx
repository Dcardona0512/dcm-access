import { fontVariables } from "@/lib/fonts";
import { defaultLocale } from "@/lib/i18n/config";

import "@/app/globals.css";

/**
 * 404 global.
 *
 * Con layouts raíz múltiples no hay un `<html>` heredado que envuelva esta
 * página, así que la renderiza ella misma. En la práctica casi nunca se ve: el
 * proxy antepone el idioma a cualquier ruta, y de ahí en adelante el 404 que
 * responde es el de `(site)/[locale]/not-found.tsx`, que sí está traducido.
 */
export default function GlobalNotFound() {
  return (
    <html lang={defaultLocale} className={fontVariables}>
      <body className="bg-surface text-fg font-sans antialiased">
        <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
          <svg viewBox="0 0 100 100" className="text-accent h-10 w-10 opacity-60" fill="none">
            <path d="M45 8 L7 50 L45 92" stroke="currentColor" strokeWidth="8" />
            <path d="M55 8 L93 50 L55 92" stroke="currentColor" strokeWidth="8" />
          </svg>

          <h1 className="font-display text-4xl">Esta página no existe</h1>
          <p className="text-fg-muted">This page does not exist.</p>

          <a
            href={`/${defaultLocale}`}
            className="eyebrow bg-fg text-surface rounded-(--radius-card) px-6 py-3 transition-colors hover:opacity-90"
          >
            DCM ACCESS
          </a>
        </main>
      </body>
    </html>
  );
}
