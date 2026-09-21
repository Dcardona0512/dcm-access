"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { navHrefs, verticalNav } from "@/content/shared";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/content/types";
import { panelVariants, veilVariants } from "@/lib/motion";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

import { LocaleSwitcher } from "./LocaleSwitcher";

/* ============================================================================
   CABECERA (§30)
   ----------------------------------------------------------------------------
   Cinco destinos visibles y un solo CTA. Los destinos SON las cinco categorías,
   planas: ya no cuelgan de un desplegable "Oportunidades" porque ya no hay
   catálogo general del que colgar, y cinco entradas son exactamente el techo
   que §30 fija para la barra.
   ========================================================================== */

/**
 * Solo las CLAVES. La etiqueta sale de `dict.navLabels`, para que la barra se
 * lea íntegramente en el idioma activo y no mezcle idiomas.
 */
const VERTICAL_KEYS = verticalNav.map((item) => item.key);

export function SiteHeader({
  cuenta,
  locale,
  dict,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
  /** A dónde lleva el enlace de cuenta, o `null` si nadie ha entrado. */
  readonly cuenta: string | null;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const to = useCallback((href: string) => localizePath(href, locale), [locale]);

  /**
   * Vender abre una conversación, no un formulario. Si algún día falta el
   * número, el botón cae al contacto en vez de llevar a un error de WhatsApp.
   */
  /*
    AQUÍ HABÍA UN BOTÓN DE «VENDER» que abría WhatsApp.
    
    Tenía sentido cuando la única forma de traer inventario era que alguien
    escribiera por WhatsApp y lo publicáramos a mano. Ahora quien tiene algo
    que ofrecer se registra como partner, pasa verificación y queda en la base
    con su ficha; mandarlo a un chat era devolverlo al camino que la
    plataforma acaba de sustituir, y encima perdía el dato.
  */

  /**
   * La portada es la raíz del idioma y nada más: `/es`, `/en`. Se compara con
   * la ruta localizada en vez de recortar el prefijo a mano, para que añadir
   * idiomas no obligue a tocar esto.
   */
  const isHome = pathname === localizePath("/", locale);

  // Fondo sólido solo tras desplazarse: sobre el hero la barra flota.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cualquier navegación cierra lo que estuviera abierto. Se hace en el
  // manejador del enlace y no en un efecto sobre `pathname`: un efecto que
  // llama a setState provoca un render en cascada por cada navegación.
  const closeAll = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-(--duration-base) ease-(--ease-brand)",
        scrolled || drawerOpen
          ? "bg-surface/92 border-line border-b backdrop-blur-md"
          : // Sin desplazar, la barra flota sobre el vídeo. No puede ser
            // transparente del todo: un velo superior garantiza el contraste
            // de la navegación sea cual sea el fotograma que haya detrás.
            "border-b border-transparent bg-gradient-to-b from-black/55 via-black/25 to-transparent",
      )}
    >
      <Container width="wide">
        <div className="flex h-18 items-center justify-between gap-6 md:h-20">
          <Link
            href={to("/")}
            className={cn(
              "shrink-0 transition-colors",
              /*
                Dorado en la portada, marfil en el resto. §8 reserva el acento
                para el eyebrow, el filete y un solo CTA por vista, y un logo
                dorado permanente lo gastaría en el elemento que menos lo
                necesita — pero la portada ES la declaración de marca, y ahí el
                logo sí es el elemento que lo merece.

                En scroll vuelve a marfil: sobre la superficie sólida el dorado
                compite con el CTA, que es el que tiene que ganar.
              */
              isHome && !scrolled ? "text-accent hover:text-fg" : "text-fg hover:text-accent",
            )}
            aria-label={dict.meta.homeTitle}
          >
            <Logo />
          </Link>

          <nav aria-label={dict.nav.primaryLabel} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {VERTICAL_KEYS.map((key) => (
                <li key={key}>
                  <NavAnchor
                    href={to(navHrefs[key])}
                    active={pathname.startsWith(to(navHrefs[key]))}
                  >
                    {dict.navLabels[key]}
                  </NavAnchor>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <LocaleSwitcher locale={locale} dict={dict} className="hidden md:flex" />

            {/*
              Entrar o ir a su panel, según quién mire. Es lo único que la
              cabecera necesita saber de la sesión: el rol decide el destino en
              el servidor, aquí solo llega una dirección ya resuelta.
            */}
            {/*
              «Crear cuenta» es texto y aparece solo cuando hay sitio: con las
              cinco verticales, el selector de idioma y el botón, en una
              pantalla mediana no cabe una palabra más sin que la barra empiece
              a comerse la navegación.
            */}
            {cuenta ? null : (
              <Link
                href="/signup"
                className="eyebrow text-fg-muted hover:text-fg hidden text-[0.8rem] font-bold transition-colors xl:inline-flex"
              >
                {dict.auth.signupHeading}
              </Link>
            )}

            {/*
              Entrar o ir a su panel. El enlace de texto es para quien ya tiene
              cuenta —no necesita que le griten— y el botón dorado es la acción
              que queremos: crear una.
            */}
            <Button
              href={cuenta ?? "/login"}
              variant="accent"
              size="sm"
              className="hidden sm:inline-flex"
            >
              {cuenta ? dict.common.account : dict.auth.loginHeading}
            </Button>

            <button
              type="button"
              onClick={() => setDrawerOpen((open) => !open)}
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav"
              className="text-fg hover:text-accent -mr-2 flex h-10 w-10 items-center justify-center transition-colors lg:hidden"
            >
              <span className="sr-only">{drawerOpen ? dict.nav.closeMenu : dict.nav.openMenu}</span>
              <BurgerIcon open={drawerOpen} />
            </button>
          </div>
        </div>
      </Container>

      <MobileDrawer
        open={drawerOpen}
        onClose={closeAll}
        locale={locale}
        dict={dict}
        pathname={pathname}
        cuenta={cuenta}
      />
    </header>
  );
}

/* --- Enlace de navegación ---------------------------------------------------- */

function NavAnchor({
  href,
  children,
  active,
  className,
}: {
  readonly href: string;
  readonly children: React.ReactNode;
  readonly active?: boolean;
  readonly className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        // `eyebrow` trae 12px y semi; aquí se sube el cuerpo y el peso porque
        // es la navegación principal, no un rótulo de apoyo.
        "eyebrow rounded-(--radius-card) px-3 py-2.5 text-[0.9rem] font-bold transition-colors duration-(--duration-fast)",
        active ? "text-fg" : "text-fg-muted hover:text-fg",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* --- Cajón móvil ------------------------------------------------------------- */

function MobileDrawer({
  open,
  onClose,
  locale,
  dict,
  pathname,
  cuenta,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly pathname: string;
  /** Resuelto arriba para que la barra y el cajón no puedan divergir. */
  readonly cuenta: string | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const to = (href: string) => localizePath(href, locale);

  // Bloquea el scroll de fondo y atrapa el foco mientras el cajón está abierto.
  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            variants={veilVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="bg-surface/70 fixed inset-0 top-18 -z-10 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            id="mobile-nav"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-surface border-line fixed inset-x-0 top-18 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b lg:hidden"
          >
            <Container>
              <nav aria-label={dict.nav.primaryLabel} className="flex flex-col gap-8 py-8">
                <ul className="flex flex-col">
                  {VERTICAL_KEYS.map((key) => (
                    <DrawerItem
                      key={key}
                      href={to(navHrefs[key])}
                      pathname={pathname}
                      onNavigate={onClose}
                    >
                      {dict.navLabels[key]}
                    </DrawerItem>
                  ))}
                </ul>

                <div className="flex flex-col gap-4">
                  {/*
                    En el teléfono la entrada TIENE que estar aquí: es la única
                    superficie que queda cuando la barra se reduce a logo y
                    menú. Estaba solo en escritorio, y por eso no se veía.
                  */}
                  {cuenta ? (
                    <Button href={cuenta} variant="accent" fullWidth onClick={onClose}>
                      {dict.common.account}
                    </Button>
                  ) : (
                    <>
                      <Button href="/signup" variant="accent" fullWidth onClick={onClose}>
                        {dict.auth.signupHeading}
                      </Button>
                      <Button href="/login" variant="outline" fullWidth onClick={onClose}>
                        {dict.auth.loginHeading}
                      </Button>
                    </>
                  )}

                  <LocaleSwitcher locale={locale} dict={dict} className="mt-2" />
                </div>
              </nav>
            </Container>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function DrawerItem({
  href,
  children,
  pathname,
  onNavigate,
  nested = false,
}: {
  readonly href: string;
  readonly children: React.ReactNode;
  readonly pathname: string;
  readonly onNavigate: () => void;
  readonly nested?: boolean;
}) {
  const active = pathname === href;

  return (
    <li className="border-line-soft border-b last:border-0">
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center justify-between py-4 transition-colors",
          nested ? "text-fg-muted pl-5 text-sm" : "font-display text-xl",
          active ? "text-accent" : "hover:text-fg",
        )}
      >
        {children}
      </Link>
    </li>
  );
}

/* --- Iconos ------------------------------------------------------------------- */

function BurgerIcon({ open }: { readonly open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d={open ? "M4 4l12 12" : "M2 6h16"}
        stroke="currentColor"
        strokeWidth="1.25"
        className="transition-all duration-(--duration-base) ease-(--ease-brand)"
      />
      <path
        d={open ? "M16 4L4 16" : "M2 13h16"}
        stroke="currentColor"
        strokeWidth="1.25"
        className="transition-all duration-(--duration-base) ease-(--ease-brand)"
      />
    </svg>
  );
}

