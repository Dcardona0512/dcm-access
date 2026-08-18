import type { AttributeDef, Category } from "@/lib/domain/types";

/* ============================================================================
   TAXONOMÍA (§3)
   ----------------------------------------------------------------------------
   Cinco verticales y sus subcategorías, cada una con el esquema de atributos
   que la define. Este archivo es el único sitio donde hay que tocar para
   añadir una subcategoría nueva: el catálogo lee `facet: true` y construye el
   filtro solo, y la ficha lee `highlight: true` y decide qué destacar.
   ========================================================================== */

const groups = {
  general: { es: "General", en: "General" },
  spaces: { es: "Espacios", en: "Spaces" },
  technical: { es: "Ficha técnica", en: "Technical" },
  performance: { es: "Prestaciones", en: "Performance" },
  operation: { es: "Operación", en: "Operation" },
  commercial: { es: "Información comercial", en: "Commercial" },
} as const;

/* --- Atributos reutilizables ------------------------------------------------ */

const condition: AttributeDef = {
  key: "condition",
  type: "enum",
  label: { es: "Estado", en: "Condition" },
  facet: true,
  group: groups.general,
  options: [
    { value: "new", label: { es: "Nuevo", en: "New" } },
    { value: "excellent", label: { es: "Excelente", en: "Excellent" } },
    { value: "good", label: { es: "Bueno", en: "Good" } },
    { value: "to-refurbish", label: { es: "Para reformar", en: "To refurbish" } },
  ],
};

const year: AttributeDef = {
  key: "year",
  type: "number",
  label: { es: "Año", en: "Year" },
  grouping: false,
  highlight: true,
  group: groups.general,
};

/* --- Real Estate ------------------------------------------------------------ */

const realEstateBase: readonly AttributeDef[] = [
  {
    key: "area",
    type: "number",
    label: { es: "Área construida", en: "Built area" },
    unit: "m²",
    highlight: true,
    facet: true,
    group: groups.spaces,
  },
  {
    key: "lotArea",
    type: "number",
    label: { es: "Área de lote", en: "Lot area" },
    unit: "m²",
    group: groups.spaces,
  },
  {
    key: "bedrooms",
    type: "number",
    label: { es: "Habitaciones", en: "Bedrooms" },
    highlight: true,
    facet: true,
    group: groups.spaces,
  },
  {
    key: "bathrooms",
    type: "number",
    label: { es: "Baños", en: "Bathrooms" },
    highlight: true,
    group: groups.spaces,
  },
  {
    key: "parking",
    type: "number",
    label: { es: "Parqueaderos", en: "Parking spaces" },
    group: groups.spaces,
  },
  { ...year, label: { es: "Año de construcción", en: "Year built" } },
  condition,
  {
    key: "amenities",
    type: "multi-enum",
    label: { es: "Amenidades", en: "Amenities" },
    group: groups.general,
    options: [
      { value: "pool", label: { es: "Piscina", en: "Pool" } },
      { value: "gym", label: { es: "Gimnasio", en: "Gym" } },
      { value: "security-24h", label: { es: "Vigilancia 24h", en: "24h security" } },
      { value: "elevator", label: { es: "Ascensor", en: "Elevator" } },
      { value: "terrace", label: { es: "Terraza", en: "Terrace" } },
      { value: "helipad", label: { es: "Helipuerto", en: "Helipad" } },
    ],
  },
];

/* --- Motors ------------------------------------------------------------------ */

const motorsBase: readonly AttributeDef[] = [
  {
    key: "make",
    type: "text",
    label: { es: "Marca", en: "Make" },
    highlight: true,
    facet: true,
    group: groups.general,
  },
  {
    key: "model",
    type: "text",
    label: { es: "Modelo", en: "Model" },
    highlight: true,
    group: groups.general,
  },
  year,
  {
    key: "mileage",
    type: "number",
    label: { es: "Kilometraje", en: "Mileage" },
    unit: "km",
    highlight: true,
    group: groups.technical,
  },
  {
    key: "fuel",
    type: "enum",
    label: { es: "Combustible", en: "Fuel" },
    facet: true,
    group: groups.technical,
    options: [
      { value: "petrol", label: { es: "Gasolina", en: "Petrol" } },
      { value: "diesel", label: { es: "Diésel", en: "Diesel" } },
      { value: "hybrid", label: { es: "Híbrido", en: "Hybrid" } },
      { value: "electric", label: { es: "Eléctrico", en: "Electric" } },
    ],
  },
  {
    key: "transmission",
    type: "enum",
    label: { es: "Transmisión", en: "Transmission" },
    group: groups.technical,
    options: [
      { value: "automatic", label: { es: "Automática", en: "Automatic" } },
      { value: "manual", label: { es: "Manual", en: "Manual" } },
    ],
  },
  {
    key: "power",
    type: "number",
    label: { es: "Potencia", en: "Power" },
    unit: "hp",
    group: groups.performance,
  },
  { key: "seats", type: "number", label: { es: "Plazas", en: "Seats" }, group: groups.technical },
  condition,
];

