import { Monograma } from "@/components/brand/Monograma";
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
          {/*
            Aquí había dos hojas dibujadas a mano: el resto del símbolo viejo,
            que sobrevivió al cambio de marca porque esta página no pasa por
            ningún layout y nadie la mira. Ahora lleva el monograma, que es lo
            que llevan los demás sitios donde solo cabe la marca pequeña.
          */}
          <Monograma className="text-accent text-3xl opacity-60" />

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
