import type { Metadata } from "next";

import { VerticalPage, verticalMetadata } from "@/components/pages/VerticalPage";

const VERTICAL = "aviation" as const;

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
   * Aviación es, por ahora, la única vertical con metraje de marca propio, así
   * que el fondo se declara aquí y no en `VerticalPage`: la página sabe qué
   * material tiene, el componente solo sabe qué hacer con él.
   */
  return (
    <VerticalPage
      vertical={VERTICAL}
      localeRaw={locale}
      backgroundVideo={{ src: "/media/aviation.mp4", tone: "bright" }}
    />
  );
}
