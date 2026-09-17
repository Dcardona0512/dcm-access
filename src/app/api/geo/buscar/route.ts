import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/admin";

/* ============================================================================
   BUSCAR UNA DIRECCIÓN
   ----------------------------------------------------------------------------
   Nominatim, el buscador del propio OpenStreetMap: sin clave, sin cuenta y sin
   tarjeta. No hay factura posible porque no hay con qué cobrar.

   Va POR EL SERVIDOR y no directo desde el navegador, y no es un capricho:

   1. SU POLÍTICA EXIGE IDENTIFICARSE con un `User-Agent` propio, y el
      navegador no deja fijarlo. Desde aquí sí.
   2. UNA CONSULTA POR SEGUNDO, máximo. Con cien pestañas abiertas el
      navegador no puede garantizarlo; un solo servidor sí.
   3. LA CACHÉ SE COMPARTE. Dos personas buscando la misma calle gastan una
      consulta, no dos.

   Incumplir esa política no cuesta dinero: cuesta que bloqueen la IP, y eso
   deja el formulario sin buscador para todos a la vez.
   ========================================================================== */

/** Su política: una consulta por segundo como máximo, sin excepciones. */
const MINIMO_ENTRE_CONSULTAS = 1100;

let ultimaConsulta = 0;

/**
 * Caché en memoria del proceso.
 *
 * Quien escribe una dirección repite las mismas letras al corregirse, y un
 * formulario de publicación se recorre varias veces seguidas. Media hora es
 * de sobra: una calle no se muda.
 */
const CADUCIDAD = 30 * 60 * 1000;
const cache = new Map<string, { readonly at: number; readonly datos: Resultado[] }>();

export type Resultado = {
  readonly etiqueta: string;
  readonly lat: number;
  readonly lng: number;
  readonly ciudad?: string;
};

type FilaNominatim = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: Record<string, string>;
};

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  // El país acota la búsqueda al que ya se eligió arriba: sin él, «Calle 13»
  // devuelve calles de medio mundo.
  const pais = params.get("country")?.trim().toLowerCase() ?? "";

  // Menos de tres letras no es una búsqueda, es alguien empezando a escribir.
  if (q.length < 3) return NextResponse.json([]);

  const clave = `${pais}::${q.toLowerCase()}`;
  const guardado = cache.get(clave);
  if (guardado && Date.now() - guardado.at < CADUCIDAD) {
    return NextResponse.json(guardado.datos);
  }

  // Espera lo que falte para respetar el segundo entre consultas. Es preferible
  // que una sugerencia tarde medio segundo más a que bloqueen el servicio.
  const espera = MINIMO_ENTRE_CONSULTAS - (Date.now() - ultimaConsulta);
  if (espera > 0) await new Promise((listo) => setTimeout(listo, espera));
  ultimaConsulta = Date.now();

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "es");
  if (pais) url.searchParams.set("countrycodes", pais);

  try {
    const respuesta = await fetch(url, {
      headers: {
        // Lo exige su política de uso: quién consulta y dónde reclamar.
        "User-Agent": "DCM-ACCESS/1.0 (https://dcmxaccess.vercel.app; dcmxaccess@gmail.com)",
        "Accept-Language": "es",
      },
      // Si tardan, se abandona: un formulario no puede quedarse colgado
      // esperando a un servicio de cortesía.
      signal: AbortSignal.timeout(6000),
    });

    if (!respuesta.ok) return NextResponse.json([]);

    const filas = (await respuesta.json()) as FilaNominatim[];

    const datos: Resultado[] = filas
      .filter((fila) => fila.lat && fila.lon && fila.display_name)
      .map((fila) => {
        const dir = fila.address ?? {};
        return {
          etiqueta: fila.display_name!,
          lat: Number(fila.lat),
          lng: Number(fila.lon),
          ciudad:
            dir.city ?? dir.town ?? dir.village ?? dir.municipality ?? dir.county ?? undefined,
        };
      });

    cache.set(clave, { at: Date.now(), datos });
    return NextResponse.json(datos);
  } catch {
    // Sin sugerencias, el mapa y el pin siguen funcionando a mano. Devolver
    // una lista vacía degrada la función; devolver un error rompería el
    // formulario entero por un buscador que es una comodidad.
    return NextResponse.json([]);
  }
}
