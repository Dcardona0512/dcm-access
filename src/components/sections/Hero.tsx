import { SearchPanel } from "@/components/search/SearchPanel";
import { ArrowEast, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brand, navHrefs } from "@/content/shared";
import type { Dictionary } from "@/content/types";
import { localizePath, type Locale } from "@/lib/i18n/config";

/**
 * Hero (§12).
 *
 * Nombre, promesa, una frase y dos acciones, sobre el vídeo de marca. Nada
 * más: la persona debe entender en pocos segundos qué es DCM ACCESS (§11), y
 * cada elemento que se añade aquí retrasa ese momento.
 *
 * Ocupa la altura completa de la ventana a propósito. El vídeo es la primera
 * impresión y necesita sitio para respirar; recortado a media pantalla se
 * lee como un banner, no como una portada.
 *
 * El vídeo NO termina aquí: queda fijo detrás de toda la portada y las
 * secciones siguientes pasan sobre él en translúcido.
 *
 * El texto se apoya en la mitad IZQUIERDA, y allí —y solo allí— hay una
 * sombra suave que le da contraste. El resto del plano queda limpio: oscurecer
 * el vídeo entero para salvar cuatro líneas sale caro y se nota.
 */
export function Hero({ locale, dict }: { readonly locale: Locale; readonly dict: Dictionary }) {
  return (
    // Sin fondo propio: aquí el vídeo se ve a plena intensidad. La capa fija
    // que lo sostiene la monta la página, no esta sección.
    <section className="relative flex min-h-[100svh] flex-col justify-end pt-32 pb-16 md:pb-20">
      {/*
        Sombra local del hero. Va ANTES del contenido en el DOM, así que este
        pinta encima sin necesidad de índices z. Concentra la densidad donde
        vive el texto —abajo a la izquierda— y se disuelve hacia los bordes,
        de modo que el resto del vídeo se ve limpio.
      */}
      <div
        aria-hidden="true"
        className="dcm-hero-pad pointer-events-none absolute inset-0"
      />

      <Container width="wide" className="relative">
        <div className="flex flex-col gap-10 md:gap-12">
          <div className="flex max-w-4xl flex-col gap-8">
            <p className="eyebrow text-accent">{dict.home.hero.eyebrow}</p>

            <div className="flex flex-col gap-5">
              {/* El nombre de la marca es el h1; el eslogan lo acompaña como
                  parte del mismo encabezado, no como un h2 suelto. */}
              <h1 className="flex flex-col gap-3">
                <span className="eyebrow text-fg/75 text-[0.6875rem]">{brand.name}</span>
                <span className="font-display text-display-1 text-balance">
                  {dict.brand.tagline
                    .toLocaleLowerCase(locale)
                    .replace(/^./, (character) => character.toLocaleUpperCase(locale))}
                </span>
              </h1>

              {/* Sobre vídeo el texto atenuado se sube a `fg/85`: el gris
                  `fg-muted` es legible sobre negro plano, pero no sobre un
                  fondo que cambia de luminosidad cada fotograma. */}
              <p className="text-lede text-fg/85 max-w-[54ch] text-pretty">
                {dict.home.hero.lede}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button href={localizePath(navHrefs.opportunities, locale)} size="lg">
                {dict.home.hero.primaryCta}
                <ArrowEast />
              </Button>
              <Button href={localizePath("/private/request", locale)} variant="outline" size="lg">
                {dict.home.hero.secondaryCta}
              </Button>
            </div>
          </div>

          <SearchPanel locale={locale} dict={dict} className="max-w-5xl" overVideo />
        </div>
      </Container>
    </section>
  );
}
