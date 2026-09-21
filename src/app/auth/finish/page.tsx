"use client";

import { useEffect, useState } from "react";

import { createSessionBrowserClient } from "@/lib/supabase/session-browser";

/* ============================================================================
   REMATE DEL ACCESO — EL TROZO DESPUÉS DE «#»
   ----------------------------------------------------------------------------
   Algunos enlaces de Supabase no vuelven con un código en la dirección, sino
   con la sesión entera en el FRAGMENTO: `#access_token=…&refresh_token=…`. Y
   el fragmento NO SE ENVÍA AL SERVIDOR —el navegador se lo queda—, así que la
   ruta de retorno no ve absolutamente nada y manda a la entrada diciendo que
   el enlace no vale. Pasó de verdad: el correo quedaba confirmado en la base y
   la persona acababa en la pantalla de error.

   Esta página es la única parte del acceso que TIENE que correr en el
   navegador, porque es el único sitio donde ese trozo existe. Lee el
   fragmento, guarda la sesión en las mismas cookies que lee el servidor y se
   aparta.

   También recoge el caso contrario: cuando el fragmento trae un error
   —`otp_expired`, típicamente, un enlace ya usado o caducado— y lo traduce a
   la pantalla de entrada con el aviso correcto.
   ========================================================================== */

export default function AuthFinishPage() {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;

    const datos = new URLSearchParams(hash);

    const acceso = datos.get("access_token");
    const refresco = datos.get("refresh_token");

    if (!acceso || !refresco) {
      // Sin sesión en el fragmento no hay nada que rematar: o vino un error, o
      // alguien escribió esta dirección a mano.
      window.location.replace("/login?error=link");
      return;
    }

    void (async () => {
      const supabase = createSessionBrowserClient();
      const { error } = await supabase.auth.setSession({
        access_token: acceso,
        refresh_token: refresco,
      });

      if (error) {
        setFallo(true);
        window.location.replace("/login?error=link");
        return;
      }

      /*
        A la entrada, no al panel: con sesión puesta, `/login` averigua el rol
        en el servidor y manda a donde corresponda. Decidirlo aquí obligaría a
        que el navegador conociera los roles, que es justo lo que no queremos.
      */
      window.location.replace("/login");
    })();
  }, []);

  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <p className="text-fg-muted text-sm">{fallo ? "No se pudo completar." : "Entrando…"}</p>
    </div>
  );
}
