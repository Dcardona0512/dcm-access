"use server";

import { isAuthError } from "@supabase/supabase-js";

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

/**
 * Traduce el fallo de Supabase a algo accionable.
 *
 * Antes todo error —tope de correos, proveedor apagado, dirección rechazada—
 * salía como "Inténtelo de nuevo", que es el consejo exactamente contrario al
 * correcto cuando el problema es haber insistido demasiado. Un mensaje que no
 * distingue causas no es prudencia: es esconder la causa.
 */
function describe(code: string | undefined): string {
  switch (code) {
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Se pidieron varios enlaces seguidos y el proveedor de correo cerró el envío por un rato. Espere unos minutos y pida uno solo.";
    case "email_address_invalid":
      return "El proveedor de correo rechazó esa dirección.";
    case "otp_disabled":
    case "email_provider_disabled":
    case "signup_disabled":
      return "El acceso por enlace está desactivado en Supabase. Revise la configuración de autenticación.";
    default:
      return "No se pudo enviar el enlace. Inténtelo de nuevo.";
  }
}

/** "Espere unos minutos" no dice cuántos. Esto sí. */
function formatWait(seconds: number): string {
  if (seconds <= 90) return `${Math.max(seconds, 1)} segundos`;
  const minutes = Math.ceil(seconds / 60);
  return minutes === 1 ? "un minuto" : `${minutes} minutos`;
}

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

  // Este freno corre ANTES de mirar la lista, así que su mensaje lo ve
  // cualquiera: no distingue administradores de desconocidos.
  const limit = checkRateLimit(`admin-login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return {
      status: "error",
      message: `Demasiados intentos. Vuelva a intentarlo en ${formatWait(limit.retryAfter)}.`,
    };
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
    const code = isAuthError(error) ? error.code : undefined;

    // Sin el correo: lo que hace falta para diagnosticar es el código, y la
    // dirección no pinta nada en un registro que queda escrito.
    console.error("[admin-login] signInWithOtp falló", {
      code,
      status: isAuthError(error) ? error.status : undefined,
      message: error.message,
    });

    return { status: "error", message: describe(code) };
  }

  return { status: "sent" };
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
