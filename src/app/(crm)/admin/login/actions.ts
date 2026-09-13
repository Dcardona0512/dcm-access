"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isAllowed } from "@/lib/auth/admin";
import { createSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

/* ============================================================================
   ENTRADA AL PANEL
   ----------------------------------------------------------------------------
   Se pide un enlace y se abre. Lo que no se hace es decir si el correo estaba
   o no en la lista: responder "ese correo no tiene acceso" convierte el
   formulario en un detector de administradores. El mensaje es el mismo se
   envíe o no el enlace, y el enlace solo sale de verdad para quien figura en
   la lista.
   ========================================================================== */

export type LoginState = { readonly status: "idle" | "sent" | "error"; readonly message?: string };

export async function requestMagicLink(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Supabase no está configurado en este entorno." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { status: "error", message: "Escriba un correo válido." };
  }

  const store = await headers();
  const ip = store.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  const limit = checkRateLimit(`admin-login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return { status: "error", message: "Demasiados intentos. Espere unos minutos." };
  }

  // Éxito aparente para cualquier correo: no se confirma quién es administrador.
  if (!isAllowed(email)) {
    return { status: "sent" };
  }

  const origin = store.get("origin") ?? `https://${store.get("host") ?? "localhost:3000"}`;
  const supabase = await createSessionClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/admin/auth/callback`,
      // Nadie se registra por su cuenta: la cuenta la crea este enlace, y solo
      // llega a quien ya estaba autorizado.
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { status: "error", message: "No se pudo enviar el enlace. Inténtelo de nuevo." };
  }

  return { status: "sent" };
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
