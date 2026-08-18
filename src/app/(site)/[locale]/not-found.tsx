import { AccessMark } from "@/components/brand/AccessMark";
import { ArrowEast, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/content";
import { defaultLocale } from "@/lib/i18n/config";

/**
 * 404 dentro del sitio.
 *
 * No recibe `params`, así que usa el idioma por defecto. Aun así ofrece las
 * dos salidas útiles: el catálogo y la búsqueda privada — una oportunidad
 * retirada sigue siendo un motivo legítimo para pedir que la busquemos.
 */
export default function NotFound() {
  const dict = getDictionary(defaultLocale);

  return (
    <Container width="narrow">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 py-40 text-center">
        <AccessMark className="text-accent h-10 w-10 opacity-50" weight={6} />

        <div className="flex flex-col gap-4">
          <h1 className="font-display text-display-3 text-balance">
            {dict.errors.notFoundHeading}
          </h1>
          <p className="text-fg-muted max-w-[46ch] text-pretty">{dict.errors.notFoundBody}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={`/${defaultLocale}`}>
            {dict.errors.notFoundCta}
            <ArrowEast />
          </Button>
          <Button href={`/${defaultLocale}/private/request`} variant="outline">
            {dict.privateRequest.eyebrow}
          </Button>
        </div>
      </div>
    </Container>
  );
}
