"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Dictionary } from "@/content/types";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function AccountNav({
  locale,
  dict,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
}) {
  const pathname = usePathname();

  const entries = [
    { href: "/account", label: dict.account.nav.overview },
    { href: "/account/favorites", label: dict.account.nav.favorites },
    { href: "/account/requests", label: dict.account.nav.requests },
    { href: "/account/messages", label: dict.account.nav.messages },
  ];

  return (
    <nav aria-label={dict.account.heading} className="lg:sticky lg:top-28 lg:self-start">
      <ul className="border-line flex flex-wrap gap-x-6 gap-y-2 border-b pb-4 lg:flex-col lg:gap-0 lg:border-b-0 lg:pb-0">
        {entries.map((entry) => {
          const href = localizePath(entry.href, locale);
          const active = pathname === href;

          return (
            <li key={entry.href} className="lg:border-line lg:border-b">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "eyebrow block py-1 text-[0.5625rem] transition-colors lg:py-3.5",
                  active ? "text-accent" : "text-fg-muted hover:text-fg",
                )}
              >
                {entry.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
