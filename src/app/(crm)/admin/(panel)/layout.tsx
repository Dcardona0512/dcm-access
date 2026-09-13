import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/brand/Logo";
import { getAdminSession } from "@/lib/auth/admin";
import { getDemoUser, roleLabels } from "@/lib/auth/roles";

import { signOutAdmin } from "../login/actions";

/**
 * Todo lo que hay dentro exige sesión.
 *
 * La comprobación va en el LAYOUT y no en cada página: una ruta nueva queda
 * protegida por existir, no por acordarse de protegerla. Y `force-dynamic`
 * porque una página del panel prerenderizada serviría datos a quien no ha
 * iniciado sesión.
 */
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login?error=required");

  // La matriz de permisos sigue decidiendo el menú; lo que cambia es que ahora
  // hay una identidad real detrás en lugar de una sesión de demostración.
  const user = getDemoUser();

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-line bg-surface-raised flex shrink-0 flex-col gap-8 border-b p-6 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:border-r lg:border-b-0">
        <Link href="/admin" className="text-fg hover:text-accent transition-colors">
          <Logo />
        </Link>

        <AdminNav role={user.role} />

        <div className="border-line mt-auto flex flex-col gap-2 border-t pt-5">
          <span className="eyebrow text-fg-muted text-[0.5rem]">{roleLabels[user.role].es}</span>
          <span className="text-fg-muted/70 text-xs break-all">{session.email}</span>

          <form action={signOutAdmin} className="mt-2">
            <button
              type="submit"
              className="eyebrow border-line text-fg-muted hover:border-fg-muted/60 hover:text-fg rounded-(--radius-card) border px-2.5 py-1.5 text-[0.5rem] transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
