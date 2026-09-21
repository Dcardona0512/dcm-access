import localFont from "next/font/local";

/* ============================================================================
   TIPOGRAFÍA
   ----------------------------------------------------------------------------
   Para el TEXTO no se descarga ninguna fuente, y es a propósito.

   El referente es Amazon, y Amazon no sirve una fuente para la mayor parte de
   su interfaz: su hoja de estilos declara `"Amazon Ember", Arial`, y como
   Ember está licenciada solo para ellos, lo que de hecho renderiza el
   navegador en casi toda la página es Arial. Copiar esa tipografía no es
   buscarle un parecido a Ember: es usar Arial.

   La ÚNICA excepción es el logotipo, y la excepción se gana su sitio: la marca
   es una Didone de alto contraste y no hay nada parecido en el sistema. En
   Windows saldría Times, en un Mac Didot y en Android ninguna de las dos, de
   modo que el logo cambiaría de forma según quién lo mire. Un logotipo que no
   es el mismo en todas partes no es un logotipo.

   PESA 9 KB. No es la fuente completa: se instancia en el peso 600 y se
   subconjunta a los 37 glifos que la marca usa de verdad —las veintiséis
   mayúsculas, los diez dígitos y el espacio—, que es lo que la deja en una
   décima parte de su tamaño. Las minúsculas, los acentos y la puntuación no
   están porque el logo no los escribe.

   Importa que sea TTF y no woff2: el mismo archivo lo lee `next/font` para el
   navegador y Satori para el favicon y la tarjeta social, y Satori no entiende
   woff2. Un solo archivo para los tres sitios, sin red en tiempo de
   construcción y sin ningún activo que pueda faltar.
   ========================================================================== */

const logo = localFont({
  src: "../assets/fonts/PlayfairDisplay-Logo.ttf",
  variable: "--font-logo",
  weight: "600",
  style: "normal",
  /*
    `swap` y no `block`: el logo se pinta primero con la serif del sistema y
    cambia cuando llega la suya. Con `block` el hueco se quedaría en blanco, y
    una cabecera sin marca durante el primer instante se lee como una página
    rota. Son 9 KB precargados: la ventana de cambio dura lo que tarde una
    petición, y el filete dorado y la composición ya están puestos.
  */
  display: "swap",
  preload: true,
  fallback: ["Didot", "Bodoni MT", "Georgia", "Times New Roman", "serif"],
});

/**
 * Variables de fuente para el `<html>`.
 *
 * Los dos layouts raíz —el del sitio y el del panel— aplican esta cadena, así
 * que enganchar una fuente nueva es rellenar esta constante y nada más. Si se
 * olvidara, el archivo se descargaría y no lo usaría nadie.
 */
export const fontVariables = logo.variable;
