import type { Vertical } from "@/lib/domain/types";

/* ============================================================================
   ANALÍTICA (§41)
   ----------------------------------------------------------------------------
   "El objetivo es descubrir qué genera ingresos." Por eso los eventos no son
   páginas vistas genéricas: son los momentos del embudo que se pueden atribuir
   a dinero — qué se buscó, qué se miró, qué se solicitó y qué se convirtió.

   La unión tipada obliga a que cada evento lleve su carga completa, y el
   adaptador es intercambiable: hoy escribe en consola, mañana en el proveedor
   que se elija, sin tocar los puntos de llamada.
   ========================================================================== */

export type AnalyticsEvent =
  | { readonly name: "search_performed"; readonly query: string; readonly vertical?: Vertical; readonly results: number }
  | { readonly name: "vertical_viewed"; readonly vertical: Vertical }
  | { readonly name: "opportunity_viewed"; readonly opportunityId: string; readonly vertical: Vertical; readonly visibility: string }
  | { readonly name: "inquiry_submitted"; readonly opportunityId?: string; readonly vertical?: Vertical }
  | { readonly name: "private_request_submitted"; readonly vertical?: Vertical; readonly confidentiality: string }
  | { readonly name: "broker_contacted"; readonly opportunityId?: string }
  | { readonly name: "partner_applied"; readonly verticals: readonly Vertical[] }
  | { readonly name: "contact_submitted" }
  | { readonly name: "favorite_added"; readonly opportunityId: string }
  | { readonly name: "lead_created"; readonly leadId: string; readonly source: string };

export interface AnalyticsAdapter {
  track(event: AnalyticsEvent): void;
}

/**
 * Adaptador por defecto. No envía nada a ningún tercero: §26 y la política de
 * cookies prometen que no se mide sin consentimiento, y esta es la
 * implementación de esa promesa.
 */
const consoleAdapter: AnalyticsAdapter = {
  track(event) {
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics]", event.name, event);
    }
  },
};

let adapter: AnalyticsAdapter = consoleAdapter;

/** Punto de inyección para conectar un proveedor real más adelante. */
export function setAnalyticsAdapter(next: AnalyticsAdapter): void {
  adapter = next;
}

export function track(event: AnalyticsEvent): void {
  adapter.track(event);
}
