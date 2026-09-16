import "server-only";

import { createSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";

/* ============================================================================
   ACCESO AL PANEL (§22, §40)
   ----------------------------------------------------------------------------
   AHORA MISMO LA PUERTA ESTÁ ABIERTA, Y ES A PROPÓSITO.

   El enlace por correo dependía del servidor de correo de cortesía de
   Supabase, que corta el envío tras un par de mensajes por hora; con el
   catálogo todavía vacío, esa espera costaba más que el riesgo. Mientras el
   interruptor esté abierto, cualquiera que escriba la dirección del panel
   entra y publica: la dirección es predecible y no hay nada más que la
   proteja.

   Para volver a cerrarlo basta con poner `ADMIN_GATE=on` en Vercel. No hace
   falta desplegar ni tocar este archivo: el enlace por correo sigue entero,
   solo está en pausa.

   Cuando la puerta está cerrada, se entra con el correo: Supabase manda un
   enlace y al abrirlo hay sesión. Sin contraseña que recordar, rotar ni
   filtrar.

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
  /** Cierto cuando no hubo puerta que cruzar. La interfaz lo avisa. */
  readonly open?: boolean;
};

/**
 * ¿Hay puerta?
 *
 * Cerrar es la acción que puede urgir, así que es la que se hace sin
 * desplegar: una variable en Vercel y vuelve a pedirse el enlace. Abrir, que
 * es lo que compromete, exige tocar el código y pasar por revisión.
 */
export function isAdminGateOn(): boolean {
  return process.env.ADMIN_GATE?.trim().toLowerCase() === "on";
}

/**
 * Identidad de cortesía mientras la puerta está abierta.
 *
 * Se devuelve el correo del fundador, y no algo vacío, porque todo lo de
 * dentro —la matriz de permisos, la autoría de una ficha— espera una
 * identidad. `open` marca que nadie la demostró.
 */
const OPEN_SESSION: AdminSession = {
  email: FALLBACK_ADMIN,
  userId: "admin-sin-puerta",
  open: true,
};

/**
 * Devuelve la sesión solo si además está autorizada.
 *
 * `getUser()` y no `getSession()`: el primero valida el token contra Supabase,
 * el segundo se fía de la cookie, que el navegador puede haber manipulado.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  // Un solo sitio decide, y por eso se abren a la vez el panel, la acción de
  // publicar y las rutas de geografía. Repartir el interruptor por seis
  // ficheros es cómo se queda uno abierto al cerrar los otros cinco.
  if (!isAdminGateOn()) return OPEN_SESSION;

  if (!isSupabaseConfigured()) return null;

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email) return null;
  if (!isAllowed(data.user.email)) return null;

  return { email: data.user.email, userId: data.user.id };
}