const armourLevel: AttributeDef = {
  key: "armourLevel",
  type: "enum",
  label: { es: "Nivel de blindaje", en: "Armour level" },
  highlight: true,
  facet: true,
  group: groups.technical,
  options: [
    { value: "n-iii", label: { es: "Nivel III", en: "Level III" } },
    { value: "n-iiia", label: { es: "Nivel III-A", en: "Level III-A" } },
    { value: "n-iv", label: { es: "Nivel IV", en: "Level IV" } },
    { value: "b6", label: { es: "B6", en: "B6" } },
    { value: "b7", label: { es: "B7", en: "B7" } },
  ],
};

/* --- Aviation ---------------------------------------------------------------- */

const aviationBase: readonly AttributeDef[] = [
  {
    key: "passengers",
    type: "number",
    label: { es: "Pasajeros", en: "Passengers" },
    highlight: true,
    facet: true,
    group: groups.technical,
  },
  {
    key: "range",
    type: "number",
    label: { es: "Alcance", en: "Range" },
    unit: "nm",
    highlight: true,
    group: groups.performance,
  },
  {
    key: "manufacturer",
    type: "text",
    label: { es: "Fabricante", en: "Manufacturer" },
    facet: true,
    group: groups.general,
  },
  { ...year, label: { es: "Año de fabricación", en: "Year of manufacture" } },
  {
    key: "totalHours",
    type: "number",
    label: { es: "Horas totales", en: "Total hours" },
    unit: "h",
    group: groups.technical,
  },
  {
    key: "homeBase",
    type: "text",
    label: { es: "Base de operación", en: "Home base" },
    group: groups.operation,
  },
  {
    key: "operatorCertified",
    type: "boolean",
    label: { es: "Operador certificado", en: "Certified operator" },
    highlight: true,
    group: groups.operation,
  },
];

/* --- Private Services --------------------------------------------------------- */

const servicesBase: readonly AttributeDef[] = [
  {
    key: "serviceModel",
    type: "enum",
    label: { es: "Modalidad", en: "Service model" },
    highlight: true,
    facet: true,
    group: groups.operation,
    options: [
      { value: "hourly", label: { es: "Por horas", en: "Hourly" } },
      { value: "daily", label: { es: "Por día", en: "Daily" } },
      { value: "retainer", label: { es: "Bajo contrato", en: "Retainer" } },
      { value: "project", label: { es: "Por proyecto", en: "Per project" } },
    ],
  },
  {
    key: "coverage",
    type: "text",
    label: { es: "Cobertura", en: "Coverage" },
    highlight: true,
    group: groups.operation,
  },
  {
    key: "languages",
    type: "multi-enum",
    label: { es: "Idiomas", en: "Languages" },
    group: groups.operation,
    options: [
      { value: "es", label: { es: "Español", en: "Spanish" } },
      { value: "en", label: { es: "Inglés", en: "English" } },
      { value: "pt", label: { es: "Portugués", en: "Portuguese" } },
      { value: "fr", label: { es: "Francés", en: "French" } },
      { value: "ar", label: { es: "Árabe", en: "Arabic" } },
    ],
  },
  {
    key: "availability24h",
    type: "boolean",
    label: { es: "Disponibilidad 24/7", en: "24/7 availability" },
    facet: true,
    group: groups.operation,
  },
  {
    key: "licensedProvider",
    type: "boolean",
    label: { es: "Proveedor habilitado", en: "Licensed provider" },
    highlight: true,
    group: groups.operation,
  },
];

/* --- Business ------------------------------------------------------------------ */

const businessBase: readonly AttributeDef[] = [
  {
    key: "sector",
    type: "text",
    label: { es: "Sector", en: "Sector" },
    highlight: true,
    facet: true,
    group: groups.general,
  },
  { ...condition, group: groups.general },
  { key: "units", type: "number", label: { es: "Unidades", en: "Units" }, group: groups.general },
  {
    key: "annualRevenue",
    type: "text",
    label: { es: "Facturación anual", en: "Annual revenue" },
    group: groups.commercial,
  },
  {
    key: "employees",
    type: "number",
    label: { es: "Empleados", en: "Employees" },
    group: groups.commercial,
  },
  {
    key: "transferType",
    type: "enum",
    label: { es: "Tipo de operación", en: "Transfer type" },
    facet: true,
    group: groups.commercial,
    options: [
      { value: "full-sale", label: { es: "Venta total", en: "Full sale" } },
      { value: "stake", label: { es: "Participación", en: "Stake" } },
      { value: "partnership", label: { es: "Alianza", en: "Partnership" } },
      { value: "asset", label: { es: "Activo", en: "Asset" } },
    ],
  },
];

/* --- Catálogo de categorías ------------------------------------------------------ */

