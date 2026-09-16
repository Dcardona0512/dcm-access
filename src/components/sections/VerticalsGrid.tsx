import Link from "next/link";

import { CardVideo } from "@/components/sections/CardVideo";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { navHrefs, verticalNav, verticalVideos } from "@/content/shared";
import type { Dictionary } from "@/content/types";
import type { MediaTone, Vertical } from "@/lib/domain/types";
import { localizePath, type Locale } from "@/lib/i18n/config";

/** Familia visual del placeholder por vertical, hasta que haya fotografía. */
const tones: Record<Vertical, MediaTone> = {
  "real-estate": "architecture",
  motors: "motors",
  aviation: "aviation",
  servicios: "services",
  negocios: "business",
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
              {/*
                El estado de foco se trata igual que el del ratón: quien navega
                con el teclado tiene derecho a la misma señal. De ahí que todo
                lo de abajo vaya en pares `group-hover` / `group-focus-visible`.
              */}
              <Link
                href={localizePath(navHrefs[item.key], locale)}
                className="group flex h-full flex-col gap-5 outline-none"
              >
                {/*
                  El metraje va ENCIMA de la placa, no en su lugar: mientras no
                  haya un fotograma decodificado el vídeo no pinta nada y se ve
                  la placa. Así la tarjeta nunca es un rectángulo vacío, y las
                  dos categorías que todavía no tienen vídeo se quedan con ella
                  sin ningún caso especial.
                */}
                <div className="relative overflow-hidden rounded-(--radius-card) transition-transform duration-(--duration-base) ease-(--ease-brand) group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
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
                    className="transition-transform duration-(--duration-slow) ease-(--ease-brand) group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
                  />

                  {verticalVideos[item.vertical] ? (
                    <CardVideo src={verticalVideos[item.vertical]!.src} />
                  ) : null}

                  {/*
                    El velo es el efecto. En reposo la tarjeta está apagada, y
                    al pasar por encima se abre: la imagen recupera su luz y la
                    señal se lee desde el otro extremo de la pantalla, sin
                    necesidad de buscar una flecha de doce píxeles.

                    Va encima del vídeo, y por eso la capa existe aunque la
                    tarjeta no tenga metraje: es la misma respuesta para las
                    cinco.
                  */}
                  <div
                    aria-hidden="true"
                    className="bg-surface/45 pointer-events-none absolute inset-0 transition-opacity duration-(--duration-base) ease-(--ease-brand) group-hover:opacity-0 group-focus-visible:opacity-0"
                  />

                  {/* Filete de acento, por dentro del borde para que no mueva
                      el trazado ni desplace nada al aparecer.

                      La transición es `transition` a secas, no la de la
                      variable de color: el anillo lo dibuja una `box-shadow`,
                      así que animar `--tw-ring-color` no interpola nada y el
                      filete aparecía de golpe. */}
                  <div
                    aria-hidden="true"
                    className="ring-accent/0 group-hover:ring-accent/50 group-focus-visible:ring-accent/50 pointer-events-none absolute inset-0 rounded-(--radius-card) ring-1 ring-inset transition duration-(--duration-base) ease-(--ease-brand)"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-3">
                  <h3 className="font-display group-focus-visible:text-accent group-hover:text-accent text-2xl transition-colors">
                    {copy.eyebrow}
                  </h3>
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
