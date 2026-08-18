import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { regionKeys } from "@/content/shared";
import type { Dictionary } from "@/content/types";

/**
 * Red internacional (§35).
 *
 * El documento es explícito: no afirmar operación donde no la hay. Por eso
 * cada región lleva una nota que dice exactamente en qué estado está, y hay un
 * descargo al pie. "Expanding", no "presente en".
 */
export function GlobalNetwork({ dict }: { readonly dict: Dictionary }) {
  return (
    <Section surface="raised" width="wide" divider>
      <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-24">
        <SectionHeading
          eyebrow={dict.home.network.eyebrow}
          heading={dict.home.network.heading}
          lede={dict.home.network.lede}
        />

        <div className="flex flex-col gap-8">
          <RevealGroup className="border-line flex flex-col border-t">
            {regionKeys.map((key) => {
              const note = dict.home.network.regions.find((item) => item.key === key)?.note;

              return (
                <RevealItem
                  key={key}
                  className="border-line flex flex-col gap-2 border-b py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
                >
                  <h3 className="font-display text-xl">{dict.regions[key]}</h3>
                  <p className="text-fg-muted max-w-[38ch] text-sm text-pretty sm:text-right">
                    {note}
                  </p>
                </RevealItem>
              );
            })}
          </RevealGroup>

          <Reveal>
            <p className="text-fg-muted/60 max-w-[62ch] text-xs text-pretty">
              {dict.home.network.disclaimer}
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
