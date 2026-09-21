import { NextResponse } from "next/server";
import { State } from "country-state-city";

import { TEAM_ROLES } from "@/lib/auth/roles";
import { getSession } from "@/lib/auth/session";

/* ============================================================================
   ESTADOS Y DEPARTAMENTOS DE UN PAÍS
   ----------------------------------------------------------------------------
   El catálogo mundial son 250 países, 5.000 divisiones y 148.000 ciudades:
   diecisiete megas que jamás pueden viajar al navegador. Se consulta desde el
   servidor y se devuelve solo el trozo que hace falta.

   Va detrás de la sesión del panel no porque el dato sea secreto —es geografía
   pública— sino para que el sitio no acabe siendo la API de geografía gratuita
   de terceros a costa de nuestro presupuesto de ejecución.
   ========================================================================== */

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

  const country = new URL(request.url).searchParams.get("country")?.trim().toUpperCase();
  if (!country) return NextResponse.json([]);

  const states = State.getStatesOfCountry(country).map((state) => ({
    code: state.isoCode,
    name: state.name,
  }));

  return NextResponse.json(states, {
    // La geografía no cambia entre despliegues: cachear es gratis.
    headers: { "cache-control": "public, max-age=86400" },
  });
}
