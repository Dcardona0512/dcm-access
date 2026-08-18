import { ArrowEast } from "@/components/ui/Button";
import type { Dictionary } from "@/content/types";
import { verticals } from "@/lib/domain/types";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/* ============================================================================
   BUSCADOR PRINCIPAL (§13)
   ----------------------------------------------------------------------------
   "Extremadamente visible" y "no como un buscador tradicional de clasificados".

   Es un formulario GET nativo: cero JavaScript, funciona con el navegador
   apagado, deja la búsqueda en una URL compartible e indexable y se renderiza
   en el servidor.

   Lo que lo hace sentir premium no es la interacción, es la contención: un
   campo enorme, un filete, y una sola acción. Nada más: las sugerencias que
   había debajo se retiraron a propósito — cuanto menos ruido, mejor.
   ========================================================================== */

export function SearchPanel({
  locale,
  dict,
  defaultQuery = "",
  defaultVertical = "",
  className,
  overVideo = false,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly defaultQuery?: string;
  readonly defaultVertical?: string;
  readonly className?: string;
  /**
   * Sobre el vídeo el panel deja de ser translúcido y se vuelve casi opaco.
   * Un formulario tiene que ser legible SIEMPRE, y detrás hay un fondo que
   * cambia de luminosidad todo el rato: la transparencia bonita del resto del
   * sitio aquí se convierte en un problema de lectura.
   */
  readonly overVideo?: boolean;
}) {
  const action = localizePath("/opportunities", locale);

  return (
    <form
      action={action}
      method="get"
      role="search"
      className={cn(
        "border-line edge-light rounded-(--radius-card) border",
        overVideo
          ? "bg-surface/92 shadow-[0_24px_70px_-30px_rgb(0_0_0/0.9)] backdrop-blur-xl"
          : "bg-surface-raised/60 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-col divide-y divide-(--color-line) md:flex-row md:divide-x md:divide-y-0">
        <div className="flex flex-col gap-2 p-5 md:w-56 md:shrink-0">
          <label htmlFor="search-vertical" className="eyebrow text-fg-muted text-[0.5625rem]">
            {dict.home.search.categoryLabel}
          </label>
          <select
            id="search-vertical"
            name="vertical"
            defaultValue={defaultVertical}
            className="text-fg w-full cursor-pointer appearance-none bg-transparent text-sm outline-none"
          >
            <option value="" className="bg-surface-raised">
              {dict.home.search.anyCategory}
            </option>
            {verticals.map((vertical) => (
              <option key={vertical} value={vertical} className="bg-surface-raised">
                {dict.verticals[vertical].eyebrow}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <label htmlFor="search-query" className="eyebrow text-fg-muted text-[0.5625rem]">
            {dict.home.search.label}
          </label>
          <input
            id="search-query"
            name="q"
            type="search"
            defaultValue={defaultQuery}
            placeholder={dict.home.search.placeholder}
            autoComplete="off"
            className="text-fg placeholder:text-fg-muted/50 w-full bg-transparent text-base outline-none md:text-lg"
          />
        </div>

        <div className="p-5 md:flex md:items-center">
          <button
            type="submit"
            className={cn(
              "eyebrow group bg-fg text-surface flex h-12 w-full items-center justify-center gap-2.5 px-7",
              "rounded-(--radius-card) transition-colors hover:opacity-90 md:w-auto",
            )}
          >
            {dict.home.search.action}
            <ArrowEast />
          </button>
        </div>
      </div>
    </form>
  );
}
