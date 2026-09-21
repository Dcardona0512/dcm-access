import type { NextConfig } from "next";

/* ============================================================================
   IMÁGENES REMOTAS
   ----------------------------------------------------------------------------
   `next/image` bloquea por defecto cualquier dominio que no esté declarado, y
   responde 400 en lugar de servir la imagen. Es una defensa deliberada: sin
   ella, el optimizador de imágenes del sitio se convierte en un proxy que
   cualquiera puede usar para servir archivos ajenos desde este dominio.

   El patrón se deriva de la URL del proyecto en lugar de escribirse a mano:
   así no hay una referencia de proyecto duplicada que se quede vieja el día
   que cambie. Y se limita a `/storage/v1/object/public/**` —la ruta de los
   objetos públicos— para que el optimizador no pueda alcanzar el resto de la
   API de Supabase.
   ========================================================================== */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

if (!supabaseUrl) {
  // Sin esto las fotos de las fichas no se ven y el fallo es silencioso: la
  // página carga entera y solo faltan las imágenes. Mejor decirlo al construir.
  console.warn(
    "[next.config] Falta NEXT_PUBLIC_SUPABASE_URL: las imágenes del catálogo no se podrán optimizar.",
  );
}

/**
 * Rutas que cambiaron de nombre al pasar el sitio a inglés.
 *
 * Van aquí y no en el proxy porque Next comprueba las redirecciones ANTES del
 * proxy: con la variante que ya lleva idioma, un enlace indexado como
 * `/es/servicios` resuelve en UN salto en lugar de encadenar la redirección de
 * idioma detrás.
 *
 * `permanent: true` responde 308, no 301: es el equivalente moderno, conserva
 * el método de la petición y los buscadores lo tratan igual. Permanente es lo
 * que toca —estas direcciones no van a volver— y es lo que hace que el enlace
 * indexado acabe sustituido por el nuevo.
 */
const RENOMBRADAS: readonly { readonly de: string; readonly a: string }[] = [
  { de: "servicios", a: "services" },
  { de: "negocios", a: "business" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...RENOMBRADAS.flatMap(({ de, a }) => [
        { source: `/:locale(es|en)/${de}`, destination: `/:locale/${a}`, permanent: true },
        {
          source: `/:locale(es|en)/${de}/:path*`,
          destination: `/:locale/${a}/:path*`,
          permanent: true,
        },
        // Sin idioma: el proxy le pondrá el suyo después de esta.
        { source: `/${de}`, destination: `/${a}`, permanent: true },
        { source: `/${de}/:path*`, destination: `/${a}/:path*`, permanent: true },
      ]),

      // El panel también pasa a inglés. No está indexado, pero la barra de
      // direcciones de quien lo usa a diario sí guarda las viejas.
      { source: "/admin/catalogo", destination: "/admin/catalog", permanent: true },
      { source: "/admin/publicar", destination: "/admin/publish", permanent: true },
      {
        source: "/admin/opportunities/:id/editar",
        destination: "/admin/opportunities/:id/edit",
        permanent: true,
      },
    ];
  },

  /*
    La fuente del logotipo viaja con las funciones que dibujan el favicon, el
    icono de pantalla de inicio y la tarjeta social. Se lee del disco con
    `readFile`, y el rastreador de dependencias solo incluye lo que ve
    importado: sin esta línea el archivo se queda fuera del paquete y las tres
    imágenes fallan en producción aunque funcionen en local.
  */
  outputFileTracingIncludes: {
    "/icon": ["./src/assets/fonts/**"],
    "/apple-icon": ["./src/assets/fonts/**"],
    "/[locale]/opengraph-image": ["./src/assets/fonts/**"],
  },
  images: {
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: "https",
            hostname: new URL(supabaseUrl).hostname,
            pathname: "/storage/v1/object/public/**",
            search: "",
          },
        ]
      : [],
  },
};

export default nextConfig;
