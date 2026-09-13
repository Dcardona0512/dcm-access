import { ArrowEast, Button } from "@/components/ui/Button";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { Dictionary } from "@/content/types";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * El proceso de brokerage en seis etapas (§5).
 *
 * Tuvo una variante para la página de Brokerage, que ya no existe; con un solo
 * sitio de uso, la rama sobraba. Las etapas siguen viviendo en `dict.brokerage`
 * porque son el proceso, no un texto de la portada.
 */
export function ProcessSteps({
  locale,
  dict,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
}) {
  return (
    <Section width="wide" divider>
      <SectionHeading
        eyebrow={dict.home.process.eyebrow}
        heading={dict.home.process.heading}
        lede={dict.home.process.lede}
        action={
          <Button href={localizePath("/contact", locale)} variant="outline" size="sm">
            {dict.home.process.cta}
            <ArrowEast />
          </Button>
        }
      />

      <RevealGroup className="mt-16 grid gap-px sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
        {dict.brokerage.steps.map((step, index) => (
          <RevealItem
            key={step.key}
            className={cn(
              "bg-surface-raised edge-light relative flex flex-col gap-4 p-8 lg:p-10",
              "rounded-(--radius-card)",
            )}
          >
            {/* El número es el elemento dominante: convierte seis tarjetas en
                una secuencia con dirección. */}
            <span
              className="font-display text-accent-dim/40 absolute top-6 right-7 text-4xl leading-none"
              data-numeric
              aria-hidden="true"
            >
              {step.number}
            </span>

            <span className="eyebrow text-accent">{step.title}</span>
            <p className="text-fg-muted max-w-[36ch] text-sm text-pretty">{step.body}</p>

            {index < dict.brokerage.steps.length - 1 ? (
              <span className="sr-only">{index + 2}</span>
            ) : null}
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
