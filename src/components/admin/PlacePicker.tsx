"use client";

import { useEffect, useState } from "react";

/* ============================================================================
   PAÍS → DIVISIÓN → CIUDAD
   ----------------------------------------------------------------------------
   En cascada, y cada nivel se pide al servidor solo cuando hace falta. El
   catálogo completo son diecisiete megas —doscientos cincuenta países, cinco
   mil divisiones, ciento cuarenta y ocho mil ciudades—; traerlo al navegador
   para que alguien elija una ciudad sería absurdo.

   Cambiar de país es un EVENTO, no una sincronización con un sistema externo,
   así que la cascada cuelga del manejador y no de un efecto. El único efecto
   que queda es la carga inicial, que sí es eso: traer del servidor lo que al
   montar todavía no se tiene.

   Hay países sin divisiones administrativas en el catálogo. En esos el segundo
   desplegable no aparece y las ciudades se piden del país entero, que es mejor
   que enseñar un control vacío que no hace nada.
   ========================================================================== */

const control =
  "border-line text-fg focus-visible:border-accent h-11 w-full rounded-(--radius-card) border bg-transparent px-3 text-sm outline-none transition-colors disabled:opacity-40";

export type Place = {
  readonly country: string;
  readonly region?: string;
  readonly city?: string;
  readonly lat?: number;
  readonly lng?: number;
};

type Named = { readonly code: string; readonly name: string };
type Town = { readonly name: string; readonly lat: number; readonly lng: number };

async function getStates(country: string): Promise<Named[]> {
  try {
    const response = await fetch(`/api/geo/states?country=${country}`);
    return response.ok ? ((await response.json()) as Named[]) : [];
  } catch {
    return [];
  }
}

async function getCities(country: string, state: string): Promise<Town[]> {
  try {
    const response = await fetch(
      `/api/geo/cities?country=${country}${state ? `&state=${encodeURIComponent(state)}` : ""}`,
    );
    return response.ok ? ((await response.json()) as Town[]) : [];
  } catch {
    return [];
  }
}

const INITIAL_COUNTRY = "CO";

export function PlacePicker({
  countries,
  onChange,
}: {
  readonly countries: readonly Named[];
  readonly onChange: (place: Place) => void;
}) {
  const [country, setCountry] = useState(INITIAL_COUNTRY);
  const [states, setStates] = useState<readonly Named[]>([]);
  const [state, setState] = useState("");
  const [cities, setCities] = useState<readonly Town[]>([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const stateName = states.find((entry) => entry.code === state)?.name;

  // Carga inicial. Sin `setState` síncrono en el cuerpo: todo ocurre al
  // resolverse la promesa, que es lo que un efecto debe hacer.
  useEffect(() => {
    let cancelled = false;

    void getStates(INITIAL_COUNTRY).then((data) => {
      if (cancelled) return;
      setStates(data);
      if (data.length === 0) {
        void getCities(INITIAL_COUNTRY, "").then((towns) => !cancelled && setCities(towns));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function pickCountry(iso: string) {
    setCountry(iso);
    setStates([]);
    setState("");
    setCities([]);
    setCity("");
    setLoading(true);
    onChange({ country: iso });

    const next = await getStates(iso);
    setStates(next);
    // Sin divisiones no hay segundo paso: se salta directo a las ciudades.
    setCities(next.length === 0 ? await getCities(iso, "") : []);
    setLoading(false);
  }

  async function pickState(code: string) {
    setState(code);
    setCity("");
    setCities([]);
    onChange({ country, region: states.find((entry) => entry.code === code)?.name });

    if (!code) return;
    setLoading(true);
    setCities(await getCities(country, code));
    setLoading(false);
  }

  function pickCity(name: string) {
    setCity(name);
    const found = cities.find((entry) => entry.name === name);
    onChange({ country, region: stateName, city: name, lat: found?.lat, lng: found?.lng });
  }

  return (
    <>
      <input type="hidden" name="country" value={country} />
      <input type="hidden" name="region" value={stateName ?? ""} />
      <input type="hidden" name="city" value={city} />

      <div className="flex flex-col gap-2">
        <span className="eyebrow text-fg-muted text-[0.8rem]">País</span>
        <select
          value={country}
          onChange={(event) => void pickCountry(event.target.value)}
          className={control}
        >
          {countries.map((entry) => (
            <option key={entry.code} value={entry.code} className="bg-surface-raised">
              {entry.name}
            </option>
          ))}
        </select>
      </div>

      {states.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="eyebrow text-fg-muted text-[0.8rem]">Departamento o estado</span>
          <select
            value={state}
            onChange={(event) => void pickState(event.target.value)}
            className={control}
          >
            <option value="" className="bg-surface-raised">
              Elija uno
            </option>
            {states.map((entry) => (
              <option key={entry.code} value={entry.code} className="bg-surface-raised">
                {entry.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <span className="eyebrow text-fg-muted text-[0.8rem]">Ciudad</span>
        <select
          value={city}
          onChange={(event) => pickCity(event.target.value)}
          disabled={cities.length === 0}
          className={control}
        >
          <option value="" className="bg-surface-raised">
            {loading
              ? "Cargando…"
              : cities.length === 0
                ? "Elija antes el departamento"
                : "Elija una ciudad"}
          </option>
          {cities.map((entry) => (
            <option
              key={`${entry.name}-${entry.lat}`}
              value={entry.name}
              className="bg-surface-raised"
            >
              {entry.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
