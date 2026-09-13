import { redirect } from "next/navigation";

import { Logo } from "@/components/brand/Logo";
import { getAdminSession } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";

import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  link: "El enlace no es válido o ya caducó. Pida uno nuevo.",
  denied: "Esa dirección no tiene acceso al panel.",
  required: "Inicie sesión para entrar al panel.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Con sesión válida no tiene sentido enseñar el formulario.
  if (await getAdminSession()) redirect("/admin");

  const sp = await searchParams;
  const raw = Array.isArray(sp.error) ? sp.error[0] : sp.error;
  const notice = raw ? NOTICES[raw] : undefined;

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-10">
        <div className="flex flex-col gap-6">
          <Logo />
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl">Panel de DCM ACCESS</h1>
            <p className="text-fg-muted text-sm text-pretty">
              El acceso está restringido a las cuentas autorizadas.
            </p>
          </div>
        </div>

        {isSupabaseConfigured() ? (
          <LoginForm notice={notice} />
        ) : (
          <p
            role="alert"
            className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm text-pretty"
          >
            Faltan las credenciales de Supabase en este entorno, así que no se puede iniciar sesión.
          </p>
        )}
      </div>
    </div>
  );
}
