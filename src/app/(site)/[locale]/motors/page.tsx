import type { Metadata } from "next";

import { MotorsMarketplace, motorsMetadata } from "@/components/pages/MotorsMarketplace";
import { verticalVideos } from "@/content/shared";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return motorsMetadata(locale);
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  /**
   * Leer los filtros de la URL vuelve la página dinámica y le quita el
   * prerenderizado estático. Es el precio de filtrar sin JavaScript.
   */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);

  /**
   * `bright` va por el PICO, no por la media. Este metraje promedia 0,27
   * —bastante más oscuro que el de Aviación, 0,48— pero llega a 0,91 en las
   * veinticuatro columnas muestreadas, y el texto se pierde en el fotograma
   * más claro que pase, no en el promedio del vídeo.
   */
  return (
    <MotorsMarketplace
      localeRaw={locale}
      searchParams={sp}
      backgroundVideo={verticalVideos["motors"]}
    />
  );
}
