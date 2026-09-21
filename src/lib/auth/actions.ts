"use server";

import { redirect } from "next/navigation";

import { createSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Cerrar sesión, desde donde sea.
 *
 * Vive fuera del panel porque ahora hay tres sitios con sesión —el panel, el
 * cliente y el partner— y cerrarla tiene que ser lo mismo en los tres.
 */
export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
