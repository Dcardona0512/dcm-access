import "server-only";

import { createSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";

/* ============================================================================
   ACCESO AL PANEL (§22, §40)
   ----------------------------------------------------------------------------
   Se entra con el correo: Supabase manda un enlace y al abrirlo hay sesión.
   Sin contraseña que recordar, rotar ni filtrar.

   Autenticarse NO es lo mismo que estar autorizado, y aquí la distinción es
   todo el asunto: Supabase Auth deja registrarse a cualquiera con un correo
   válido. Sin esta lista, cualquier persona del planeta que pidiera un enlace
   entraría al panel a publicar en el sitio. La autenticación demuestra QUIÉN
   eres; la lista decide si eso te sirve de algo.

   La lista vive en `ADMIN_EMAILS`, separada por comas, porque añadir a alguien
   tiene que ser cambiar una variable en Vercel y no desplegar código.
   ========================================================================== */

/** Correo del fundador. Es el valor por defecto para que el panel nunca quede sin dueño. */
const FALLBACK_ADMIN = "dcardona0512@gmail.com";

export function allowedEmails(): readonly string[] {
  const raw = process.env.ADMIN_EMAILS?.trim();
  const list = (raw ? raw.split(",") : [FALLBACK_ADMIN])
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return list.length > 0 ? list : [FALLBACK_ADMIN];
}

export function isAllowed(email: string | undefined | null): boolean {
  if (!email) return false;
  return allowedEmails().includes(email.trim().toLowerCase());
}

export type AdminSession = {
  readonly email: string;
  readonly userId: string;
};

/**
 * Devuelve la sesión solo si además está autorizada.
 *
 * `getUser()` y no `getSession()`: el primero valida el token contra Supabase,
 * el segundo se fía de la cookie, que el navegador puede haber manipulado.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email) return null;
  if (!isAllowed(data.user.email)) return null;

  return { email: data.user.email, userId: data.user.id };
}
