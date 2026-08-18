import { ArrowEast, Button } from "@/components/ui/Button";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { Dictionary } from "@/content/types";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * El proceso de brokerage en seis etapas (§5).
 *
 * Se reutiliza tal cual en la home y en la página de Brokerage: es el mismo
 * contenido y debe leerse idéntico en ambos sitios.
 */
export function ProcessSteps({
  locale,
  dict,
  variant = "home",
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly variant?: "home" | "page";
}) {
  const copy = variant === "home" ? dict.home.process : dict.brokerage;

  return (
    <Section width="wide" divider={variant === "home"}>
      <SectionHeading
        eyebrow={variant === "home" ? dict.home.process.eyebrow : undefined}
        heading={variant === "home" ? dict.home.process.heading : dict.brokerage.statement}
        lede={"lede" in copy ? copy.lede : undefined}
        action={
          variant === "home" ? (
            <Button href={localizePath("/brokerage", locale)} variant="outline" size="sm">
              {dict.home.process.cta}
              <ArrowEast />
            </Button>
          ) : undefined
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
