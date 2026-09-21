import { NextResponse } from "next/server";
import { City } from "country-state-city";

import { TEAM_ROLES } from "@/lib/auth/roles";
import { getSession } from "@/lib/auth/session";

/**
 * Ciudades de una división administrativa.
 *
 * Se devuelven con sus coordenadas para poder centrar el mapa en la ciudad
 * elegida, en vez de obligar a buscarla a mano desde Medellín.
 */
export async function GET(request: Request) {
  /*
    Equipo Y SOCIOS. El socio también elige dónde está su empresa y dónde está
    lo que publica, así que necesita la misma cascada; dejarla solo para el
    equipo obligaría a escribir la ciudad a mano justo donde más importa que
    esté normalizada.
  */
  const sesion = await getSession();
  const permitido = sesion && (TEAM_ROLES.includes(sesion.role) || sesion.role === "partner");

  if (!permitido) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const country = params.get("country")?.trim().toUpperCase();
  const state = params.get("state")?.trim();

  if (!country) return NextResponse.json([]);

  const cities = state
    ? City.getCitiesOfState(country, state)
    : // Hay países sin divisiones administrativas en el catálogo; ahí se
      // devuelven todas las del país en lugar de una lista vacía.
      City.getCitiesOfCountry(country) ?? [];

  return NextResponse.json(
    cities.map((city) => ({
      name: city.name,
      lat: Number(city.latitude),
      lng: Number(city.longitude),
    })),
    { headers: { "cache-control": "public, max-age=86400" } },
  );
}
