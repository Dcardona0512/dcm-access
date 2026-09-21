import Link from "next/link";

import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/brand/Logo";
import { signOut } from "@/lib/auth/actions";
import { roleLabels, TEAM_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";

/**
 * Todo lo que hay dentro exige sesión Y ROL DE EQUIPO.
 *
 * La comprobación va en el LAYOUT y no en cada página: una ruta nueva queda
 * protegida por existir, no por acordarse de protegerla. Y `force-dynamic`
 * porque una página del panel prerenderizada serviría datos a quien no ha
 * iniciado sesión.
 *
 * Aquí se acabó la puerta abierta. Durante un tiempo `ADMIN_GATE` dejaba
 * entrar a cualquiera que escribiera la dirección —con el catálogo vacío el
 * riesgo era menor que la fricción— y esa concesión desaparece con la
 * identidad real: ahora el rol vive en una fila de la base y lo comprueba el
 * servidor, no una lista de correos en una variable de entorno.
 */
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Quien no ha entrado va a la puerta; quien ha entrado pero es cliente o
  // partner va a SU panel. La matriz de permisos sigue decidiendo el menú.
  const session = await requireRole(TEAM_ROLES, "/admin");

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-line bg-surface-raised flex shrink-0 flex-col gap-8 border-b p-6 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:border-r lg:border-b-0">
        <Link href="/admin" className="text-fg hover:text-accent transition-colors">
          <Logo />
        </Link>

        <AdminNav role={session.role} />

        <div className="border-line mt-auto flex flex-col gap-2 border-t pt-5">
          <span className="eyebrow text-fg-muted text-[0.75rem]">
            {roleLabels[session.role].es}
          </span>
          <span className="text-fg-muted/70 text-xs break-all">{session.email}</span>

          <form action={signOut} className="mt-2">
            <button
              type="submit"
              className="eyebrow border-line text-fg-muted hover:border-fg-muted/60 hover:text-fg rounded-(--radius-card) border px-2.5 py-1.5 text-[0.75rem] transition-colors"
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
