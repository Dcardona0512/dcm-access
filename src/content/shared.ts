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
  /**
   * Segundo número, el de quien atiende a los interesados en una ficha.
   *
   * Son dos líneas distintas a propósito: por la primera entra quien QUIERE
   * VENDER y hay que valorar lo que trae; por esta entra quien quiere COMPRAR
   * algo ya publicado. Mezclarlas obligaría a adivinar en cada mensaje de qué
   * lado de la mesa está quien escribe.
   */
  whatsappSales: process.env.NEXT_PUBLIC_DCM_WHATSAPP_SALES ?? "573222607394",
  baseCity: "Medellín",
  baseCountry: "CO",
} as const;

/** Ruta de cada destino. La etiqueta la pone `dict.navLabels[key]`. */
export const navHrefs: Record<NavKey, string> = {
  "real-estate": "/real-estate",
  motors: "/motors",
  aviation: "/aviation",
  services: "/services",
  business: "/business",
  contact: "/contact",
};

/** Las cinco verticales, en el orden en que se presentan siempre (§14). */
export const verticalNav: readonly { readonly key: NavKey; readonly vertical: Vertical }[] = [
  { key: "real-estate", vertical: "real-estate" },
  { key: "motors", vertical: "motors" },
  { key: "aviation", vertical: "aviation" },
  { key: "services", vertical: "services" },
  { key: "business", vertical: "business" },
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
export function whatsappHref(message: string, number = contact.whatsapp): string | null {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Regiones de la red (§35). Su nombre lo pone `dict.regions[key]`. */
export const regionKeys: readonly RegionKey[] = [
  "latam",
  "north-america",
  "europe",
  "middle-east",
  "other",
];

export const legalSlugs = [
  "terms",
  "privacy",
  "cookies",
  "disclaimer",
  "partner-policy",
  "trade-policy",
  "non-discrimination",
] as const;

export type LegalSlug = (typeof legalSlugs)[number];

/* ============================================================================
   METRAJE DE FONDO POR CATEGORÍA
   ----------------------------------------------------------------------------
   Vive aquí y no en cada página porque ahora lo leen dos sitios: el fondo de
   la propia página y la tarjeta de esa categoría en la portada. Repetir la
   ruta en los dos garantizaba que un día enseñaran vídeos distintos.

   `tone` describe la luminancia del metraje, y no es decorativo: la cortina
   de entrada dibuja su halo encima y necesita saber contra qué compite.

   Servicios y Negocios todavía no tienen metraje. No se inventa uno: su
   tarjeta se queda con la placa editorial, que es lo honesto mientras no haya
   material propio.
   ========================================================================== */

export const verticalVideos: Partial<
  Record<Vertical, { readonly src: string; readonly tone: "dark" | "bright" }>
> = {
  "real-estate": { src: "/media/real-estate.mp4", tone: "bright" },
  motors: { src: "/media/motors.mp4", tone: "bright" },
  aviation: { src: "/media/aviation.mp4", tone: "bright" },
};
