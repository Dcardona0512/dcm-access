import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { getDemoUser, roleLabels } from "@/lib/auth/roles";
import { fontVariables } from "@/lib/fonts";

import "@/app/globals.css";

/**
 * Raíz del CRM (§22).
 *
 * Layout raíz independiente del sitio público: el panel no se traduce, no
 * lleva la cabecera de marca ni el pie, y nunca debe indexarse.
 */
export const metadata: Metadata = {
  title: "CRM — DCM ACCESS",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = getDemoUser();

  return (
    <html lang="es" className={fontVariables}>
      <body className="bg-surface text-fg font-sans antialiased">
        <div className="flex min-h-dvh flex-col lg:flex-row">
          <aside className="border-line bg-surface-raised flex shrink-0 flex-col gap-8 border-b p-6 lg:h-dvh lg:w-64 lg:border-r lg:border-b-0 lg:sticky lg:top-0">
            <Link href="/admin" className="text-fg hover:text-accent transition-colors">
              <Logo />
            </Link>

            <AdminNav role={user.role} />

            <div className="border-line mt-auto flex flex-col gap-2 border-t pt-5">
              <span className="eyebrow text-fg-muted text-[0.5rem]">{roleLabels[user.role].es}</span>
              <span className="text-fg-muted/70 text-xs">{user.name}</span>
              {/* Sin autenticación real todavía; se dice, no se disimula (§48). */}
              <span className="eyebrow border-accent-dim/50 text-accent-dim mt-2 w-fit rounded-(--radius-card) border border-dashed px-1.5 py-1 text-[0.5rem]">
                Sesión demo
              </span>
            </div>
          </aside>

          <main className="min-w-0 flex-1 p-6 lg:p-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
