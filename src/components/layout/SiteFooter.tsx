import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { brand, contact, navHrefs, regionKeys } from "@/content/shared";
import type { Dictionary } from "@/content/types";
import { localizePath, type Locale } from "@/lib/i18n/config";

/** Solo claves: las etiquetas salen de `dict.navLabels` en el idioma activo. */
const EXPLORE_KEYS = [
  "opportunities",
  "real-estate",
  "motors",
  "aviation",
  "private-services",
  "business",
  "private",
] as const;

const COMPANY_KEYS = ["about", "brokerage", "partners", "contact"] as const;

export function SiteFooter({
  locale,
  dict,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
}) {
  const to = (href: string) => localizePath(href, locale);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-raised border-line border-t">
      <Container width="wide">
        <div className="grid gap-14 py-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-6">
            <Link href={to("/")} className="text-fg hover:text-accent w-fit transition-colors">
              <Logo descriptor={dict.brand.descriptor} />
            </Link>
            <p className="text-fg-muted max-w-[34ch] text-sm text-pretty">{dict.footer.tagline}</p>

            <div className="flex flex-wrap gap-x-3 gap-y-2 pt-2">
              {regionKeys.map((key) => (
                <span key={key} className="eyebrow text-fg-muted/60 text-[0.5625rem]">
                  {dict.regions[key]}
                </span>
              ))}
            </div>
          </div>

          <FooterColumn heading={dict.footer.exploreHeading}>
            {EXPLORE_KEYS.map((key) => (
              <FooterLink key={key} href={to(navHrefs[key])}>
                {dict.navLabels[key]}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn heading={dict.footer.companyHeading}>
            {COMPANY_KEYS.map((key) => (
              <FooterLink key={key} href={to(navHrefs[key])}>
                {dict.navLabels[key]}
              </FooterLink>
            ))}
          </FooterColumn>

          <div className="flex flex-col gap-10">
            <FooterColumn heading={dict.footer.legalHeading}>
              {dict.legal.documents.map((doc) => (
                <FooterLink key={doc.slug} href={to(`/legal/${doc.slug}`)}>
                  {doc.title}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn heading={dict.footer.contactHeading}>
              <FooterLink href={`mailto:${contact.email}`}>{contact.email}</FooterLink>
              {contact.phone ? (
                <FooterLink href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                  {contact.phone}
                </FooterLink>
              ) : null}
            </FooterColumn>
          </div>
        </div>

        {/* Canal de reporte (§26): un marketplace curado necesita una vía
            explícita para señalar lo que no debería estar publicado. */}
        <div className="border-line flex flex-col gap-3 border-t py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex flex-col gap-1.5">
            <Eyebrow tone="muted">{dict.footer.reportHeading}</Eyebrow>
            <p className="text-fg-muted/80 max-w-[62ch] text-sm text-pretty">
              {dict.footer.reportBody}
            </p>
          </div>
          <a
            href={`mailto:${contact.email}?subject=${encodeURIComponent("Report — DCM ACCESS")}`}
            className="eyebrow text-accent hover:text-fg shrink-0 transition-colors"
          >
            {contact.email}
          </a>
        </div>

        <div className="border-line flex flex-col gap-4 border-t py-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <p className="text-fg-muted/70 max-w-[76ch] text-xs text-pretty">
            {dict.footer.disclaimer}
          </p>
          <p className="text-fg-muted/70 shrink-0 text-xs">
            © {year} {brand.name}. {dict.footer.rights}
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  heading,
  children,
}: {
  readonly heading: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Eyebrow tone="muted">{heading}</Eyebrow>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  readonly href: string;
  readonly children: React.ReactNode;
}) {
  const external = href.startsWith("mailto:") || href.startsWith("tel:");

  return (
    <li>
      {external ? (
        <a href={href} className="text-fg-muted hover:text-fg text-sm transition-colors">
          {children}
        </a>
      ) : (
        <Link href={href} className="text-fg-muted hover:text-fg text-sm transition-colors">
          {children}
        </Link>
      )}
    </li>
  );
}
