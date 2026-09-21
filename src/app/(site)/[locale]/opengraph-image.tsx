import { ImageResponse } from "next/og";

import { getDictionary } from "@/content";
import { brand } from "@/content/shared";
import { CREMA, fuenteLogo, ORO } from "@/lib/brand/og-font";
import { isLocale, locales } from "@/lib/i18n/config";

export const alt = "DCM ACCESS — Access to exclusive opportunities";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Imagen social (§27).
 *
 * No depende de la red al generarse: lo único que se carga es la fuente del
 * logotipo, y se lee del disco. Ningún activo que pueda faltar.
 *
 * El lockup se compone aquí a mano —iniciales, filetes, filete dorado y
 * ACCESS— en lugar de reutilizar el componente de pantalla, porque Satori no
 * es un navegador: no hereda `font-size` en línea, no conoce las variables CSS
 * ni las clases de Tailwind, y solo entiende flex. Es el mismo dibujo escrito
 * en el único lenguaje que sabe leer.
 */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "es");
  const data = await fuenteLogo();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#08090A",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Filete superior en champagne: la firma visual de la marca. */}
      <div style={{ display: "flex", width: "100%", height: 2, background: "#C9A96A" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/*
            El lockup entero, no el nombre a secas: quien comparta el enlace ve
            la misma marca que hay en la cabecera, con sus filetes y su dorado.
          */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "Playfair",
            fontSize: 44,
            lineHeight: 1,
            color: CREMA,
          }}
        >
          <span style={{ display: "flex" }}>{brand.initials[0]}</span>
          <Filete />
          <span style={{ display: "flex" }}>{brand.initials[1]}</span>
          <Filete />
          <span style={{ display: "flex" }}>{brand.initials[2]}</span>
          <div
            style={{ display: "flex", width: 2, height: 40, margin: "0 22px", background: ORO }}
          />
          <span style={{ display: "flex", fontSize: 21, letterSpacing: 7, color: ORO }}>
            ACCESS
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 78,
            lineHeight: 1.05,
            color: "#F2EFE9",
            maxWidth: 900,
            letterSpacing: -2,
          }}
        >
          {dict.meta.homeTitle}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#A8ABB0",
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          {dict.meta.siteDescription}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            fontSize: 17,
            letterSpacing: 5,
            color: "#C9A96A",
            textTransform: "uppercase",
          }}
        >
          {dict.brand.signature}
        </div>

        {/* El lema, que es lo que cierra el logotipo. Va traducido. */}
        <div
          style={{
            display: "flex",
            fontFamily: "Playfair",
            fontSize: 19,
            letterSpacing: 6,
            color: "#A8ABB0",
            textTransform: "uppercase",
          }}
        >
          {dict.brand.logoTagline}
        </div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Playfair", data, style: "normal", weight: 600 }] },
  );
}

/** El filete entre iniciales, en crema atenuada como en pantalla. */
function Filete() {
  return (
    <div
      style={{
        display: "flex",
        width: 2,
        height: 38,
        margin: "0 11px",
        background: "rgba(245,243,239,0.3)",
      }}
    />
  );
}
