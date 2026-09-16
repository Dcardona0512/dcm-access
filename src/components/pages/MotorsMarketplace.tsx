import Link from "next/link";
import { notFound } from "next/navigation";

import { MotorsFilters, type MotorsFilterState } from "@/components/motors/MotorsFilters";
import { MotorsCard } from "@/components/opportunities/MotorsCard";
import { HeroVideo, type VideoTone } from "@/components/sections/HeroVideo";
import { ArrowEast, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import { getDictionary } from "@/content";
import { getRepositories } from "@/lib/data";
import type { OpportunityQuery } from "@/lib/data/repositories";
import { localized } from "@/lib/domain/types";
import { isLocale, localizePath, type Locale } from "@/lib/i18n/config";
import { navHrefs, whatsappHref } from "@/content/shared";
import { breadcrumbSchema, buildMetadata, jsonLd, siteUrl } from "@/lib/seo";

/* ============================================================================
   MERCADO DE VEHÍCULOS
   ----------------------------------------------------------------------------
   Hermano de `VerticalPage`, no una variante suya. La landing editorial sigue
   sirviendo a las otras cuatro verticales sin enterarse de que esto existe, y
   por tanto no puede romperse desde aquí.

   El orden es la decisión de fondo: el vídeo ocupa la ventana entera para que
   se aprecie, y lo PRIMERO que aparece al bajar son los vehículos. La prosa de
   la categoría no desaparece —el encuadre de blindados es una declaración
   regulatoria (§26)— pero baja debajo de la parrilla, que es donde deja de
   estorbar y sigue cumpliendo.
   ========================================================================== */

const VERTICAL = "motors" as const;
const PAGE_SIZE = 12;

export async function motorsMetadata(localeRaw: string) {
  if (!isLocale(localeRaw)) return {};

  const dict = getDictionary(localeRaw);

  return buildMetadata({
    locale: localeRaw,
    path: "/motors",
    title: dict.verticals.motors.title,
    description: dict.verticals.motors.lede,
  });
}

/** Lee un parámetro repetible quedándose con el primer valor no vacío. */
function one(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/** Construye un rango solo si alguno de sus extremos es utilizable. */
function range(min: string | undefined, max: string | undefined) {
  const from = toNumber(min);
  const to = toNumber(max);
  return from === undefined && to === undefined ? undefined : { min: from, max: to };
}

export async function MotorsMarketplace({
  localeRaw,
  searchParams,
  backgroundVideo,
}: {
  readonly localeRaw: string;
  readonly searchParams: Record<string, string | string[] | undefined>;
  readonly backgroundVideo?: { readonly src: string; readonly tone: VideoTone };
}) {
  if (!isLocale(localeRaw)) notFound();

  const locale: Locale = localeRaw;
  const dict = getDictionary(locale);
  const copy = dict.verticals.motors;
  const market = dict.motorsMarket;

  const state: MotorsFilterState = {
    q: one(searchParams.q),
    make: one(searchParams.make),
    city: one(searchParams.city),
    yearMin: one(searchParams.yearMin),
    yearMax: one(searchParams.yearMax),
    minPrice: one(searchParams.minPrice),
    maxPrice: one(searchParams.maxPrice),
    kmMax: one(searchParams.kmMax),
  };

  const page = Math.max(1, Number(one(searchParams.page) ?? "1") || 1);

  const attributeRanges: OpportunityQuery["attributeRanges"] = {
    ...(range(state.yearMin, state.yearMax) ? { year: range(state.yearMin, state.yearMax)! } : {}),
    ...(range(undefined, state.kmMax) ? { mileage: range(undefined, state.kmMax)! } : {}),
  };

  const query: OpportunityQuery = {
    q: state.q,
    vertical: VERTICAL,
    city: state.city,
    minPrice: toNumber(state.minPrice),
    maxPrice: toNumber(state.maxPrice),
    attributes: state.make ? { make: state.make } : undefined,
    attributeRanges: Object.keys(attributeRanges).length > 0 ? attributeRanges : undefined,
    /**
     * Con texto libre manda la relevancia; sin él, lo más nuevo primero.
     * Ordenar por fecha una búsqueda de "porsche" calcula la puntuación y
     * luego la tira: el Porsche quedaría tercero detrás de dos coches que solo
     * comparten categoría.
     */
    sort: state.q ? "relevance" : "newest",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };

  // Ya no hace falta el catálogo de categorías: con una por sección, el filtro
  // de tipo desapareció y la tarjeta de vehículo no lo muestra.
  const { opportunities } = getRepositories();
  const results = await opportunities.search(query);

  const totalPages = Math.max(1, Math.ceil(results.total / PAGE_SIZE));

  const sellHref = whatsappHref(dict.common.sellMessage) ?? localizePath(navHrefs.contact, locale);
  const sellExternal = sellHref.startsWith("http") ? "_blank" : undefined;

  /** Conserva los filtros al paginar: cambiar de página no es reiniciar. */
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(state)) {
      if (value) params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return `${localizePath("/motors", locale)}${qs ? `?${qs}` : ""}#buscar`;
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema(locale, [
              { name: "DCM ACCESS", path: "/" },
              { name: copy.eyebrow, path: "/motors" },
            ]),
          ),
        }}
      />

      {/* Una parrilla de mercado es una lista: decírselo al buscador es gratis. */}
      {results.items.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: market.heading,
              numberOfItems: results.total,
              itemListElement: results.items.map((item, index) => ({
                "@type": "ListItem",
                position: (page - 1) * PAGE_SIZE + index + 1,
                name: localized(item.title, locale),
                url: `${siteUrl}/${locale}/motors/${item.slug}`,
              })),
            }),
          }}
        />
      ) : null}

      {backgroundVideo ? <HeroVideo src={backgroundVideo.src} tone={backgroundVideo.tone} /> : null}

      <div className={backgroundVideo ? "dcm-over-video relative" : undefined}>
        {/* --- Cabecera: el vídeo a pantalla completa ----------------------- */}
        <section
          className={
            backgroundVideo
              ? "relative flex min-h-[100svh] flex-col justify-center pt-36 pb-16 md:pt-44"
              : "pt-36 pb-16 md:pt-44"
          }
        >
          {backgroundVideo ? (
            <div
              aria-hidden="true"
              className="dcm-vertical-scrim pointer-events-none absolute inset-0"
            />
          ) : null}

          <Container width="wide" className={backgroundVideo ? "relative" : undefined}>
            <div className={`flex max-w-3xl flex-col gap-6 ${backgroundVideo ? "dcm-text-halo" : ""}`}>
              <Eyebrow>{market.eyebrow}</Eyebrow>
              <h1 className="font-display text-display-2 text-balance">{copy.title}</h1>
              <p
                className={`text-lede max-w-[52ch] text-pretty ${
                  backgroundVideo ? "text-fg/85" : "text-fg-muted"
                }`}
              >
                {copy.lede}
              </p>

              {/*
                Ningún botón `accent`: la cabecera del sitio ya gasta el único
                dorado de la vista en "Solicitar acceso" (§8, §42). Vender es
                marfil sobre tinta, que además tiene más contraste.
              */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button href={sellHref} target={sellExternal} size="lg">
                  {market.sellCta}
                  <ArrowEast />
                </Button>
                <Button href="#buscar" variant="outline" size="lg">
                  {market.searchCta}
                </Button>
              </div>
            </div>
          </Container>

          {/* Señal de que hay algo debajo. Ancla, no script. */}
          {backgroundVideo ? (
            <Container width="wide" className="relative mt-16 md:mt-24">
              <Link
                href="#mercado"
                className="eyebrow text-fg-muted hover:text-fg inline-flex items-center gap-3 text-[0.8rem] transition-colors"
              >
                {market.scrollCue}
                <span aria-hidden="true" className="bg-line h-px w-10" />
              </Link>
            </Container>
          ) : null}
        </section>

        {/* --- El mercado: lo primero tras el primer scroll ------------------ */}
        <Section id="mercado" width="wide" divider>
          <SectionHeading
            eyebrow={market.eyebrow}
            heading={market.heading}
            action={
              <Button href={sellHref} target={sellExternal} variant="outline" size="sm">
                {market.sellCta}
                <ArrowEast />
              </Button>
            }
          />

          <div className="mt-12">
            <MotorsFilters
              locale={locale}
              dict={dict}
              facets={results.facets}
              state={state}
              total={results.total}
            />
          </div>

          {results.items.length === 0 ? (
            <EmptyState
              className="mt-14"
              heading={dict.catalog.empty.heading}
              body={dict.catalog.empty.body}
              action={
                <Button href={sellHref} target={sellExternal} variant="outline">
                  {market.sellCta}
                  <ArrowEast />
                </Button>
              }
            />
          ) : (
            <RevealGroup
              as="ul"
              stagger={0.05}
              className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
            >
              {results.items.map((opportunity, index) => (
                <RevealItem as="li" key={opportunity.id} className="flex">
                  <MotorsCard
                    opportunity={opportunity}
                    locale={locale}
                    dict={dict}
                    eager={index < 3}
                    className="w-full"
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          )}

          {totalPages > 1 ? (
            <nav
              className="border-line-soft mt-16 flex items-center justify-between gap-4 border-t pt-8"
              aria-label={dict.catalog.title}
            >
              <PageLink href={pageHref(page - 1)} disabled={page === 1}>
                {dict.common.previous}
              </PageLink>
              <span className="text-fg-muted/70 text-xs" data-numeric>
                {page} / {totalPages}
              </span>
              <PageLink href={pageHref(page + 1)} disabled={page === totalPages}>
                {dict.common.continue}
              </PageLink>
            </nav>
          ) : null}
        </Section>

        {/* --- La prosa de la categoría, ya sin estorbar -------------------- */}
        <Section surface="raised" width="wide" divider>
          <SectionHeading eyebrow={copy.eyebrow} heading={market.offeringsHeading} size="sm" />

          <div className="mt-10 flex flex-col gap-10">
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

            {/* Encuadre regulatorio de blindados y seguridad (§3, §26). */}
            {copy.compliance ? (
              <p className="border-accent/25 bg-accent/[0.03] text-fg-muted rounded-(--radius-card) border px-5 py-4 text-sm text-pretty">
                {copy.compliance}
              </p>
            ) : null}
          </div>
        </Section>

      </div>
    </>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  readonly href: string;
  readonly disabled: boolean;
  readonly children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="eyebrow text-fg-muted/30 text-[0.8rem]">{children}</span>;
  }

  return (
    <Link href={href} className="eyebrow text-fg-muted hover:text-fg text-[0.8rem] transition-colors">
      {children}
    </Link>
  );
}
