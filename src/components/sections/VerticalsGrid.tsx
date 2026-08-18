import Link from "next/link";

import { ArrowEast } from "@/components/ui/Button";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { navHrefs, verticalNav } from "@/content/shared";
import type { Dictionary } from "@/content/types";
import type { MediaTone, Vertical } from "@/lib/domain/types";
import { localizePath, type Locale } from "@/lib/i18n/config";

/** Familia visual del placeholder por vertical, hasta que haya fotografía. */
const tones: Record<Vertical, MediaTone> = {
  "real-estate": "architecture",
  motors: "motors",
  aviation: "aviation",
  "private-services": "services",
  business: "business",
};

/**
 * Las cinco categorías principales (§14), cada una con tratamiento editorial.
 * La primera ocupa el doble de ancho: una rejilla perfectamente regular se lee
 * como catálogo, y una con jerarquía se lee como revista.
 */
export function VerticalsGrid({
  locale,
  dict,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
}) {
  return (
    <Section id="categories" width="wide" divider>
      <SectionHeading
        eyebrow={dict.home.verticals.eyebrow}
        heading={dict.home.verticals.heading}
        lede={dict.home.verticals.lede}
      />

      <RevealGroup className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {verticalNav.map((item, index) => {
          const copy = dict.verticals[item.vertical];
          const featured = index === 0;

          return (
            <RevealItem
              key={item.vertical}
              className={featured ? "sm:col-span-2 lg:col-span-2" : undefined}
            >
              <Link href={localizePath(navHrefs[item.key], locale)} className="group flex h-full flex-col gap-5">
                <div className="overflow-hidden rounded-(--radius-card)">
                  <EditorialImage
                    media={{
                      id: `vertical-${item.vertical}`,
                      kind: "image",
                      alt: `Placa editorial de la categoría ${copy.eyebrow}`,
                      tone: tones[item.vertical],
                    }}
                    ratio={featured ? "16/9" : "4/3"}
                    sizes={
                      featured
                        ? "(max-width: 640px) 100vw, 66vw"
                        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    }
                    className="transition-transform duration-(--duration-slow) ease-(--ease-brand) group-hover:scale-[1.02]"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl transition-colors group-hover:text-accent">
                      {copy.eyebrow}
                    </h3>
                    <ArrowEast className="text-accent shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="text-fg-muted max-w-[42ch] text-sm text-pretty">{copy.teaser}</p>
                </div>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </Section>
  );
}
