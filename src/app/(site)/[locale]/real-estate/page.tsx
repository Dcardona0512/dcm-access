import type { Metadata } from "next";

import { VerticalPage, verticalMetadata } from "@/components/pages/VerticalPage";
import { verticalVideos } from "@/content/shared";

const VERTICAL = "real-estate" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return verticalMetadata(VERTICAL, locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  /**
   * El metraje más exigente de los cuatro: promedia 0,40 y alcanza BLANCO PURO
   * en las veinticuatro columnas muestreadas — no hay una sola franja del plano
   * donde el texto pueda apoyarse sin gradación.
   */
  return (
    <VerticalPage
      vertical={VERTICAL}
      localeRaw={locale}
      backgroundVideo={verticalVideos["real-estate"]}
    />
  );
}
