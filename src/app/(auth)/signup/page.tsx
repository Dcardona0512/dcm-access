import Link from "next/link";
import { redirect } from "next/navigation";

import { getDictionary } from "@/content";
import { googleHabilitado } from "@/lib/auth/providers";
import { getSession, panelDe } from "@/lib/auth/session";
import { localeDeCookie } from "@/lib/i18n/cookie";

import { AccessForm } from "../AccessForm";
import { MarcoDeAcceso } from "../MarcoDeAcceso";

export const dynamic = "force-dynamic";

/** Crear cuenta. Mismo formulario que entrar, más la pregunta de qué hace aquí. */
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
      <AccessForm
        dict={dict}
        modo="signup"
        conGoogle={await googleHabilitado()}
      />
    </MarcoDeAcceso>
  );
}
