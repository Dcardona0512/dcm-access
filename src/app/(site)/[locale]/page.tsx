import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GlobalNetwork } from "@/components/sections/GlobalNetwork";
import { Hero } from "@/components/sections/Hero";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { SelectedOpportunities } from "@/components/sections/SelectedOpportunities";
import { PartnerTeaser, PrivateTeaser } from "@/components/sections/Teasers";
import { VerticalsGrid } from "@/components/sections/VerticalsGrid";
import { WhyPillars } from "@/components/sections/WhyPillars";
import { getDictionary } from "@/content";
import { isLocale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo";

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
    path: "/",
    title: dict.meta.homeTitle,
    description: dict.meta.siteDescription,
  });
}

/**
 * Homepage (§12–§16, §34, §35).
 *
 * El orden responde a las tres preguntas de §42 en secuencia: qué es esto
 * (hero), qué puedo hacer ahora (buscador), qué hay dentro (categorías y
 * selección), por qué confiar (pilares, proceso, red) y, por último, las dos
 * puertas: la privada para el cliente y la de partners para la oferta.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <>
      {/* Capa fija: permanece detrás de toda la portada mientras se recorre. */}
      <HeroVideo />

      {/*
        `dcm-over-video` redefine los tokens de superficie a versiones
        translúcidas dentro de este ámbito. Ninguna sección se entera: siguen
        pidiendo `bg-surface`, que aquí resulta valer un negro al 90 %. El
        vídeo se percibe a través de todo el recorrido sin que el texto pierda
        contraste.
      */}
      <div className="dcm-over-video relative">
        <Hero locale={locale} dict={dict} />
        <VerticalsGrid locale={locale} dict={dict} />
        <SelectedOpportunities locale={locale} dict={dict} />
        <WhyPillars dict={dict} />
        <ProcessSteps locale={locale} dict={dict} />
        <GlobalNetwork dict={dict} />
        <PrivateTeaser locale={locale} dict={dict} />
        <PartnerTeaser locale={locale} dict={dict} />
      </div>
    </>
  );
}
