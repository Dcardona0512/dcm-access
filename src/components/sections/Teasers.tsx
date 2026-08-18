import { AccessMark } from "@/components/brand/AccessMark";
import { ArrowEast, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import type { Dictionary } from "@/content/types";
import { localizePath, type Locale } from "@/lib/i18n/config";

/**
 * Anticipo de DCM ACCESS PRIVATE (§16).
 *
 * Es la única sección de la home que va sobre negro puro y a sangre completa:
 * el cambio de superficie es lo que comunica que se entra en otro territorio,
 * antes incluso de leer el texto.
 */
export function PrivateTeaser({
  locale,
  dict,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
}) {
  return (
    <section className="border-line relative isolate overflow-hidden border-t py-(--spacing-section)">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 80% at 50% 100%, rgb(var(--c-glow-accent) / 0.07) 0%, transparent 70%)",
          }}
        />
        <AccessMark
          className="text-fg absolute top-1/2 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.02]"
          weight={4}
        />
      </div>

      <Container>
        <Reveal className="flex flex-col items-center gap-8 text-center">
          <Eyebrow>{dict.home.privateTeaser.eyebrow}</Eyebrow>

          <h2 className="font-display text-display-2 max-w-[18ch] text-balance">
            {dict.home.privateTeaser.heading}
          </h2>

          <p className="text-lede text-fg-muted max-w-[58ch] text-pretty">
            {dict.home.privateTeaser.lede}
          </p>

          <Button href={localizePath("/private", locale)} variant="accent" size="lg">
            {dict.home.privateTeaser.cta}
            <ArrowEast />
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * Llamada a proveedores (§18). Va sobre marfil: es la única sección de la home
 * dirigida al lado de la oferta, y el cambio de superficie lo señala.
 */
export function PartnerTeaser({
  locale,
  dict,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
}) {
  return (
    <Section surface="inverse" width="wide">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-24">
        <SectionHeading
          eyebrow={dict.home.partnerTeaser.eyebrow}
          heading={dict.home.partnerTeaser.heading}
          lede={dict.home.partnerTeaser.lede}
          onInverse
        />

        <div className="flex flex-col gap-6 lg:items-end">
          <Button href={localizePath("/partners", locale)} size="lg" onInverse>
            {dict.home.partnerTeaser.cta}
            <ArrowEast />
          </Button>
          <p className="text-inverse-muted max-w-[44ch] text-sm text-pretty lg:text-right">
            {dict.partners.curationBody}
          </p>
        </div>
      </div>
    </Section>
  );
}
