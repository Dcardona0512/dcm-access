import { NextResponse } from "next/server";

import { isAllowed } from "@/lib/auth/admin";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Retorno del enlace mágico.
 *
 * Supabase manda un `code` de un solo uso; canjearlo es lo que crea la sesión.
 * Si el correo que llega no está autorizado, se cierra la sesión en el acto:
 * de otro modo alguien ajeno quedaría con sesión iniciada y solo le faltaría
 * que la lista cambiara para tener acceso.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const login = new URL("/admin/login", url.origin);

  if (!code) {
    login.searchParams.set("error", "link");
    return NextResponse.redirect(login);
  }

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.email) {
    login.searchParams.set("error", "link");
    return NextResponse.redirect(login);
  }

  if (!isAllowed(data.user.email)) {
    await supabase.auth.signOut();
    login.searchParams.set("error", "denied");
    return NextResponse.redirect(login);
  }

  return NextResponse.redirect(new URL("/admin", url.origin));
}
