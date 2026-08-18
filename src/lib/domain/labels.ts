import type { Locale } from "@/lib/i18n/config";

import {
  localized,
  type DealStage,
  type LeadSource,
  type LeadStatus,
  type ListingType,
  type Localized,
  type Vertical,
  type Visibility,
} from "./types";

/**
 * Etiquetas de los valores del dominio.
 *
 * Viven aquí y no en el diccionario de contenido porque describen estados del
 * modelo, no prosa de marca: cambian cuando cambia el dominio, no cuando
 * cambia el copy.
 */

export const listingTypeLabels: Record<ListingType, Localized> = {
  sale: { es: "Venta", en: "Sale" },
  rent: { es: "Alquiler", en: "Rent" },
  charter: { es: "Charter", en: "Charter" },
  lease: { es: "Leasing", en: "Lease" },
  service: { es: "Servicio", en: "Service" },
  opportunity: { es: "Oportunidad", en: "Opportunity" },
};

export const visibilityLabels: Record<Visibility, Localized> = {
  public: { es: "Pública", en: "Public" },
  members: { es: "Miembros", en: "Members" },
  private: { es: "Privada", en: "Private" },
};

export const verticalLabels: Record<Vertical, Localized> = {
  "real-estate": { es: "Inmobiliario", en: "Real Estate" },
  motors: { es: "Vehículos", en: "Motors" },
  aviation: { es: "Aviación", en: "Aviation" },
  "private-services": { es: "Servicios privados", en: "Private Services" },
  business: { es: "Oportunidades de negocio", en: "Business Opportunities" },
};

export const leadStatusLabels: Record<LeadStatus, Localized> = {
  new: { es: "Nuevo", en: "New" },
  qualified: { es: "Calificado", en: "Qualified" },
  contacted: { es: "Contactado", en: "Contacted" },
  negotiation: { es: "Negociación", en: "Negotiation" },
  closed: { es: "Cerrado", en: "Closed" },
  commission: { es: "Comisión", en: "Commission" },
};

export const leadSourceLabels: Record<LeadSource, Localized> = {
  inquiry: { es: "Consulta de ficha", en: "Listing enquiry" },
  private_request: { es: "Búsqueda privada", en: "Private search" },
  contact: { es: "Contacto general", en: "General contact" },
  partner_application: { es: "Postulación de partner", en: "Partner application" },
  broker_contact: { es: "Contacto con broker", en: "Broker contact" },
  quote_request: { es: "Solicitud de cotización", en: "Quote request" },
};

export const dealStageLabels: Record<DealStage, Localized> = {
  request: { es: "Request", en: "Request" },
  source: { es: "Source", en: "Source" },
  verify: { es: "Verify", en: "Verify" },
  connect: { es: "Connect", en: "Connect" },
  negotiate: { es: "Negotiate", en: "Negotiate" },
  close: { es: "Close", en: "Close" },
};

export function label(map: Record<string, Localized>, key: string, locale: Locale): string {
  return map[key] ? localized(map[key], locale) : key;
}
