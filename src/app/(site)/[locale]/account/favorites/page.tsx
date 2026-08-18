import { notFound } from "next/navigation";

import { ArrowEast, Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDictionary } from "@/content";
import { isLocale, localizePath } from "@/lib/i18n/config";

export default async function AccountFavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  // Guardar favoritos exige una sesión real; hasta entonces el estado honesto
  // es el vacío, no una lista inventada (§48).
  return (
    <EmptyState
      heading={dict.account.nav.favorites}
      body={dict.account.empty.favorites}
      action={
        <Button href={localizePath("/opportunities", locale)} variant="outline">
          {dict.common.explore}
          <ArrowEast />
        </Button>
      }
    />
  );
}
