import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/* ============================================================================
   CLIENTES DE SUPABASE
   ----------------------------------------------------------------------------
   Dos clientes, y la diferencia entre ellos es de seguridad, no de comodidad:

     · El PUBLICABLE respeta RLS. Es el que ve el sitio público y el que lleva
       la sesión del panel. Un fallo aquí no puede filtrar nada que la política
       no permita ya.
     · El SECRETO se salta RLS por completo. Solo lo toca el servidor para
       publicar y para leer lo que no es público. Nunca sale de aquí, y jamás
       puede vivir en una variable `NEXT_PUBLIC_`.

   El archivo es `server-only`: si alguien lo importa desde un componente de
   cliente, el build falla en lugar de enviar la clave secreta al navegador.
   ========================================================================== */

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export const SUPABASE_URL = env("NEXT_PUBLIC_SUPABASE_URL");
const PUBLISHABLE_KEY = env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const SECRET_KEY = env("SUPABASE_SECRET_KEY");

/** ¿Hay credenciales suficientes para hablar con Supabase? */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && PUBLISHABLE_KEY);
}

export function isSupabaseWritable(): boolean {
  return Boolean(SUPABASE_URL && SECRET_KEY);
}

/**
 * Cliente ligado a la sesión del visitante. Lee y escribe las cookies de
 * autenticación, así que es el único que sabe quién ha iniciado sesión.
 */
export async function createSessionClient() {
  if (!SUPABASE_URL || !PUBLISHABLE_KEY) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  const store = await cookies();

  return createServerClient(SUPABASE_URL, PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options);
          }
        } catch {
          // Escribir cookies desde un Server Component lanza. Se ignora a
          // propósito: la ruta de callback y las server actions sí pueden, y
          // son las que renuevan la sesión.
        }
      },
    },
  });
}

/**
 * Cliente administrativo. Se salta RLS, así que solo debe usarse tras haber
 * comprobado la autorización por nuestra cuenta.
 */
export function createAdminClient() {
  if (!SUPABASE_URL || !SECRET_KEY) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY.");
  }

  return createClient(SUPABASE_URL, SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
