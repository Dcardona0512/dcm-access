import type { Vertical } from "@/lib/domain/types";

import type { NavKey, RegionKey } from "./types";

/**
 * Invariantes de marca (§1, §30, §47).
 *
 * Aquí solo queda lo que NO depende del idioma: el nombre propio y la
 * estructura de rutas. Todas las etiquetas visibles —eslogan, descriptor,
 * navegación, regiones— viven en los diccionarios, para que el español se lea
 * íntegramente en español y el inglés íntegramente en inglés.
 */

export const brand = {
  /** Nombre propio. No se traduce en ningún idioma. */
  name: "DCM ACCESS",
  /** Iniciales del fundador: David Cardona Martínez. */
  initials: "DCM",
} as const;

/**
 * Datos de contacto.
 *
 * El correo es REAL y oficial desde ahora. La variable de entorno se conserva
 * para poder apuntar a otra dirección en previsualizaciones o en un dominio
 * propio el día que exista, sin recompilar: el valor de aquí es el que rige
 * mientras no se defina.
 *
 * El teléfono sigue siendo un marcador de posición vacío — se muestra solo si
 * tiene contenido, así que no aparece nada inventado.
 */
export const contact = {
  email: process.env.NEXT_PUBLIC_DCM_EMAIL ?? "dcmxaccess@gmail.com",
  phone: process.env.NEXT_PUBLIC_DCM_PHONE ?? "",
  /** Solo dígitos con indicativo de país: es el formato que exige wa.me. */
  whatsapp: process.env.NEXT_PUBLIC_DCM_WHATSAPP ?? "573205088849",
  baseCity: "Medellín",
  baseCountry: "CO",
} as const;

/** Ruta de cada destino. La etiqueta la pone `dict.navLabels[key]`. */
export const navHrefs: Record<NavKey, string> = {
  "real-estate": "/real-estate",
  motors: "/motors",
  aviation: "/aviation",
  servicios: "/servicios",
  negocios: "/negocios",
  contact: "/contact",
};

/** Las cinco verticales, en el orden en que se presentan siempre (§14). */
export const verticalNav: readonly { readonly key: NavKey; readonly vertical: Vertical }[] = [
  { key: "real-estate", vertical: "real-estate" },
  { key: "motors", vertical: "motors" },
  { key: "aviation", vertical: "aviation" },
  { key: "servicios", vertical: "servicios" },
  { key: "negocios", vertical: "negocios" },
];

/**
 * Enlace de WhatsApp con mensaje redactado.
 *
 * Vender no es un formulario: es una conversación. Quien quiere vender escribe,
 * y la ficha la publica el administrador desde el CRM con sus fotos y su vídeo.
 * Eso evita tener que moderar lo que suban terceros y garantiza que todo lo
 * publicado pasó por una revisión.
 *
 * Sin número configurado devuelve `null`, y quien llama cae al contacto: un
 * `wa.me/` sin destinatario lleva a una pantalla de error de WhatsApp.
 */
export function whatsappHref(message: string): string | null {
  const number = contact.whatsapp.replace(/\D/g, "");
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Regiones de la red (§35). Su nombre lo pone `dict.regions[key]`. */
export const regionKeys: readonly RegionKey[] = [
  "latam",
  "north-america",
  "europe",
  "middle-east",
  "other",
];

export const legalSlugs = ["terms", "privacy", "cookies", "disclaimer", "partner-policy"] as const;

export type LegalSlug = (typeof legalSlugs)[number];
