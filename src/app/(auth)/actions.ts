"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { absoluteUrl } from "@/lib/seo";
import { checkRateLimit, isHoneypotTripped } from "@/lib/security/rate-limit";
import { createSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";

import type { AuthState } from "./state";

/* ============================================================================
   ENTRAR Y REGISTRARSE
   ----------------------------------------------------------------------------
   Dos caminos y una sola puerta: enlace por correo y Google. Ninguno de los
   dos usa contraseña, así que no hay nada que recordar, que rotar ni que se
   pueda filtrar de nuestra base.

   EL ROL NO VIAJA EN EL FORMULARIO, y ahora tampoco se pregunta: todas las
   cuentas nacen iguales. El disparador de la base les pone el rol de entrada y
   los distintivos —partner verificado, equipo— los concede el administrador.
   Si el formulario decidiera el rol, bastaría con editar el HTML para
   ascenderse.
   ========================================================================== */

const esquema = z.object({
  email: z.string().trim().min(1).email().max(254).toLowerCase(),
  /** De qué pantalla viene. Decide si se puede crear cuenta o no. */
  mode: z.enum(["login", "signup"]).default("login"),
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
    mode: formData.get("mode") ?? undefined,
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Escriba un correo electrónico válido." };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      /*
        ENTRAR NO CREA CUENTAS. Quien se equivoca de letra al escribir su
        correo acabaría con una cuenta nueva y vacía, y sin entender por qué
        no ve nada de lo suyo. Registrarse sí la crea: es lo que se pidió.
      */
      shouldCreateUser: parsed.data.mode === "signup",
      emailRedirectTo: destinoDeVuelta(parsed.data.next),
    },
  });

  if (error) {
    /*
      Que el correo no tenga cuenta NO es un error que enseñar: sale la misma
      pantalla de «enviado». Si el mensaje cambiara según si la dirección está
      registrada, el formulario se convertiría en un detector de clientes —se
      prueban direcciones y se mira cuál responde distinto—.
    */
    if (esDeCuentaInexistente(error.message)) {
      return { status: "sent", email: parsed.data.email };
    }

    /*
      Lo demás sí se distingue, porque la causa cambia el consejo. Decir
      «inténtelo de nuevo» a quien acaba de agotar el límite de envíos es
      recomendarle exactamente lo contrario de lo que le conviene.
    */
    return { status: "error", message: describe(error.message) };
  }

  return { status: "sent", email: parsed.data.email };
}

/** Entrada con Google. Devuelve la redirección que abre el consentimiento. */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const siguiente = formData.get("next");

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: destinoDeVuelta(typeof siguiente === "string" ? siguiente : undefined),
    },
  });

  if (error || !data.url) {
    redirect("/login?error=google");
  }

  redirect(data.url);
}

/**
 * Supabase avisa cuando el correo no tiene cuenta y no se permite crearla.
 * Llega por dos redacciones distintas según la versión.
 */
function esDeCuentaInexistente(mensaje: string): boolean {
  const m = mensaje.toLowerCase();
  return m.includes("signups not allowed") || m.includes("user not found");
}

function describe(mensaje: string): string {
  const m = mensaje.toLowerCase();

  if (m.includes("rate limit") || m.includes("too many") || m.includes("over_email")) {
    return "Se pidieron varios enlaces seguidos y el proveedor de correo cerró el envío por un rato. Espere unos minutos y pida uno solo.";
  }
  if (m.includes("invalid") && m.includes("email")) {
    return "El proveedor de correo rechazó esa dirección.";
  }
  return "No se pudo enviar el enlace. Inténtelo de nuevo en un momento.";
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
