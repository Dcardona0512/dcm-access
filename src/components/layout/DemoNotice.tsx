"use client";

import { useSyncExternalStore } from "react";

import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/content/types";

const DISMISS_KEY = "dcm_demo_notice_dismissed";

/* ============================================================================
   AVISO DE CONTENIDO DE DEMOSTRACIÓN (§48)
   ----------------------------------------------------------------------------
   Mientras la fuente de datos sea `demo`, el sitio dice claramente que lo que
   se ve son ejemplos. Se puede cerrar para poder evaluar el diseño sin
   estorbo, pero cada registro conserva su etiqueta `Demo`, así que cerrarlo no
   hace pasar por real nada que no lo sea.

   El estado vive en `sessionStorage`, que es un sistema externo a React: se
   lee con `useSyncExternalStore` en vez de con un efecto que llame a setState,
   porque así el primer render del servidor y el del cliente coinciden sin
   provocar un render en cascada.
   ========================================================================== */

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function isDismissed(): boolean {
  return window.sessionStorage.getItem(DISMISS_KEY) === "1";
}

/** En el servidor se asume cerrado: así no aparece y desaparece al hidratar. */
function isDismissedOnServer(): boolean {
  return true;
}

function dismiss() {
  window.sessionStorage.setItem(DISMISS_KEY, "1");
  for (const listener of listeners) listener();
}

export function DemoNotice({ dict }: { readonly dict: Dictionary }) {
  const dismissed = useSyncExternalStore(subscribe, isDismissed, isDismissedOnServer);

  if (dismissed) return null;

  return (
    <div
      role="status"
      className="border-accent-dim/30 bg-surface-raised/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md"
    >
      <Container width="wide">
        <div className="flex items-start gap-4 py-3.5 sm:items-center">
          <span className="eyebrow text-accent mt-0.5 shrink-0 text-[0.5625rem] sm:mt-0">
            Demo
          </span>
          <p className="text-fg-muted flex-1 text-xs text-pretty">{dict.common.demoNotice}</p>
          <button
            type="button"
            onClick={dismiss}
            className="text-fg-muted hover:text-fg eyebrow shrink-0 text-[0.5625rem] transition-colors"
          >
            {dict.common.close}
          </button>
        </div>
      </Container>
    </div>
  );
}