export const categories: readonly Category[] = [
  // Real Estate
  {
    id: "cat-re-apartment",
    vertical: "real-estate",
    slug: "apartamentos",
    name: { es: "Apartamentos", en: "Apartments" },
    attributeSchema: realEstateBase,
  },
  {
    id: "cat-re-house",
    vertical: "real-estate",
    slug: "casas",
    name: { es: "Casas", en: "Houses" },
    attributeSchema: realEstateBase,
  },
  {
    id: "cat-re-estate",
    vertical: "real-estate",
    slug: "fincas",
    name: { es: "Fincas y haciendas", en: "Estates and farmland" },
    attributeSchema: realEstateBase,
  },
  {
    id: "cat-re-land",
    vertical: "real-estate",
    slug: "lotes",
    name: { es: "Lotes y terrenos", en: "Plots and land" },
    attributeSchema: [realEstateBase[1], realEstateBase[7]] as AttributeDef[],
  },
  {
    id: "cat-re-commercial",
    vertical: "real-estate",
    slug: "comercial",
    name: { es: "Propiedades comerciales", en: "Commercial property" },
    attributeSchema: realEstateBase,
  },
  {
    id: "cat-re-investment",
    vertical: "real-estate",
    slug: "inversion",
    name: { es: "Inmuebles de inversión", en: "Investment property" },
    attributeSchema: realEstateBase,
  },

  // Motors
  {
    id: "cat-mo-premium",
    vertical: "motors",
    slug: "premium",
    name: { es: "Vehículos premium", en: "Premium vehicles" },
    attributeSchema: motorsBase,
  },
  {
    id: "cat-mo-classic",
    vertical: "motors",
    slug: "clasicos",
    name: { es: "Vehículos clásicos", en: "Classic vehicles" },
    attributeSchema: motorsBase,
  },
  {
    id: "cat-mo-security",
    vertical: "motors",
    slug: "seguridad",
    name: { es: "Vehículos de seguridad", en: "Security vehicles" },
    attributeSchema: [...motorsBase, armourLevel],
  },
  {
    id: "cat-mo-commercial",
    vertical: "motors",
    slug: "comerciales",
    name: { es: "Vehículos comerciales", en: "Commercial vehicles" },
    attributeSchema: motorsBase,
  },
  {
    id: "cat-mo-motorcycle",
    vertical: "motors",
    slug: "motos",
    name: { es: "Motocicletas", en: "Motorcycles" },
    attributeSchema: motorsBase,
  },

  // Aviation
  {
    id: "cat-av-jet",
    vertical: "aviation",
    slug: "jets",
    name: { es: "Jets privados", en: "Private jets" },
    attributeSchema: aviationBase,
  },
  {
    id: "cat-av-helicopter",
    vertical: "aviation",
    slug: "helicopteros",
    name: { es: "Helicópteros", en: "Helicopters" },
    attributeSchema: aviationBase,
  },
  {
    id: "cat-av-charter",
    vertical: "aviation",
    slug: "charter",
    name: { es: "Vuelos charter", en: "Charter flights" },
    attributeSchema: aviationBase,
  },
  {
    id: "cat-av-services",
    vertical: "aviation",
    slug: "servicios-aviacion",
    name: { es: "Servicios de aviación", en: "Aviation services" },
    attributeSchema: aviationBase,
  },

  // Private Services
  {
    id: "cat-ps-transport",
    vertical: "private-services",
    slug: "transporte-ejecutivo",
    name: { es: "Transporte ejecutivo", en: "Executive transport" },
    attributeSchema: servicesBase,
  },
  {
    id: "cat-ps-protection",
    vertical: "private-services",
    slug: "proteccion",
    name: { es: "Seguridad y protección", en: "Security and protection" },
    attributeSchema: servicesBase,
  },
  {
    id: "cat-ps-concierge",
    vertical: "private-services",
    slug: "concierge",
    name: { es: "Concierge", en: "Concierge" },
    attributeSchema: servicesBase,
  },
  {
    id: "cat-ps-logistics",
    vertical: "private-services",
    slug: "logistica",
    name: { es: "Logística privada", en: "Private logistics" },
    attributeSchema: servicesBase,
  },

  // Business Opportunities
  {
    id: "cat-bu-machinery",
    vertical: "business",
    slug: "maquinaria",
    name: { es: "Maquinaria y equipos", en: "Machinery and equipment" },
    attributeSchema: businessBase,
  },
  {
    id: "cat-bu-company",
    vertical: "business",
    slug: "negocios",
    name: { es: "Negocios en venta", en: "Businesses for sale" },
    attributeSchema: businessBase,
  },
  {
    id: "cat-bu-partnership",
    vertical: "business",
    slug: "alianzas",
    name: { es: "Alianzas comerciales", en: "Commercial partnerships" },
    attributeSchema: businessBase,
  },
  {
    id: "cat-bu-assets",
    vertical: "business",
    slug: "activos",
    name: { es: "Activos especiales", en: "Special assets" },
    attributeSchema: businessBase,
  },
];

export const categoriesById = new Map(categories.map((category) => [category.id, category]));
