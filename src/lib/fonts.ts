import { Instrument_Serif, Inter } from "next/font/google";

/**
 * Tipografía (§9): elegancia, autoridad, modernidad, claridad.
 *
 * Instrument Serif para display — alto contraste y modulación editorial, sin
 * caer en el registro de revista de moda de una Bodoni ni en el de balneario
 * de una Cormorant. Solo tiene un peso, y a tamaño display no hace falta más.
 *
 * Inter para interfaz, con numerales tabulares activados en `globals.css`
 * para que las columnas de precios queden alineadas.
 */

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
  preload: true,
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const fontVariables = `${instrumentSerif.variable} ${inter.variable}`;
