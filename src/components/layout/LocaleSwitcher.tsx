"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import type { Dictionary } from "@/content/types";
import { localeMeta, locales, localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/* ============================================================================
   SELECTOR DE IDIOMA
   ----------------------------------------------------------------------------
   Son enlaces reales, no botones con JavaScript: cada idioma tiene su URL, así
   que el cambio funciona sin JS, se puede abrir en otra pestaña y los
   rastreadores lo siguen.

   La preferencia no se guarda desde aquí: la fija el proxy al servir cualquier
   ruta con idioma explícito. Un clic en "EN" es una visita a `/en/...`, y el
   servidor persiste esa elección — sin escribir cookies desde el cliente.
   ========================================================================== */

/**
 * La cadena de consulta se lee de `window.location` en vez de con
 * `useSearchParams`: ese hook obliga a renderizado dinámico y sacaría a la
 * cabecera —y con ella a cada página— del prerenderizado estático (§28).
 */
function subscribeToHistory(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

const readSearch = () => window.location.search;
const readSearchOnServer = () => "";

export function LocaleSwitcher({
  locale,
  dict,
  className,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly className?: string;
}) {
  const pathname = usePathname();
  const suffix = useSyncExternalStore(subscribeToHistory, readSearch, readSearchOnServer);

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="group"
      aria-label={dict.common.language}
    >
      {locales.map((code, index) => {
        const active = code === locale;

        return (
          <span key={code} className="flex items-center">
            {index > 0 ? (
              <span className="text-line px-1" aria-hidden="true">
                /
              </span>
            ) : null}
            <Link
              href={`${localizePath(pathname, code)}${suffix}`}
              hrefLang={localeMeta[code].hreflang}
              aria-current={active ? "true" : undefined}
              className={cn(
                "eyebrow rounded-(--radius-card) px-1.5 py-1 text-[0.625rem] transition-colors",
                active ? "text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              <span className="sr-only">{localeMeta[code].label}</span>
              <span aria-hidden="true">{code}</span>
            </Link>
          </span>
        );
      })}
    </div>
  );
}
