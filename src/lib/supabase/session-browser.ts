"use client";

import { createBrowserClient as crear } from "@supabase/ssr";

/**
 * Cliente del navegador CON sesión.
 *
 * Distinto del de subidas, que vive al lado y no toca cookies: este escribe las
 * mismas cookies de sesión que lee el servidor, y es lo que permite rematar en
 * el navegador un acceso que llegó por el fragmento de la URL —el trozo
 * después de `#`, que nunca viaja al servidor—.
 */
export function createSessionBrowserClient() {
  return crear(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
