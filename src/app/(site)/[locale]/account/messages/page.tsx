import { notFound } from "next/navigation";

import { ArrowEast, Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDictionary } from "@/content";
import { isLocale, localizePath } from "@/lib/i18n/config";

export default async function AccountMessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <EmptyState
      heading={dict.account.nav.messages}
      body={dict.account.empty.messages}
      action={
        <Button href={localizePath("/contact", locale)} variant="outline">
          {dict.contact.heading}
          <ArrowEast />
        </Button>
      }
    />
  );
}
