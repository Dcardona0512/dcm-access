"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Cliente del navegador, solo para subir archivos.
 *
 * Lleva la clave PUBLICABLE, que es pública por diseño. Lo que autoriza la
 * subida no es esa clave sino el token firmado que acuña el servidor para cada
 * archivo concreto: sin él, este cliente no puede escribir nada.
 */
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}
