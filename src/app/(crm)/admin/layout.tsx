import type { Metadata } from "next";

import { fontVariables } from "@/lib/fonts";

import "@/app/globals.css";

/**
 * Raíz del CRM (§22).
 *
 * Layout raíz independiente del sitio público: el panel no se traduce, no
 * lleva la cabecera de marca ni el pie, y nunca debe indexarse.
 *
 * Aquí NO hay comprobación de sesión, y es deliberado: este layout también
 * envuelve la pantalla de acceso. Poner el guardián en la raíz haría que la
 * página de entrada se redirigiera a sí misma. La barra lateral y la guarda
 * viven en el grupo `(panel)`, que solo envuelve lo que exige sesión.
 */
export const metadata: Metadata = {
  title: "CRM — DCM ACCESS",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontVariables}>
      <body className="bg-surface text-fg font-sans antialiased">{children}</body>
    </html>
  );
}
