import { redirect } from "next/navigation";

import { getDictionary } from "@/content";
import { getSession, panelDe } from "@/lib/auth/session";
import { localeDeCookie } from "@/lib/i18n/cookie";

import { AccessForm } from "../AccessForm";

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

  const dict = getDictionary(await localeDeCookie());
  const sp = await searchParams;

  const error = uno(sp.error);
  const avisos: Record<string, string> = {
    link: dict.auth.errorLink,
    denied: dict.auth.errorDenied,
    google: dict.auth.errorGoogle,
    required: dict.auth.errorRequired,
  };

  return (
    <AccessForm
      dict={dict}
      modo="login"
      conGoogle={process.env.NEXT_PUBLIC_GOOGLE_AUTH === "on"}
      next={rutaInterna(uno(sp.next))}
      aviso={error ? avisos[error] : undefined}
    />
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
