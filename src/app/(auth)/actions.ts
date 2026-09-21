"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { absoluteUrl } from "@/lib/seo";
import { checkRateLimit, isHoneypotTripped } from "@/lib/security/rate-limit";
import { createSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";

/* ============================================================================
   ENTRAR Y REGISTRARSE
   ----------------------------------------------------------------------------
   Dos caminos y una sola puerta: enlace por correo y Google. Ninguno de los
   dos usa contraseña, así que no hay nada que recordar, que rotar ni que se
   pueda filtrar de nuestra base.

   EL ROL NO VIAJA EN EL FORMULARIO. Lo que la persona elige al registrarse
   —cliente o partner— se guarda como INTENCIÓN (`requested_role`), y el rol de
   partner lo concede el administrador al verificar. Si el formulario decidiera
   el rol, registrarse como partner sería ascenderse solo; y si decidiera el de
   administrador, bastaría con editar el HTML.
   ========================================================================== */

export type AuthState = {
  readonly status: "idle" | "sent" | "error";
  readonly message?: string;
  readonly email?: string;
};

export const initialAuthState: AuthState = { status: "idle" };

const esquema = z.object({
  email: z.string().trim().min(1).email().max(254).toLowerCase(),
  /* Solo estas dos. `admin` no está, y no por olvido. */
  requestedRole: z.enum(["client", "partner"]).optional(),
  next: z
    .string()
    .trim()
    /*
      Solo rutas internas. Sin esto, `?next=https://otro-sitio` convierte la
      entrada en un trampolín: el enlace sale de nuestro dominio, parece
      nuestro, y aterriza donde quiera quien lo fabricó.
    */
    .regex(/^\/(?!\/)[\w\-/?=&%.]*$/)
    .max(200)
    .optional(),
});

async function clave(scope: string): Promise<string> {
  const store = await headers();
  const ip = store.get("x-forwarded-for")?.split(",")[0]?.trim() ?? store.get("x-real-ip");
  return `${scope}:${ip ?? "local"}`;
}

/** Manda el enlace de acceso. Vale para entrar y para registrarse. */
export async function sendMagicLink(_previo: AuthState, formData: FormData): Promise<AuthState> {
  if (isHoneypotTripped(formData)) return { status: "sent" };

  if (!isSupabaseConfigured()) {
    return { status: "error", message: "El acceso no está configurado en este entorno." };
  }

  const limite = checkRateLimit(await clave("auth"));
  if (!limite.allowed) {
    return {
      status: "error",
      message: "Ha pedido varios enlaces seguidos. Espere un momento e inténtelo de nuevo.",
    };
  }

  const parsed = esquema.safeParse({
    email: formData.get("email"),
    requestedRole: formData.get("requestedRole") ?? undefined,
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Escriba un correo electrónico válido." };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: destinoDeVuelta(parsed.data.next),
      /*
        Viaja en los metadatos del usuario y lo lee el disparador que crea el
        perfil. Es una DECLARACIÓN DE INTENCIÓN, no un permiso: el disparador
        la guarda en `requested_role` y el rol sigue siendo `client`.
      */
      data: parsed.data.requestedRole ? { requested_role: parsed.data.requestedRole } : undefined,
    },
  });

  if (error) {
    /*
      No se distingue «no existe» de «no se pudo enviar», y es a propósito: si
      el mensaje cambiara según si el correo está registrado, cualquiera podría
      averiguar quién tiene cuenta probando direcciones.
    */
    return {
      status: "error",
      message: "No se pudo enviar el enlace. Inténtelo de nuevo en un momento.",
    };
  }

  return { status: "sent", email: parsed.data.email };
}

/** Entrada con Google. Devuelve la redirección que abre el consentimiento. */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const siguiente = formData.get("next");
  const rol = formData.get("requestedRole");

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: destinoDeVuelta(typeof siguiente === "string" ? siguiente : undefined),
      queryParams:
        rol === "partner" || rol === "client" ? { requested_role: rol } : undefined,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=google");
  }

  redirect(data.url);
}

/**
 * A dónde vuelve el enlace.
 *
 * Siempre a nuestra ruta de retorno, que es la única que sabe canjear el
 * código por sesión; el sitio al que la persona iba se conserva en `next` y lo
 * resuelve esa ruta después.
 */
function destinoDeVuelta(next?: string): string {
  const url = new URL(absoluteUrl("/auth/callback"));
  if (next) url.searchParams.set("next", next);
  return url.toString();
}
