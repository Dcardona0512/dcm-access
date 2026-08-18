import { notFound } from "next/navigation";

import { AccountNav } from "@/components/account/AccountNav";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { getDictionary } from "@/content";
import { isLocale } from "@/lib/i18n/config";

/**
 * Área de cliente (§20).
 *
 * La autenticación real no está conectada, y el aviso lo dice arriba del todo:
 * ni el diseño ni el copy insinúan que haya una sesión de verdad detrás (§48).
 * Cuando entre Supabase Auth, esta pantalla solo cambia de dónde saca el
 * usuario; su estructura ya es la definitiva.
 */
export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <Container width="wide" as="div">
      <div className="flex flex-col gap-10 pt-36 pb-(--spacing-section) md:pt-44">
        <div className="flex flex-col gap-5">
          <Eyebrow>{dict.account.heading}</Eyebrow>
          <h1 className="font-display text-display-2 text-balance">{dict.account.heading}</h1>
          <p className="text-lede text-fg-muted max-w-[54ch] text-pretty">{dict.account.lede}</p>

          <p className="border-accent-dim/40 bg-accent/[0.04] text-fg-muted max-w-[68ch] rounded-(--radius-card) border border-dashed px-4 py-3 text-sm text-pretty">
            {dict.account.demoSession}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-16">
          <AccountNav locale={locale} dict={dict} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </Container>
  );
}
