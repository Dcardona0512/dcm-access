import type { Metadata } from "next";

import { VerticalPage, verticalMetadata } from "@/components/pages/VerticalPage";

const VERTICAL = "motors" as const;

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
   * `bright` va por el PICO, no por la media. Este metraje promedia 0,27
   * —bastante más oscuro que el de Aviación, 0,48— pero llega a 0,91 en las
   * veinticuatro columnas muestreadas, y el texto se pierde en el fotograma
   * más claro que pase, no en el promedio del vídeo.
   */
  return (
    <VerticalPage
      vertical={VERTICAL}
      localeRaw={locale}
      backgroundVideo={{ src: "/media/motors.mp4", tone: "bright" }}
    />
  );
}
