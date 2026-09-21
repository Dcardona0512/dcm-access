import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { EditorialImage } from "@/components/ui/EditorialImage";
import type { Dictionary } from "@/content/types";
import type { Locale } from "@/lib/i18n/config";

/* ============================================================================
   EL MARCO DEL ACCESO
   ----------------------------------------------------------------------------
   Pantalla partida: el formulario en una mitad y la marca a sangre en la otra,
   que llena su mitad de arriba abajo sin margen. En el teléfono la mitad de la
   marca no se dibuja —a ese ancho ocuparía la pantalla entera y empujaría el
   formulario debajo del pliegue— y el formulario se centra en el ancho
   completo.

   La mitad de la derecha es la PLACA EDITORIAL de la casa, la misma que se
   dibuja cuando una ficha no tiene fotografía: degradado, trama, monograma y
   viñeteado. Cero archivos nuevos, cero descarga, y es exactamente la marca.

   Es un componente de SERVIDOR que envuelve al formulario, y eso importa: al
   pasar de «escribe tu correo» a «correo enviado» lo único que cambia es lo de
   dentro. El marco, el logotipo y el pie no se vuelven a montar, así que la
   pantalla no parpadea.
   ========================================================================== */

export function MarcoDeAcceso({
  locale,
  dict,
  pie,
  children,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
  /** La línea de abajo: el camino a la otra pantalla. */
  readonly pie?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center px-6 py-10 sm:px-10">
        <Link
          href={`/${locale}`}
          className="text-fg hover:text-accent transition-colors"
          aria-label={dict.meta.homeTitle}
        >
          <Logo variant="stacked" descriptor={dict.brand.logoTagline} />
        </Link>

        {/*
          El formulario centrado en el alto que sobra, y el pie CON él. Suelto,
          el `flex-1` lo mandaba al fondo de la pantalla: en un monitor alto
          quedaba tan abajo que nadie llegaba a leerlo.
        */}
        <div className="flex w-full flex-1 flex-col items-center justify-center py-10">
          <div className="w-full max-w-sm">
            {children}
            {pie ? <p className="text-fg-muted mt-8 text-center text-sm">{pie}</p> : null}
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <EditorialImage ratio="fill" className="h-full rounded-none" />
      </div>
    </div>
  );
}
