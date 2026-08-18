import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { Dictionary } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Los seis pilares de §34. Numerados y separados por filetes: la rejilla se
 * lee como un índice, no como seis tarjetas sueltas.
 */
export function WhyPillars({ dict }: { readonly dict: Dictionary }) {
  return (
    <Section surface="raised" width="wide" divider>
      <SectionHeading eyebrow={dict.home.why.eyebrow} heading={dict.home.why.heading} />

      <RevealGroup className="border-line mt-16 grid border-t sm:grid-cols-2 lg:grid-cols-3">
        {dict.home.why.pillars.map((pillar, index) => (
          <RevealItem
            key={pillar.key}
            // Los filetes verticales se calculan aquí en vez de con variantes
            // nth-child: menos ingenioso, pero legible y sin sorpresas.
            className={cn(
              "border-line flex flex-col gap-4 border-b py-10",
              index % 2 === 1 && "sm:border-l sm:pl-10",
              index % 2 === 0 && "sm:pr-10",
              index % 3 === 0 && "lg:border-l-0 lg:pr-10 lg:pl-0",
              index % 3 !== 0 && "lg:border-l lg:pl-10",
            )}
          >
            <span className="eyebrow text-accent-dim text-[0.5625rem]" data-numeric>
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-2xl">{pillar.title}</h3>
            <p className="text-fg-muted max-w-[38ch] text-sm text-pretty">{pillar.body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
