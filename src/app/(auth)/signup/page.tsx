import Link from "next/link";
import { redirect } from "next/navigation";

import { getDictionary } from "@/content";
import { getSession, panelDe } from "@/lib/auth/session";
import { localeDeCookie } from "@/lib/i18n/cookie";

import { MarcoDeAcceso } from "../MarcoDeAcceso";

export const dynamic = "force-dynamic";

/* ============================================================================
   AQUÍ NO SE CREA UNA CUENTA
   ----------------------------------------------------------------------------
   A DCM ACCESS se entra INVITADO: el administrador genera un código y manda el
   enlace. El registro abierto se retiró porque no encajaba con el modelo —quien
   compra no necesita cuenta, y quien publica lo hace porque se le invitó—.

   La ruta se conserva en lugar de devolver un 404, y no por nostalgia: estaba
   enlazada desde la cabecera y el pie, y un enlace viejo que muere en una
   página de error es una oportunidad comercial tirada a la basura. Aquí se
   explica el modelo y se ofrece el camino real: escribir para vender.
   ========================================================================== */

export default async function SignupPage() {
  const sesion = await getSession();
  if (sesion) redirect(panelDe(sesion.role));

  const locale = await localeDeCookie();
  const dict = getDictionary(locale);

  return (
    <MarcoDeAcceso
      locale={locale}
      dict={dict}
      pie={
        <>
          {dict.auth.haveAccount}{" "}
          <Link href="/login" className="text-accent font-medium underline-offset-2 hover:underline">
            {dict.auth.toLogin}
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-6 text-center">
        <h1 className="font-display text-3xl">Se entra por invitación</h1>

        <p className="text-fg-muted text-sm leading-relaxed text-pretty">
          Las cuentas de DCM ACCESS son para los socios que publican, y las abre
          el equipo con una invitación. Para comprar no hace falta cuenta:
          escriba desde la ficha que le interese.
        </p>

        <Link
          href={`/${locale}/sell`}
          className="eyebrow bg-accent text-surface border-accent inline-flex h-12 items-center justify-center rounded-(--radius-card) border text-[0.75rem] transition-opacity hover:opacity-90"
        >
          Quiero publicar con ustedes
        </Link>
      </div>
    </MarcoDeAcceso>
  );
}
