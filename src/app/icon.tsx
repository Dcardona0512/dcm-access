import { ImageResponse } from "next/og";

import { fuenteLogo, ORO, TINTA } from "@/lib/brand/og-font";

/* ============================================================================
   FAVICON
   ----------------------------------------------------------------------------
   Antes era un SVG dibujado a mano. Ya no puede serlo: la marca es tipográfica
   y un SVG de favicon no carga fuentes —los navegadores no le sirven recursos
   externos—, así que el texto saldría en la serif que cada sistema tuviera a
   mano, o en ninguna. Se genera como PNG con la letra empotrada.

   ES UNA SOLA LETRA, y no el monograma. Se probó: «D | C | M» en el cuadro de
   64 px obliga a bajar el cuerpo a unos 18 px para que quepan las tres con sus
   filetes, y al reducirlo el navegador a 16 px cada letra queda en menos de
   cuatro píxeles. En una Didone eso es fatal: el contraste entre astas y
   perfiles es justamente lo que define la letra, y los perfiles —que miden una
   fracción de píxel— desaparecen. Lo que quedaba era una mancha con dos rayas.

   Con una sola inicial la letra ocupa el cuadro entero y sobrevive al
   reescalado: se reconocen el remate, el ojo de la D y el contraste. Se pierde
   el nombre completo, que a ese tamaño no se leía de todos modos.

   Dorado sobre tinta: en una barra de pestañas clara el cuadro oscuro recorta
   la silueta, y en una oscura el dorado sigue siendo lo más claro de la pieza.
   Funciona en los dos temas sin tener que elegir.

   Se dibuja a 64 px y el navegador lo baja a 16: al cuádruple de resolución
   los remates sobreviven al reescalado, cosa que no ocurre generando
   directamente a 16.
   ========================================================================== */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const data = await fuenteLogo();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: TINTA,
          fontFamily: "Playfair",
          /*
            56 y no 64: la caja de texto incluye el espacio de las minúsculas
            con descendente, que aquí no hay. A cuerpo completo la mayúscula
            quedaría descentrada hacia arriba dentro del cuadro.
          */
          fontSize: 56,
          lineHeight: 1,
          color: ORO,
        }}
      >
        D
      </div>
    ),
    { ...size, fonts: [{ name: "Playfair", data, style: "normal", weight: 600 }] },
  );
}
