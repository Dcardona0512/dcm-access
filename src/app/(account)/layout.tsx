import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { getDictionary } from "@/content";
import { signOut } from "@/lib/auth/actions";
import { requireSession } from "@/lib/auth/session";
import { fontVariables } from "@/lib/fonts";
import { localeMeta } from "@/lib/i18n/config";
import { localeDeCookie } from "@/lib/i18n/cookie";

import "@/app/globals.css";

/* ============================================================================
   RAÍZ DE LOS PANELES DE CUENTA
   ----------------------------------------------------------------------------
   El del cliente y el del partner comparten cabecera y raíz. Lo que cambia
   entre ellos es el contenido, no el marco, y tenerlos bajo el mismo layout
   garantiza que cerrar sesión, la marca y la tipografía sean lo mismo en los
   dos sin copiar nada.

   La sesión se exige AQUÍ: una página nueva dentro de este grupo queda
   protegida por existir, no por acordarse de protegerla.
   ========================================================================== */

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { readonly children: ReactNode }) {
  const locale = await localeDeCookie();
  const dict = getDictionary(locale);
  const session = await requireSession();

  return (
    <html lang={localeMeta[locale].hreflang} className={fontVariables}>
      <body className="bg-surface text-fg font-sans antialiased">
        <header className="border-line bg-surface-raised border-b">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
            <Link href={`/${locale}`} className="text-fg hover:text-accent transition-colors">
              <Logo />
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-fg-muted hidden text-sm sm:inline">
                {session.fullName ?? session.email}
              </span>

              <form action={signOut}>
                <button
                  type="submit"
                  className="eyebrow border-line text-fg-muted hover:border-fg-muted/60 hover:text-fg rounded-(--radius-card) border px-3 py-1.5 text-[0.75rem] transition-colors"
                >
                  {dict.common.signOut}
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
