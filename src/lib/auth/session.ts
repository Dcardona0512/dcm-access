import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { can, type Action, type Resource } from "@/lib/auth/roles";
import { roles, type Role } from "@/lib/domain/types";
import { createSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";

/* ============================================================================
   QUIÉN ENTRA — LA SESIÓN REAL
   ----------------------------------------------------------------------------
   Sustituye a las dos mentiras que sostenían el panel: una puerta abierta que
   dejaba publicar a cualquiera que escribiera la dirección, y un
   `getDemoUser()` que devolvía siempre un administrador inventado.

   AUTENTICARSE NO ES ESTAR AUTORIZADO, y aquí está toda la distinción:
   Supabase deja registrarse a cualquiera con un correo válido, así que la
   pregunta no es «¿quién eres?» sino «¿qué eres en esta plataforma?». Lo
   segundo lo dice UNA COLUMNA DE LA BASE —`profiles.role`—, no el token, ni
   una lista de correos en una variable de entorno, ni nada que viaje por el
   navegador.

   `getUser()` y no `getSession()`: el primero valida el token contra Supabase;
   el segundo se fía de la cookie, que el navegador puede haber manipulado.

   El perfil se lee con la SESIÓN DE LA PROPIA PERSONA, no con la clave
   secreta. Es deliberado: si algún día una política de RLS se rompiera, esta
   consulta devolvería vacío y la persona se quedaría fuera. Leerlo con la
   llave maestra escondería el fallo justo donde más caro sale.

   `cache()` de React: una misma petición pregunta por la sesión en el layout,
   en la página y en cada acción. Sin esto serían tres viajes a Supabase para
   responder tres veces lo mismo.
   ========================================================================== */

export type Session = {
  readonly userId: string;
  readonly email: string;
  readonly role: Role;
  readonly fullName: string | null;
  readonly avatarUrl: string | null;
};

function esRol(value: unknown): value is Role {
  return typeof value === "string" && (roles as readonly string[]).includes(value);
}

export const getSession = cache(async (): Promise<Session | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email) return null;

  const { data: perfil } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", data.user.id)
    .maybeSingle<{ role: string; full_name: string | null; avatar_url: string | null }>();

  /*
    Sin perfil no hay sesión útil. Pasa en una ventana muy estrecha —la cuenta
    existe en `auth.users` pero el disparador que crea el perfil aún no ha
    corrido— y en ese caso es mejor tratarlo como «todavía no» que inventarle
    un rol por defecto: inventarlo es exactamente como se cuelan permisos.
  */
  if (!perfil || !esRol(perfil.role)) return null;

  return {
    userId: data.user.id,
    email: data.user.email,
    role: perfil.role,
    fullName: perfil.full_name,
    avatarUrl: perfil.avatar_url,
  };
});

/**
 * Exige sesión. Sin ella, a la entrada — recordando adónde iba.
 */
export async function requireSession(destino?: string): Promise<Session> {
  const sesion = await getSession();
  if (sesion) return sesion;

  redirect(destino ? `/login?next=${encodeURIComponent(destino)}` : "/login");
}

/**
 * Exige uno de estos roles.
 *
 * Quien no tiene sesión va a la entrada; quien la tiene pero no le corresponde
 * ese sitio va a SU panel, no a una pantalla de error: un cliente que pulsa un
 * enlace del panel no ha hecho nada malo, se ha equivocado de puerta.
 */
export async function requireRole(
  permitidos: readonly Role[],
  destino?: string,
): Promise<Session> {
  const sesion = await requireSession(destino);
  if (permitidos.includes(sesion.role)) return sesion;

  redirect(panelDe(sesion.role));
}

/** A dónde pertenece cada rol después de entrar. */
export function panelDe(role: Role): string {
  if (role === "partner") return "/partner/dashboard";
  if (role === "client") return "/dashboard";
  return "/admin";
}

/**
 * Permiso sobre un recurso, para el código que ya consultaba `can()`.
 *
 * La matriz de `roles.ts` decide qué se puede PEDIR; RLS decide qué se
 * devuelve. Son dos capas a propósito: la primera evita enseñar botones que no
 * llevan a ninguna parte, y la segunda es la que de verdad protege, porque
 * vive en la base y no se le puede dar la vuelta desde el navegador.
 */
export async function puede(action: Action, resource: Resource): Promise<boolean> {
  const sesion = await getSession();
  return sesion ? can(sesion.role, action, resource) : false;
}
