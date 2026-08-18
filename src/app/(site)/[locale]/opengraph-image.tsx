import { ImageResponse } from "next/og";

import { getDictionary } from "@/content";
import { brand } from "@/content/shared";
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
 * Se dibuja con primitivas, sin fuentes externas ni imágenes: así no depende
 * de la red al generarse y no hay ningún activo que pueda faltar. El símbolo
 * se reconstruye con dos rombos recortados, que es la misma geometría del
 * logo expresada con lo que `next/og` sabe pintar.
 */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "es");

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
            El lockup, no el nombre a secas: la X va reducida y atenuada igual
            que en la cabecera, para que quien comparta el enlace vea la misma
            marca que hay en el sitio. Satori no hereda `font-size` en línea
            como el navegador, así que cada tramo lleva el suyo explícito.
          */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 20,
            letterSpacing: 8,
            color: "#A8ABB0",
            textTransform: "uppercase",
          }}
        >
          {brand.initials}
          <span style={{ fontSize: 15, opacity: 0.6, padding: "0 6px" }}>X</span>
          Access
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

        {/* Las dos hojas del portal, con el vano entre ellas. */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderLeft: "5px solid #C9A96A",
              borderBottom: "5px solid #C9A96A",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              width: 34,
              height: 34,
              borderRight: "5px solid #C9A96A",
              borderTop: "5px solid #C9A96A",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      </div>
    </div>,
    size,
  );
}
