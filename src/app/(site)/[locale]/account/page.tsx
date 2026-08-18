import { notFound } from "next/navigation";

import { ArrowEast, Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { getDictionary } from "@/content";
import { getDemoUser, roleLabels } from "@/lib/auth/roles";
import { isLocale, localizePath } from "@/lib/i18n/config";

export default async function AccountOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const user = getDemoUser();

  return (
    <div className="flex flex-col gap-10">
      <section className="border-line flex flex-col gap-5 rounded-(--radius-card) border p-6">
        <Eyebrow tone="muted">{dict.account.nav.profile}</Eyebrow>

        <dl className="flex flex-col gap-3 text-sm">
          <div className="border-line-soft flex justify-between gap-4 border-b pb-3">
            <dt className="text-fg-muted/70">{dict.privateRequest.fields.name.label}</dt>
            <dd>{user.name}</dd>
          </div>
          <div className="border-line-soft flex justify-between gap-4 border-b pb-3">
            <dt className="text-fg-muted/70">{dict.privateRequest.fields.email.label}</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-fg-muted/70">Rol</dt>
            <dd>{roleLabels[user.role][locale === "es" ? "es" : "en"]}</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-5">
        <Eyebrow tone="muted">{dict.privateRequest.eyebrow}</Eyebrow>
        <p className="text-fg-muted max-w-[58ch] text-pretty">{dict.privateRequest.lede}</p>
        <div>
          <Button href={localizePath("/private/request", locale)} variant="accent">
            {dict.privateRequest.submit}
            <ArrowEast />
          </Button>
        </div>
      </section>
    </div>
  );
}
