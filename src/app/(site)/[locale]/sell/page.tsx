import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { getDictionary } from "@/content";
import { contact, whatsappHref } from "@/content/shared";
import { verticalLabels } from "@/lib/domain/labels";
import { localized, verticals } from "@/lib/domain/types";
import { isLocale, localizePath, locales } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo";

/* ============================================================================
   VENDER — LA PUERTA DE ENTRADA DE LA OFERTA
   ----------------------------------------------------------------------------
   Sin formulario, y es la decisión que define la página: quien vende un carro
   o un apartamento no rellena veinte campos desde el móvil. Elige la categoría,
   se abre WhatsApp con el mensaje escrito, y a partir de ahí la conversación
   la lleva alguien —pronto, un bot que hace las preguntas de esa categoría—.

   El mensaje sale con la CATEGORÍA YA DENTRO. No es un detalle de cortesía:
   es lo que permite que quien recibe —persona o bot— sepa desde el primer
   segundo qué cuestionario toca, sin preguntar nada.
   ========================================================================== */

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: "/sell",
    title: dict.sell.heading,
    description: dict.sell.lede,
  });
}

export default async function SellPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const copy = dict.sell;

  return (
    <Container width="wide">
      <div className="flex flex-col gap-(--spacing-section) py-32 md:py-40">
        <header className="flex max-w-[52ch] flex-col gap-6">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h1 className="font-display text-display-2 text-balance">{copy.heading}</h1>
          <p className="text-lede text-fg-muted text-pretty">{copy.lede}</p>
        </header>

        <section className="flex flex-col gap-8">
          <h2 className="eyebrow text-fg-muted text-[0.8rem]">{copy.chooseHeading}</h2>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {verticals.map((vertical) => {
              const etiqueta = localized(verticalLabels[vertical], locale);
              const mensaje = `${dict.common.sellMessage} ${etiqueta}`;
              const href = whatsappHref(mensaje, contact.whatsapp);

              return (
                <li key={vertical} className="flex">
                  <a
                    href={href ?? localizePath("/contact", locale)}
                    target={href ? "_blank" : undefined}
                    rel={href ? "noopener noreferrer" : undefined}
                    className="border-line bg-surface-raised hover:border-accent/60 group flex w-full flex-col gap-3 rounded-(--radius-card) border p-6 transition-colors"
                  >
                    <span className="font-display text-xl">{etiqueta}</span>
                    <span className="text-fg-muted text-sm text-pretty">
                      {dict.verticals[vertical].teaser}
                    </span>
                    <span className="eyebrow text-accent mt-2 text-[0.75rem]">{copy.cta}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <p className="text-fg-muted/70 max-w-[60ch] text-sm text-pretty">{copy.note}</p>
        </section>

        <section className="border-line grid gap-10 border-t pt-12 sm:grid-cols-3">
          {copy.steps.map((paso, indice) => (
            <div key={paso.title} className="flex flex-col gap-3">
              <span className="eyebrow text-accent text-[0.75rem]" data-numeric>
                {String(indice + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-lg">{paso.title}</h3>
              <p className="text-fg-muted text-sm text-pretty">{paso.body}</p>
            </div>
          ))}
        </section>
      </div>
    </Container>
  );
}
