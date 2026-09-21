"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { PlacePicker } from "@/components/admin/PlacePicker";

import { createPartnerProfile } from "../actions";
import { initialPartnerState } from "../state";

/* ============================================================================
   ALTA DE PARTNER
   ----------------------------------------------------------------------------
   Seis campos y ni uno más. Lo que hace falta para que alguien pueda decidir
   si esta empresa es quien dice ser; los documentos y el detalle llegan cuando
   la revisión los pida, no antes de saber si hay revisión.
   ========================================================================== */

/**
 * A qué se dedica el socio.
 *
 * Es una LISTA y no un campo libre: escrito a mano, lo mismo llega como
 * «inmobiliaria», «finca raíz» o «bienes raíces», y entonces no sirve para
 * agrupar ni para buscar. Con cinco opciones se responde en un toque.
 *
 * Dos de ellas piden que lo escriban. «Otro servicio» y «negocios» son
 * cajones donde cabe cualquier cosa —un escolta, una constructora y un fondo
 * caen en el mismo rótulo— así que la lista clasifica y el texto concreta.
 */
const CATEGORIAS: readonly { readonly valor: string; readonly texto: string }[] = [
  { valor: "real-estate", texto: "Inmobiliaria" },
  { valor: "motors", texto: "Vehículos" },
  { valor: "aviation", texto: "Aviación" },
  { valor: "services", texto: "Otro servicio" },
  { valor: "business", texto: "Negocios" },
];

const PIDEN_DETALLE = new Set(["services", "business"]);

export function PartnerOnboarding({
  nombre,
  countries,
}: {
  readonly nombre: string;
  /** La lista de países, que la arma el servidor. */
  readonly countries: readonly { readonly code: string; readonly name: string }[];
}) {
  const [state, action] = useActionState(createPartnerProfile, initialPartnerState);
  const [categoria, setCategoria] = useState("");

  const campo =
    "border-line text-fg placeholder:text-fg-muted/40 hover:border-fg-muted/40 focus-visible:border-accent w-full rounded-(--radius-card) border bg-transparent px-4 py-3 outline-none transition-colors";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Su ficha de partner</h1>
        <p className="text-fg-muted max-w-[60ch] text-pretty">
          {nombre}, cuéntenos a qué se dedica. Revisamos cada ficha a mano antes de habilitar
          publicaciones: es lo que hace que un cliente se fíe de lo que ve aquí.
        </p>
      </header>

      <form action={action} className="flex max-w-xl flex-col gap-5">
        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm"
          >
            {state.message}
          </p>
        ) : null}

        <Campo etiqueta="Nombre de la empresa">
          <input name="companyName" required maxLength={160} className={campo} />
        </Campo>

        <div className="grid gap-5">
          <Campo etiqueta="A qué se dedica">
            <select
              name="category"
              required
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              className={`${campo} cursor-pointer`}
            >
              <option value="" disabled className="bg-surface-raised">
                Elija una
              </option>
              {CATEGORIAS.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor} className="bg-surface-raised">
                  {opcion.texto}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        {/* Solo cuando la categoría elegida no dice bastante por sí sola. */}
        {PIDEN_DETALLE.has(categoria) ? (
          <Campo etiqueta={categoria === "services" ? "¿Qué servicio?" : "¿Qué tipo de negocio?"}>
            <input
              name="categoryDetail"
              required
              maxLength={160}
              placeholder={
                categoria === "services"
                  ? "Escolta, conductor, logística, asesoría…"
                  : "Maquinaria, participaciones, alianzas…"
              }
              className={campo}
            />
          </Campo>
        ) : null}

        {/*
          País, departamento y ciudad en cascada, el mismo componente que usa
          el formulario de publicar. Escritos a mano, la misma ciudad llega de
          cinco formas distintas y deja de servir para agrupar ni para buscar.
        */}
        <div className="flex flex-col gap-2">
          <span className="eyebrow text-fg-muted text-[0.8rem]">Dónde está</span>
          <PlacePicker countries={countries} onChange={() => {}} />
        </div>

        <Campo etiqueta="Descripción">
          <textarea name="description" required rows={5} maxLength={2000} className={campo} />
        </Campo>

        <Enviar />
      </form>
    </div>
  );
}

function Campo({
  etiqueta,
  opcional,
  children,
}: {
  readonly etiqueta: string;
  readonly opcional?: boolean;
  readonly children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-fg-muted text-[0.8rem]">
        {etiqueta}
        {opcional ? <span className="text-fg-muted/50 normal-case"> · opcional</span> : null}
      </span>
      {children}
    </label>
  );
}

function Enviar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="eyebrow bg-accent text-surface border-accent inline-flex h-12 items-center justify-center rounded-(--radius-card) border px-6 text-[0.75rem] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "Enviando…" : "Enviar para revisión"}
    </button>
  );
}
