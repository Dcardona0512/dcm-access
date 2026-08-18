import { notFound } from "next/navigation";

import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { HeroVideo, type VideoTone } from "@/components/sections/HeroVideo";
import { SearchPanel } from "@/components/search/SearchPanel";
import { ArrowEast, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import { getDictionary } from "@/content";
import { getRepositories } from "@/lib/data";
import { localized, type MediaTone, type Vertical } from "@/lib/domain/types";
import { isLocale, localizePath } from "@/lib/i18n/config";
import { breadcrumbSchema, buildMetadata, jsonLd } from "@/lib/seo";

const tones: Record<Vertical, MediaTone> = {
  "real-estate": "architecture",
  motors: "motors",
  aviation: "aviation",
  "private-services": "services",
  business: "business",
};

export async function verticalMetadata(vertical: Vertical, localeRaw: string) {
  if (!isLocale(localeRaw)) return {};

  const dict = getDictionary(localeRaw);
  const copy = dict.verticals[vertical];

  return buildMetadata({
    locale: localeRaw,
    path: `/${vertical}`,
    title: copy.title,
    description: copy.lede,
  });
}

/**
 * Landing de vertical (§14).
 *
 * Cabecera editorial, el listado de lo que se puede pedir dentro de la
 * categoría (§3), las oportunidades publicadas y una salida hacia la búsqueda
 * privada — que en varias verticales es el camino real, porque casi nada de lo
 * que se mueve llega a publicarse.
 */
export async function VerticalPage({
  vertical,
  localeRaw,
  backgroundVideo,
}: {
  readonly vertical: Vertical;
  readonly localeRaw: string;
  /**
   * Metraje de marca para esta vertical. Cuando se pasa, la página adopta el
   * tratamiento de la portada: capa fija detrás de todo el recorrido y
   * superficies translúcidas encima. Cuando no, la vertical se ve como
   * siempre — es opcional a propósito, porque no todas tienen vídeo propio y
   * ninguna debe depender de tenerlo.
   */
  readonly backgroundVideo?: { readonly src: string; readonly tone: VideoTone };
}) {
  if (!isLocale(localeRaw)) notFound();

  const locale = localeRaw;
  const dict = getDictionary(locale);
  const copy = dict.verticals[vertical];

  const { opportunities, categories } = getRepositories();
  const [results, verticalCategories, allCategories] = await Promise.all([
    opportunities.search({ vertical, sort: "newest", limit: 6 }),
    categories.byVertical(vertical),
    categories.list(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema(locale, [
              { name: "DCM ACCESS", path: "/" },
              { name: copy.eyebrow, path: `/${vertical}` },
            ]),
          ),
        }}
      />

      {/* Capa fija: permanece detrás de todo el recorrido de la vertical. */}
      {backgroundVideo ? <HeroVideo src={backgroundVideo.src} tone={backgroundVideo.tone} /> : null}

      {/*
        `dcm-over-video` redefine los tokens de superficie a versiones
        translúcidas dentro de este ámbito. Ninguna sección se entera: siguen
        pidiendo `bg-surface`, que aquí resulta valer un negro al 90 %.
      */}
      <div className={backgroundVideo ? "dcm-over-video relative" : undefined}>
        {/* --- Cabecera editorial ----------------------------------------- */}
        <section
          className={
            backgroundVideo
              ? // Con vídeo la cabecera ocupa la ventana completa, como el hero
                // de la portada: el metraje es la primera impresión y recortado
                // a media pantalla se lee como un banner.
                "relative flex min-h-[100svh] flex-col justify-center pt-36 pb-16 md:pt-44"
              : "pt-36 pb-16 md:pt-44"
          }
        >
          {/*
            Gradación del cuadro. Va ANTES del contenido en el DOM, así que
            este pinta encima sin necesidad de índices z. Cubre la sección
            entera a propósito: son caídas ancladas a los bordes, y una sombra
            que nace en el borde no se ve como una mancha — se ve como luz.
          */}
          {backgroundVideo ? (
            <div
              aria-hidden="true"
              className="dcm-vertical-scrim pointer-events-none absolute inset-0"
            />
          ) : null}

          <Container width="wide" className={backgroundVideo ? "relative" : undefined}>
            <div
              className={
                backgroundVideo
                  ? "max-w-3xl"
                  : "grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-20"
              }
            >
              <div className={`flex flex-col gap-6 ${backgroundVideo ? "dcm-text-halo" : ""}`}>
                <Eyebrow>{copy.eyebrow}</Eyebrow>
                <h1 className="font-display text-display-2 text-balance">{copy.title}</h1>
                {/* Sobre vídeo el gris atenuado no basta: `fg-muted` es legible
                    sobre negro plano, no sobre un fondo que cambia de
                    luminosidad cada fotograma. */}
                <p
                  className={`text-lede max-w-[52ch] text-pretty ${
                    backgroundVideo ? "text-fg/85" : "text-fg-muted"
                  }`}
                >
                  {copy.lede}
                </p>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button
                    href={`${localizePath("/opportunities", locale)}?vertical=${vertical}`}
                    size="lg"
                  >
                    {dict.common.explore}
                    <ArrowEast />
                  </Button>
                  <Button
                    href={`${localizePath("/private/request", locale)}?vertical=${vertical}`}
                    variant="outline"
                    size="lg"
                  >
                    {dict.common.privateRequest}
                  </Button>
                </div>
              </div>

              {/*
                La placa editorial existe porque todavía no hay fotografía real
                de la categoría. Donde SÍ hay metraje de marca, sobra: el vídeo
                es la imagen, y dejar además un marcador de posición al lado
                sería enseñar el andamio.
              */}
              {backgroundVideo ? null : (
                <EditorialImage
                  media={{
                    id: `vertical-hero-${vertical}`,
                    kind: "image",
                    alt: `Placa editorial de la categoría ${copy.eyebrow}`,
                    tone: tones[vertical],
                  }}
                  ratio="3/2"
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                />
              )}
            </div>
          </Container>
        </section>

        {/* --- Qué se puede pedir aquí (§3) --------------------------------- */}
        <Section surface="raised" width="wide" divider>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-24">
            <SectionHeading
              eyebrow={dict.home.verticals.eyebrow}
              heading={
                verticalCategories.length > 0
                  ? localized(verticalCategories[0].name, locale)
                  : copy.eyebrow
              }
              size="sm"
              className="lg:sticky lg:top-28 lg:self-start"
            />

            <div className="flex flex-col gap-10">
              <ul className="border-line grid gap-x-10 border-t sm:grid-cols-2">
                {copy.offerings.map((offering) => (
                  <li
                    key={offering}
                    className="border-line text-fg-muted flex items-center gap-3 border-b py-3.5 text-sm"
                  >
                    <span className="bg-accent-dim/60 h-px w-4 shrink-0" aria-hidden="true" />
                    {offering}
                  </li>
                ))}
              </ul>

              {/* Encuadre regulatorio en aviación, seguridad y blindados
                (§3, §26): dónde termina la intermediación y empieza el
                proveedor habilitado. */}
              {copy.compliance ? (
                <p className="border-accent/25 bg-accent/[0.03] text-fg-muted rounded-(--radius-card) border px-5 py-4 text-sm text-pretty">
                  {copy.compliance}
                </p>
              ) : null}
            </div>
          </div>
        </Section>

        {/* --- Oportunidades publicadas ------------------------------------- */}
        <Section width="wide" divider>
          <SectionHeading
            eyebrow={dict.home.selected.eyebrow}
            heading={dict.catalog.title}
            action={
              <Button
                href={`${localizePath("/opportunities", locale)}?vertical=${vertical}`}
                variant="outline"
                size="sm"
              >
                {dict.home.selected.cta}
                <ArrowEast />
              </Button>
            }
          />

          {results.items.length === 0 ? (
            <EmptyState
              className="mt-14"
              heading={dict.catalog.empty.heading}
              body={dict.catalog.empty.body}
              action={
                <Button
                  href={`${localizePath("/private/request", locale)}?vertical=${vertical}`}
                  variant="accent"
                >
                  {dict.catalog.empty.cta}
                  <ArrowEast />
                </Button>
              }
            />
          ) : (
            <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {results.items.map((opportunity, index) => (
                <li key={opportunity.id} className="flex">
                  <OpportunityCard
                    opportunity={opportunity}
                    category={allCategories.find((c) => c.id === opportunity.categoryId)}
                    locale={locale}
                    dict={dict}
                    priority={index < 3}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* --- Buscador ------------------------------------------------------ */}
        <Section width="wide" divider>
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow={dict.home.search.heading}
              heading={dict.catalog.empty.heading}
              lede={dict.catalog.empty.body}
              size="sm"
            />
            <SearchPanel
              locale={locale}
              dict={dict}
              defaultVertical={vertical}
              overVideo={Boolean(backgroundVideo)}
            />
          </div>
        </Section>
      </div>
    </>
  );
}
