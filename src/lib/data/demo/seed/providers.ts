import type { Provider } from "@/lib/domain/types";

/* ============================================================================
   PROVEEDORES DE DEMOSTRACIÓN
   ----------------------------------------------------------------------------
   §48 es tajante: nunca inventar empresas, certificaciones o licencias reales
   y presentarlas como verdaderas. Por eso cada nombre lleva el sufijo "(Demo)"
   además de la marca `isDemo`, de modo que una captura de pantalla suelta —
   fuera del sitio, sin el aviso inferior — siga siendo inequívoca.

   Nótese que `certifications[].verified` está en `false` en casi todos: la
   distinción entre lo comprobado y lo declarado es parte del producto (§26).
   ========================================================================== */

export const providers: readonly Provider[] = [
  {
    id: "prv-meridian",
    slug: "meridian-property-partners",
    name: "Meridian Property Partners (Demo)",
    description: {
      es: "Firma inmobiliaria de demostración especializada en residencial de alto valor y activos de inversión en el eje Medellín–Bogotá.",
      en: "Demonstration real estate firm specialising in high-value residential and investment assets across the Medellín–Bogotá corridor.",
    },
    verticals: ["real-estate"],
    locations: [
      { country: "CO", region: "Antioquia", city: "Medellín" },
      { country: "CO", region: "Cundinamarca", city: "Bogotá" },
    ],
    services: [
      { es: "Intermediación en venta", en: "Sales intermediation" },
      { es: "Arrendamiento premium", en: "Premium leasing" },
      { es: "Búsqueda de inversión", en: "Investment sourcing" },
    ],
    gallery: [],
    verification: "verified",
    certifications: [{ name: "Lonja registrada (demo)", verified: false }],
    operatingAreas: ["Antioquia", "Cundinamarca", "Bolívar"],
    status: "approved",
    isDemo: true,
    appliedAt: "2026-01-14T10:00:00.000Z",
    approvedAt: "2026-01-28T10:00:00.000Z",
  },
  {
    id: "prv-cordillera",
    slug: "cordillera-aviation",
    name: "Cordillera Aviation Services (Demo)",
    description: {
      es: "Comercializador de aviación de demostración. Los vuelos se ejecutan siempre a través de operadores certificados; esta figura intermedia la operación, no la opera.",
      en: "Demonstration aviation broker. Flights are always executed by certified operators; this entity brokers the transaction, it does not operate the aircraft.",
    },
    verticals: ["aviation"],
    locations: [
      { country: "CO", city: "Medellín" },
      { country: "US", region: "Florida", city: "Miami" },
    ],
    services: [
      { es: "Charter ejecutivo", en: "Executive charter" },
      { es: "Compraventa de aeronaves", en: "Aircraft sales" },
      { es: "Leasing", en: "Leasing" },
    ],
    gallery: [],
    verification: "documents_pending",
    certifications: [
      { name: "Certificación de operador (declarada, sin verificar)", verified: false },
    ],
    operatingAreas: ["Colombia", "Panamá", "Florida"],
    status: "approved",
    isDemo: true,
    appliedAt: "2026-02-02T10:00:00.000Z",
    approvedAt: "2026-02-20T10:00:00.000Z",
  },
  {
    id: "prv-sentinel",
    slug: "sentinel-executive",
    name: "Sentinel Executive Services (Demo)",
    description: {
      es: "Empresa de demostración de transporte ejecutivo y servicios de protección. En la operación real, este perfil requeriría licencia vigente acreditada antes de publicarse.",
      en: "Demonstration executive transport and protection services company. In live operation this profile would require current, evidenced licensing before publication.",
    },
    verticals: ["private-services", "motors"],
    locations: [
      { country: "CO", city: "Bogotá" },
      { country: "CO", city: "Medellín" },
    ],
    services: [
      { es: "Transporte ejecutivo", en: "Executive transport" },
      { es: "Conductores privados", en: "Private drivers" },
      { es: "Escolta y protección", en: "Close protection" },
    ],
    gallery: [],
    verification: "documents_pending",
    certifications: [
      { name: "Licencia de vigilancia y seguridad privada (demo, sin verificar)", verified: false },
    ],
    operatingAreas: ["Bogotá", "Medellín", "Cali"],
    status: "approved",
    isDemo: true,
    appliedAt: "2026-02-11T10:00:00.000Z",
    approvedAt: "2026-03-04T10:00:00.000Z",
  },
  {
    id: "prv-vertex",
    slug: "vertex-motors-group",
    name: "Vertex Motors Group (Demo)",
    description: {
      es: "Comercializadora de demostración de vehículos premium, clásicos e importación bajo pedido.",
      en: "Demonstration trader in premium and classic vehicles, with sourcing to order.",
    },
    verticals: ["motors"],
    locations: [
      { country: "CO", city: "Medellín" },
      { country: "US", region: "Florida", city: "Miami" },
    ],
    services: [
      { es: "Venta de vehículos premium", en: "Premium vehicle sales" },
      { es: "Importación bajo pedido", en: "Sourcing to order" },
      { es: "Consignación", en: "Consignment" },
    ],
    gallery: [],
    verification: "verified",
    certifications: [],
    operatingAreas: ["Colombia", "Estados Unidos"],
    status: "approved",
    isDemo: true,
    appliedAt: "2026-01-20T10:00:00.000Z",
    approvedAt: "2026-02-06T10:00:00.000Z",
  },
  {
    id: "prv-andina",
    slug: "andina-industrial-assets",
    name: "Andina Industrial Assets (Demo)",
    description: {
      es: "Intermediario de demostración en maquinaria pesada, equipos industriales y activos empresariales.",
      en: "Demonstration intermediary in heavy machinery, industrial equipment and business assets.",
    },
    verticals: ["business"],
    locations: [{ country: "CO", city: "Barranquilla" }],
    services: [
      { es: "Maquinaria pesada", en: "Heavy machinery" },
      { es: "Subasta de activos", en: "Asset disposal" },
      { es: "Valoración", en: "Valuation" },
    ],
    gallery: [],
    verification: "unverified",
    certifications: [],
    operatingAreas: ["Costa Caribe", "Antioquia"],
    status: "approved",
    isDemo: true,
    appliedAt: "2026-03-01T10:00:00.000Z",
    approvedAt: "2026-03-18T10:00:00.000Z",
  },
  /* Postulación en cola: alimenta la bandeja de aprobación del CRM (§22). */
  {
    id: "prv-pending-costa",
    slug: "costa-luxury-rentals",
    name: "Costa Luxury Rentals (Demo)",
    description: {
      es: "Postulación de demostración pendiente de revisión. Ilustra que ningún perfil se publica de forma automática (§18).",
      en: "Demonstration application awaiting review. Illustrates that no profile is published automatically (§18).",
    },
    verticals: ["real-estate", "private-services"],
    locations: [{ country: "CO", city: "Cartagena" }],
    services: [{ es: "Alquiler vacacional premium", en: "Premium holiday rentals" }],
    gallery: [],
    verification: "unverified",
    certifications: [],
    operatingAreas: ["Cartagena", "Santa Marta"],
    status: "in_review",
    isDemo: true,
    appliedAt: "2026-07-29T10:00:00.000Z",
  },
];

export const providersById = new Map(providers.map((provider) => [provider.id, provider]));
