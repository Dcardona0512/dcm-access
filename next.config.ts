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

const nextConfig: NextConfig = {
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
