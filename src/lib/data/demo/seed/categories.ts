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

/**
 * Una categoría por sección, y nada más.
 *
 * Hubo veintitrés subcategorías —premium, clásicos, comerciales, motos— y se
 * quitaron: subdividir un catálogo de decenas de fichas produce filtros que
 * devuelven una sola cosa o ninguna, y obliga a quien publica a clasificar
 * antes de poder escribir el título.
 *
 * Lo que la categoría sigue aportando es su `attributeSchema`: es lo que
 * decide que un vehículo tenga marca y kilometraje y un inmueble habitaciones
 * y área. Esa parte se conserva intacta; lo que desaparece es la subdivisión.
 *
 * El blindaje entra en el esquema general de vehículos y queda como campo
 * opcional: antes obligaba a elegir "vehículos de seguridad" para poder
 * declararlo, y ahora simplemente se rellena cuando aplica.
 */
export const categories: readonly Category[] = [
  {
    id: "cat-real-estate",
    vertical: "real-estate",
    slug: "inmobiliario",
    name: { es: "Inmobiliario", en: "Real Estate" },
    attributeSchema: realEstateBase,
  },
  {
    id: "cat-motors",
    vertical: "motors",
    slug: "vehiculos",
    name: { es: "Vehículos", en: "Motors" },
    attributeSchema: [...motorsBase, armourLevel],
  },
  {
    id: "cat-aviation",
    vertical: "aviation",
    slug: "aviacion",
    name: { es: "Aviación", en: "Aviation" },
    attributeSchema: aviationBase,
  },
  {
    id: "cat-servicios",
    vertical: "servicios",
    slug: "servicios",
    name: { es: "Servicios", en: "Services" },
    attributeSchema: servicesBase,
  },
  {
    id: "cat-negocios",
    vertical: "negocios",
    slug: "negocios",
    name: { es: "Negocios", en: "Business" },
    attributeSchema: businessBase,
  },
];

/** La categoría de una sección. Con una sola por vertical, es una búsqueda directa. */
export function categoryForVertical(vertical: Category["vertical"]): Category {
  const found = categories.find((category) => category.vertical === vertical);
  if (!found) throw new Error(`Sin categoría para la vertical ${vertical}`);
  return found;
}

export const categoriesById = new Map(categories.map((category) => [category.id, category]));
