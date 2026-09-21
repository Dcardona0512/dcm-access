import { NextResponse } from "next/server";

import { TEAM_ROLES } from "@/lib/auth/roles";
import { getSession } from "@/lib/auth/session";

/* ============================================================================
   BUSCAR UNA DIRECCIÓN
   ----------------------------------------------------------------------------
   Dos proveedores tras la misma puerta, y el que manda lo decide una variable
   de entorno:

     · CON `GOOGLE_MAPS_API_KEY` → Google, que sí tiene los números de puerta
       de Colombia. Lo mismo que usa FincaRaíz.
     · SIN ella → Nominatim, el buscador de OpenStreetMap: sin clave, sin
       cuenta y sin tarjeta, pero sin números de puerta. Comprobado: ni uno
       solo en Cali, ni por texto libre ni por consulta estructurada.

   El formulario no sabe cuál está contestando. Poner la clave en Vercel lo
   mejora sin tocar una línea de código, y quitarla lo devuelve al gratuito sin
   dejarlo roto: es lo que permite decidir sobre la tarjeta sin bloquear el
   trabajo mientras tanto.

   LA CLAVE NO LLEVA `NEXT_PUBLIC_`, y eso no es un detalle. Ese prefijo
   incrusta el valor en el paquete que descarga el navegador, donde cualquiera
   lo copia y lo gasta contra la cuenta de otro. Aquí vive solo en el servidor.
   ========================================================================== */

export type Resultado = {
  readonly etiqueta: string;
  readonly lat: number;
  readonly lng: number;
  readonly ciudad?: string;
  /**
   * Si el proveedor acertó el portal o solo la zona.
   *
   * Se enseña en la lista porque cambia lo que hay que hacer después: con una
   * coincidencia exacta el pin ya está puesto; con una aproximada hay que
   * arrastrarlo. Callarlo obligaría a comprobar cada vez.
   */
  readonly exacta?: boolean;
};

/* --- Google ---------------------------------------------------------------- */

type ComponenteGoogle = { long_name?: string; types?: string[] };
type FilaGoogle = {
  formatted_address?: string;
  geometry?: { location?: { lat?: number; lng?: number }; location_type?: string };
  address_components?: ComponenteGoogle[];
};

/**
 * Se usa Geocoding y NO Autocomplete, aunque Autocomplete sea lo que se ve en
 * FincaRaíz. La razón es el recibo: Autocomplete devuelve nombres sin
 * coordenadas, así que hace falta una segunda llamada a Place Details para
 * saber dónde cae —dos productos facturados por cada dirección—. Geocoding
 * resuelve texto y coordenadas de una vez, en una sola llamada y un solo
 * producto. Con la espera de medio segundo del formulario, se comporta igual.
 */
async function buscarEnGoogle(q: string, pais: string, clave: string): Promise<Resultado[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", q);
  url.searchParams.set("language", "es");
  url.searchParams.set("key", clave);
  if (pais) {
    url.searchParams.set("region", pais);
    // Acota de verdad, no solo sesga: sin esto «Calle 13» trae resultados de
    // otros países hispanohablantes.
    url.searchParams.set("components", `country:${pais.toUpperCase()}`);
  }

  const respuesta = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!respuesta.ok) return [];

  const datos = (await respuesta.json()) as { status?: string; results?: FilaGoogle[] };

  // `ZERO_RESULTS` es una respuesta legítima; cualquier otro estado distinto de
  // `OK` es un problema de configuración —clave mal restringida, API sin
  // activar, facturación caída— y conviene verlo en los registros del servidor.
  if (datos.status && datos.status !== "OK" && datos.status !== "ZERO_RESULTS") {
    console.error("[geo/buscar] Google respondió", datos.status);
    return [];
  }

  return (datos.results ?? [])
    .filter((fila) => fila.geometry?.location?.lat != null && fila.formatted_address)
    .map((fila) => {
      const ciudad = fila.address_components?.find((c) =>
        c.types?.some((t) => t === "locality" || t === "administrative_area_level_2"),
      )?.long_name;

      return {
        etiqueta: fila.formatted_address!,
        lat: fila.geometry!.location!.lat!,
        lng: fila.geometry!.location!.lng!,
        ciudad,
        // `ROOFTOP` es el portal exacto; `RANGE_INTERPOLATED`, el punto
        // calculado entre dos portales conocidos de la misma cuadra. Los dos
        // valen como dirección. El resto es el centro de una zona.
        exacta:
          fila.geometry!.location_type === "ROOFTOP" ||
          fila.geometry!.location_type === "RANGE_INTERPOLATED",
      };
    });
}

