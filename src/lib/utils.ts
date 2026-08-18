import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Marcas diacríticas combinantes, para poder despojar acentos tras NFD. */
const COMBINING_MARKS = /[̀-ͯ]/g;

/** Combina clases condicionales resolviendo conflictos de Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convierte un texto en slug ASCII apto para URL. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Normaliza texto para comparaciones: sin acentos, sin mayúsculas. */
export function normalize(value: string): string {
  return value.normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase().trim();
}
