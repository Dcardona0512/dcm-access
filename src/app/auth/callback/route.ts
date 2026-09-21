import { NextResponse } from "next/server";

import { panelDe } from "@/lib/auth/session";
import { roles, type Role } from "@/lib/domain/types";
import { createSessionClient } from "@/lib/supabase/server";

/* ============================================================================
   RETORNO DE LA AUTENTICACIÓN
   ----------------------------------------------------------------------------
   Aquí aterrizan las dos vías: el enlace del correo y la vuelta de Google.
   Supabase manda un `code` de un solo uso y canjearlo es lo que crea la
   sesión.

   Después decide a dónde va cada quien. No hay una pantalla intermedia de
   «elige tu panel»: el rol ya está en la base, así que la plataforma sabe
   adónde pertenece quien entra.
   ========================================================================== */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const siguiente = url.searchParams.get("next");

  const entrada = new URL("/login", url.origin);

  if (!code) {
    entrada.searchParams.set("error", "link");
    return NextResponse.redirect(entrada);
  }

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    // Caducado, ya usado o manipulado. Los tres se ven igual desde fuera.
    entrada.searchParams.set("error", "link");
    return NextResponse.redirect(entrada);
  }

  /*
    El perfil lo crea un disparador de la base en el mismo instante en que
    nace la cuenta. Se lee aquí para saber a qué panel mandar; si por lo que
    sea todavía no estuviera, se trata como cliente, que es el rol de menos
    privilegio y el que el propio disparador pone por defecto.
  */
  const { data: perfil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle<{ role: string }>();

  const rol: Role =
    perfil && (roles as readonly string[]).includes(perfil.role) ? (perfil.role as Role) : "client";

  /*
    `next` solo se respeta si es una ruta de este sitio. Es la misma defensa
    que en el formulario, repetida aquí a propósito: este parámetro llega por
    la URL y cualquiera puede escribirlo a mano en el enlace.
  */
  const destino =
    siguiente && /^\/(?!\/)/.test(siguiente) ? siguiente : panelDe(rol);

  return NextResponse.redirect(new URL(destino, url.origin));
}
