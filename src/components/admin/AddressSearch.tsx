"use client";

import { useEffect, useRef, useState } from "react";

import type { Resultado } from "@/app/api/geo/buscar/route";

/* ============================================================================
   BUSCAR LA DIRECCIÓN
   ----------------------------------------------------------------------------
   Se escribe la dirección, se elige una sugerencia y el pin del mapa salta
   ahí. Es lo único que le faltaba al selector de ubicación frente al de
   FincaRaíz.

   QUÉ TAN FINO HILA depende del proveedor que conteste, y eso lo decide el
   servidor: con la clave de Google puesta, el portal exacto; sin ella,
   OpenStreetMap, que en Colombia no tiene un solo número de puerta y deja en
   la calle correcta. La lista lo dice en cada resultado.

   No pasa nada si no encuentra: el mapa y el pin siguen funcionando como
   antes. Esto añade un atajo, no sustituye nada.
   ========================================================================== */

/**
 * Lo que se espera a que deje de teclear.
 *
 * Nominatim admite una consulta por segundo, así que disparar con cada tecla
 * gastaría el cupo en una sola palabra. Medio segundo es el tiempo que tarda
 * alguien en dudar, y para entonces ya escribió algo que vale la pena buscar.
 */
const ESPERA = 500;

export function AddressSearch({
  country,
  onPick,
}: {
  /** Acota la búsqueda al país elegido arriba; sin él, «Calle 13» es medio mundo. */
  readonly country?: string;
  readonly onPick: (resultado: Resultado) => void;
}) {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<readonly Resultado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [elegido, setElegido] = useState<string | null>(null);

  // Guarda la petición en curso para poder abandonarla: sin esto, una
  // respuesta lenta puede llegar DESPUÉS de una rápida posterior y pisar las
  // sugerencias con las de lo que se escribió antes.
  const enCurso = useRef<AbortController | null>(null);

  useEffect(() => {
    const consulta = texto.trim();

    const temporizador = setTimeout(async () => {
      /*
        La comprobación va DENTRO del temporizador, no en el cuerpo del
        efecto. Cambiar el estado directamente en el cuerpo provoca un
        segundo renderizado antes de que el primero llegue a pintarse, y el
        linter lo rechaza con razón. Aquí corre en una devolución de llamada
        posterior, que es lo correcto.

        Lo que se acaba de elegir no se vuelve a buscar: al escribir el
        resultado en la caja, esto se dispararía otra vez con ese mismo texto.
      */
      if (consulta.length < 3 || consulta === elegido) {
        setResultados([]);
        return;
      }

      enCurso.current?.abort();
      const control = new AbortController();
      enCurso.current = control;

      setBuscando(true);
      try {
        const url = new URL("/api/geo/buscar", window.location.origin);
        url.searchParams.set("q", consulta);
        if (country) url.searchParams.set("country", country);

        const respuesta = await fetch(url, { signal: control.signal });
        setResultados(respuesta.ok ? await respuesta.json() : []);
      } catch {
        // Abortada o caída: se deja lo que hubiera, sin romper nada.
      } finally {
        if (!control.signal.aborted) setBuscando(false);
      }
    }, ESPERA);

    return () => clearTimeout(temporizador);
  }, [texto, country, elegido]);

  return (
    <div className="relative flex flex-col gap-2">
      <label className="flex flex-col gap-2">
        <span className="eyebrow text-fg-muted text-[0.8rem]">Buscar dirección</span>
        <input
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value);
            setElegido(null);
          }}
          placeholder="Dirección"
          className="border-line text-fg placeholder:text-fg-muted/40 focus-visible:border-accent h-11 w-full rounded-(--radius-card) border bg-transparent px-3 text-sm outline-none transition-colors"
        />
      </label>

      <p className="text-fg-muted/50 text-xs text-pretty">
        {buscando
          ? "Buscando…"
          : "Elija una sugerencia y el pin salta ahí. Después puede afinarlo arrastrándolo."}
      </p>

      {resultados.length > 0 ? (
        <ul className="border-line bg-surface-raised absolute top-full right-0 left-0 z-[500] mt-1 max-h-64 overflow-auto rounded-(--radius-card) border shadow-lg">
          {resultados.map((resultado) => (
            <li key={`${resultado.lat},${resultado.lng}`}>
              <button
                type="button"
                onClick={() => {
                  onPick(resultado);
                  setTexto(resultado.etiqueta);
                  setElegido(resultado.etiqueta);
                  setResultados([]);
                }}
                className="hover:bg-surface-sunken block w-full px-3 py-2.5 text-left text-sm text-pretty transition-colors"
              >
                {resultado.etiqueta}
                {/*
                  Se avisa cuando el resultado es solo la zona, porque cambia lo
                  que hay que hacer: con una dirección exacta el pin ya queda
                  puesto; con una aproximada hay que arrastrarlo. Callarlo
                  obligaría a comprobarlo cada vez.
                */}
                {resultado.exacta === false ? (
                  <span className="text-fg-muted/40 mt-0.5 block text-xs">Aproximada</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
