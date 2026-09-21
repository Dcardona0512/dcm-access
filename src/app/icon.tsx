import { ImageResponse } from "next/og";

import { CREMA, fuenteLogo, ORO, TINTA } from "@/lib/brand/og-font";

/* ============================================================================
   FAVICON — EL MONOGRAMA COMPLETO
   ----------------------------------------------------------------------------
   Antes era una «D» sola. La decisión de marca es que sea el monograma entero,
   D | C | M, y eso obliga a apurar el cuadro: tres letras y dos filetes ocupan
   unas dos coma cuatro veces el cuerpo, así que la letra baja y el aire
   desaparece.

   Lo que se hace para que aguante a dieciséis píxeles:

   · SE DIBUJA A 128 y no a 64. Cuanta más resolución tiene el original, más
     sobrevive al reescalado del navegador; cuatro píxeles de origen por cada
     uno de destino dan un promedio mucho más limpio que dos.
   · LOS FILETES VAN EN DORADO Y A PLENA OPACIDAD. En pantalla son crema al
     30 %, pero eso aquí se convierte en un gris que desaparece: a este tamaño
     un filete atenuado no es sutil, es invisible.
   · MÁRGENES MÍNIMOS. El cuadro se llena de lado a lado, porque cada píxel de
     margen es un píxel que no está dibujando la marca.

   Aun así, a dieciséis píxeles cada letra vive en unos cuatro, y en una Didone
   los perfiles finos caen por debajo del píxel. Se lee como un bloque con dos
   rayas doradas — que es, al menos, un bloque reconocible y con el color de la
   casa. Queda escrito para quien vuelva a preguntarse por qué no se distingue
   la C.
   ========================================================================== */

export const size = { width: 128, height: 128 };
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
            42 sale de la cuenta, no del ojo: el monograma avanza unas 2,37
            veces el cuerpo, más los dos filetes con su aire. Con 120 píxeles
            útiles, cualquier cosa por encima se sale por los lados.
          */
          fontSize: 42,
          lineHeight: 1,
          color: CREMA,
        }}
      >
        <span style={{ display: "flex" }}>D</span>
        <Filete />
        <span style={{ display: "flex" }}>C</span>
        <Filete />
        <span style={{ display: "flex" }}>M</span>
      </div>
    ),
    { ...size, fonts: [{ name: "Playfair", data, style: "normal", weight: 600 }] },
  );
}

/** El filete, en dorado macizo: atenuado desaparecería al reducir. */
function Filete() {
  return (
    <div style={{ display: "flex", width: 3, height: 40, margin: "0 6px", background: ORO }} />
  );
}
