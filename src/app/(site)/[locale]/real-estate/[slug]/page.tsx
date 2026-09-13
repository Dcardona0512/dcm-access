import type { Metadata } from "next";

import {
  OpportunityDetail,
  opportunityMetadata,
  opportunityStaticParams,
} from "@/components/pages/OpportunityDetail";

const VERTICAL = "real-estate" as const;

export async function generateStaticParams() {
  return opportunityStaticParams(VERTICAL);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return opportunityMetadata(VERTICAL, locale, slug);
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return <OpportunityDetail vertical={VERTICAL} localeRaw={locale} slug={slug} />;
}
