import { ImageResponse } from "next/og";

import { CREMA, fuenteLogo, ORO, TINTA } from "@/lib/brand/og-font";

/* ============================================================================
   ICONO DE PANTALLA DE INICIO (iOS y Android)
   ----------------------------------------------------------------------------
   A 180 px sí cabe el logotipo entero, pero se queda el monograma a propósito:
   un icono cuadrado con un lockup horizontal dentro deja el texto minúsculo y
   dos franjas vacías arriba y abajo. La marca se lee mejor ocupando el cuadro.

   Aquí el filete sí va como en pantalla —crema atenuada entre las iniciales y
   el dorado debajo, a modo de firma—: hay sitio de sobra para el matiz que el
   favicon de 16 px no puede permitirse.

   El cuerpo está medido, no elegido: con las tres iniciales y sus dos filetes
   el lockup avanza unas 2,4 veces el cuerpo, así que a 44 px ocupa unos 120 de
   los 180 del cuadro y deja treinta de aire a cada lado. A 62 —el valor con el
   que se escribió esto la primera vez— la D y la M se salían por los bordes.
   ========================================================================== */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const data = await fuenteLogo();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          background: TINTA,
          fontFamily: "Playfair",
          color: CREMA,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 44, lineHeight: 1 }}>
          <span style={{ display: "flex" }}>D</span>
          <div style={{ display: "flex", width: 2, height: 38, margin: "0 8px", background: "rgba(245,243,239,0.32)" }} />
          <span style={{ display: "flex" }}>C</span>
          <div style={{ display: "flex", width: 2, height: 38, margin: "0 8px", background: "rgba(245,243,239,0.32)" }} />
          <span style={{ display: "flex" }}>M</span>
        </div>

        <div style={{ display: "flex", width: 76, height: 2, background: ORO }} />
      </div>
    ),
    { ...size, fonts: [{ name: "Playfair", data, style: "normal", weight: 600 }] },
  );
}
