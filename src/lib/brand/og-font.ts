import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* ============================================================================
   LA FUENTE DEL LOGOTIPO PARA LAS IMÁGENES GENERADAS
   ----------------------------------------------------------------------------
   El favicon y la tarjeta social no son HTML: los dibuja Satori, que no tiene
   navegador detrás y por tanto no resuelve `@font-face` ni hojas de estilo. La
   letra hay que dársela en bytes.

   Es el MISMO archivo que sirve `next/font` al navegador. De ahí que esté en
   TTF y no en woff2 —Satori no entiende woff2— y de ahí que se subconjuntara a
   las mayúsculas y los dígitos: 9 KB que valen para los tres sitios donde
   aparece la marca.

   Se lee del disco y no de la red: una imagen que se genera en el despliegue
   no puede depender de que un servidor de fuentes conteste.
   ========================================================================== */

const RUTA = join(process.cwd(), "src/assets/fonts/PlayfairDisplay-Logo.ttf");

/** Dorado de marca. Aquí va en crudo: Satori no lee variables CSS. */
export const ORO = "#C9A96A";
/** Fondo de marca, el mismo `--c-surface` del sitio. */
export const TINTA = "#08090A";
export const CREMA = "#F5F3EF";

/**
 * Se cachea en el módulo porque una misma invocación puede pedir la imagen
 * varias veces —dos idiomas, varias fichas— y el archivo no cambia.
 */
let cache: Promise<Buffer> | undefined;

export function fuenteLogo(): Promise<Buffer> {
  cache ??= readFile(RUTA);
  return cache;
}
