import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { panelDe } from "@/lib/auth/session";
import { roles, type Role } from "@/lib/domain/types";
import { createSessionClient } from "@/lib/supabase/server";

/* ============================================================================
   RETORNO DE LA AUTENTICACIÓN
   ----------------------------------------------------------------------------
   Aquí aterrizan las dos vías: el enlace del correo y la vuelta de Google.

   Y ACEPTA LAS DOS FORMAS EN QUE PUEDE LLEGAR, que no es capricho:

   · `code` — el canje estándar. Lleva detrás un secreto que se guardó en una
     cookie del navegador que PIDIÓ el enlace, así que solo funciona si se
     abre en ese mismo navegador. Quien pide el acceso en el ordenador y abre
     el correo en el teléfono se encuentra con un error incomprensible.

   · `token_hash` + `type` — la verificación directa. No depende de ninguna
     cookie previa, así que el enlace funciona en cualquier aparato.

   Soportar solo la primera es lo que hace que un acceso por correo «no
   funcione» sin que nada esté roto.

   Después decide a dónde va cada quien. No hay una pantalla intermedia de
   «elige tu panel»: el rol ya está en la base, así que la plataforma sabe
   adónde pertenece quien entra.
   ========================================================================== */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;
  const siguiente = url.searchParams.get("next");

  const entrada = new URL("/login", url.origin);

  /*
    Sin código ni token en la dirección, la sesión puede venir en el FRAGMENTO
    —`#access_token=…`—, que el navegador nunca envía al servidor. Desde aquí
    es invisible, así que se pasa la pelota a una página que sí puede leerlo.
    El fragmento sobrevive a la redirección: lo reaplica el propio navegador.
  */
  if (!code && !(tokenHash && tipo)) {
    const remate = new URL("/auth/finish", url.origin);
    if (siguiente) remate.searchParams.set("next", siguiente);
    return NextResponse.redirect(remate);
  }

  const supabase = await createSessionClient();

  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: tipo! });

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
