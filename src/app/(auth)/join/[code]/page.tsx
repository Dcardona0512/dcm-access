import { redirect } from "next/navigation";

import { getDictionary } from "@/content";
import { googleHabilitado } from "@/lib/auth/providers";
import { getSession } from "@/lib/auth/session";
import { canjearInvitacion, invitacionValida } from "@/lib/data/supabase/invites";
import { localeDeCookie } from "@/lib/i18n/cookie";

import { MarcoDeAcceso } from "../../MarcoDeAcceso";
import { AccesoSocio } from "./AccesoSocio";

export const dynamic = "force-dynamic";

/* ============================================================================
   LA PUERTA DEL SOCIO
   ----------------------------------------------------------------------------
   Aquí aterriza quien recibe el enlace de invitación. Hace dos cosas según con
   qué llegue:

   · SIN sesión — comprueba que el código sigue vivo y ofrece entrar con
     Google. El código viaja en el `next`, así que al volver de Google se
     canjea solo.
   · CON sesión — canjea. Es el momento en que la cuenta se convierte en socio
     y nace su ficha.

   El código NO se canjea antes de que haya una cuenta detrás: quemarlo al
   abrir el enlace dejaría sin acceso a quien lo abrió por curiosidad desde el
   escritorio y luego entró desde el teléfono.
   ========================================================================== */

export default async function JoinPage({
  params,
}: {
  readonly params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const codigo = code.trim().toUpperCase();

  const locale = await localeDeCookie();
  const dict = getDictionary(locale);
  const sesion = await getSession();

  if (sesion) {
    const resultado = await canjearInvitacion(codigo, sesion.userId);

    if (resultado.ok) redirect("/partner/dashboard");

    return (
      <MarcoDeAcceso locale={locale} dict={dict}>
        <Aviso motivo={resultado.motivo} />
      </MarcoDeAcceso>
    );
  }

  if (!(await invitacionValida(codigo))) {
    return (
      <MarcoDeAcceso locale={locale} dict={dict}>
        <Aviso motivo="caducado" />
      </MarcoDeAcceso>
    );
  }

  return (
    <MarcoDeAcceso locale={locale} dict={dict}>
      <AccesoSocio
        dict={dict}
        codigo={codigo}
        conGoogle={await googleHabilitado()}
      />
    </MarcoDeAcceso>
  );
}

/**
 * Por qué no sirve, en palabras de quien lo recibió.
 *
 * Los tres motivos acaban en lo mismo —pedir otro enlace— así que el mensaje
 * dice eso, sin hacerle sentir que ha hecho algo mal: la invitación dura
 * quince minutos y lo normal es que se le haya pasado el tiempo.
 */
function Aviso({ motivo }: { readonly motivo: "desconocido" | "usado" | "caducado" }) {
  const textos = {
    caducado: "Esta invitación ya caducó. Las invitaciones duran quince minutos.",
    usado: "Esta invitación ya se usó.",
    desconocido: "Esta invitación no es válida.",
  } as const;

  return (
    <div className="flex flex-col gap-4 text-center">
      <h1 className="font-display text-3xl">Invitación no válida</h1>
      <p className="text-fg-muted text-sm text-pretty">{textos[motivo]}</p>
      <p className="text-fg-muted/70 text-sm text-pretty">
        Pídale a DCM ACCESS un enlace nuevo y ábralo en cuanto le llegue.
      </p>
    </div>
  );
}
