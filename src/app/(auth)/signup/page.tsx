import { redirect } from "next/navigation";

import { getDictionary } from "@/content";
import { getSession, panelDe } from "@/lib/auth/session";
import { localeDeCookie } from "@/lib/i18n/cookie";

import { AccessForm } from "../AccessForm";

export const dynamic = "force-dynamic";

/** Crear cuenta. Mismo formulario que entrar, más la pregunta de qué hace aquí. */
export default async function SignupPage() {
  const sesion = await getSession();
  if (sesion) redirect(panelDe(sesion.role));

  const dict = getDictionary(await localeDeCookie());

  return (
    <AccessForm
      dict={dict}
      modo="signup"
      conGoogle={process.env.NEXT_PUBLIC_GOOGLE_AUTH === "on"}
    />
  );
}
