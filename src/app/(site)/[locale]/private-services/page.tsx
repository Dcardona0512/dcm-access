import type { Metadata } from "next";

import { VerticalPage, verticalMetadata } from "@/components/pages/VerticalPage";

const VERTICAL = "private-services" as const;

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
  return <VerticalPage vertical={VERTICAL} localeRaw={locale} />;
}
