import Link from "next/link";
import { redirect } from "next/navigation";

import { getDictionary } from "@/content";
import { googleHabilitado } from "@/lib/auth/providers";
import { getSession, panelDe } from "@/lib/auth/session";
import { localeDeCookie } from "@/lib/i18n/cookie";

import { AccessForm } from "../AccessForm";
import { MarcoDeAcceso } from "../MarcoDeAcceso";

export const dynamic = "force-dynamic";

/**
 * Entrar.
 *
 * Con sesión ya iniciada no se enseña: se va al panel que corresponda. Una
 * pantalla de acceso a quien ya entró es una puerta pintada en una pared.
 */
export default async function LoginPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sesion = await getSession();
  if (sesion) redirect(panelDe(sesion.role));

  const locale = await localeDeCookie();
  const dict = getDictionary(locale);
  const sp = await searchParams;

  const error = uno(sp.error);
  const avisos: Record<string, string> = {
    link: dict.auth.errorLink,
    denied: dict.auth.errorDenied,
    google: dict.auth.errorGoogle,
    required: dict.auth.errorRequired,
  };

  return (
    <MarcoDeAcceso
      locale={locale}
      dict={dict}
      pie={
        /*
          Antes llevaba a registrarse, y ya no hay registro: a la cuenta se
          entra invitado. Quien llega aquí sin cuenta es casi siempre alguien
          que quiere publicar, así que el enlace lo lleva justo ahí.
        */
        <>
          ¿Quiere publicar con nosotros?{" "}
          <Link
            href={`/${locale}/sell`}
            className="text-accent font-medium underline-offset-2 hover:underline"
          >
            Escríbanos
          </Link>
        </>
      }
    >
      <AccessForm
        dict={dict}
        modo="login"
        conGoogle={await googleHabilitado()}
        next={rutaInterna(uno(sp.next))}
        aviso={error ? avisos[error] : undefined}
      />
    </MarcoDeAcceso>
  );
}

function uno(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

/**
 * Solo rutas de este sitio.
 *
 * `?next=` llega por la URL y lo escribe cualquiera. Sin esta comprobación, la
 * entrada se convierte en un trampolín: el enlace sale de nuestro dominio,
 * parece nuestro y aterriza donde quiera quien lo fabricó.
 */
function rutaInterna(valor: string | undefined): string | undefined {
  return valor && /^\/(?!\/)/.test(valor) ? valor : undefined;
}