/* --- OpenStreetMap --------------------------------------------------------- */

/** Su política: una consulta por segundo como máximo, sin excepciones. */
const MINIMO_ENTRE_CONSULTAS = 1100;
let ultimaConsulta = 0;

type FilaNominatim = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: Record<string, string>;
};

async function buscarEnOSM(q: string, pais: string): Promise<Resultado[]> {
  // Espera lo que falte para respetar el segundo entre consultas. Incumplirlo
  // no cuesta dinero: cuesta que bloqueen la IP y dejen sin buscador a todos.
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

  const respuesta = await fetch(url, {
    headers: {
      // Lo exige su política de uso: quién consulta y dónde reclamar.
      "User-Agent": "DCM-ACCESS/1.0 (https://dcmxaccess.vercel.app; dcmxaccess@gmail.com)",
      "Accept-Language": "es",
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!respuesta.ok) return [];

  const filas = (await respuesta.json()) as FilaNominatim[];

  return filas
    .filter((fila) => fila.lat && fila.lon && fila.display_name)
    .map((fila) => {
      const dir = fila.address ?? {};
      return {
        etiqueta: fila.display_name!,
        lat: Number(fila.lat),
        lng: Number(fila.lon),
        ciudad: dir.city ?? dir.town ?? dir.village ?? dir.municipality ?? dir.county ?? undefined,
        // Solo es exacta si el propio resultado trae número de puerta. En
        // Colombia prácticamente nunca; en Europa, a menudo.
        exacta: Boolean(dir.house_number),
      };
    });
}

/* --- La puerta ------------------------------------------------------------- */

/**
 * Caché en memoria del proceso.
 *
 * Quien escribe una dirección repite las mismas letras al corregirse, y un
 * formulario de publicación se recorre varias veces seguidas. Media hora es de
 * sobra: una calle no se muda. Con Google además ahorra dinero directamente.
 */
const CADUCIDAD = 30 * 60 * 1000;
const cache = new Map<string, { readonly at: number; readonly datos: Resultado[] }>();

export async function GET(request: Request) {
  const sesion = await getSession();
  if (!sesion || !TEAM_ROLES.includes(sesion.role)) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  const pais = params.get("country")?.trim().toLowerCase() ?? "";

  // Menos de tres letras no es una búsqueda, es alguien empezando a escribir.
  if (q.length < 3) return NextResponse.json([]);

  const clave = process.env.GOOGLE_MAPS_API_KEY?.trim();
  const cacheKey = `${clave ? "g" : "o"}::${pais}::${q.toLowerCase()}`;

  const guardado = cache.get(cacheKey);
  if (guardado && Date.now() - guardado.at < CADUCIDAD) {
    return NextResponse.json(guardado.datos);
  }

  try {
    const datos = clave ? await buscarEnGoogle(q, pais, clave) : await buscarEnOSM(q, pais);
    cache.set(cacheKey, { at: Date.now(), datos });
    return NextResponse.json(datos);
  } catch {
    // Sin sugerencias, el mapa y el pin siguen funcionando a mano. Devolver una
    // lista vacía degrada la función; un error rompería el formulario entero
    // por un buscador que es una comodidad.
    return NextResponse.json([]);
  }
}
