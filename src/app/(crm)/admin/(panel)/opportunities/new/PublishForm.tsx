"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { LocationPicker } from "@/components/admin/LocationPicker";
import { PlacePicker, type Place } from "@/components/admin/PlacePicker";
import { TagsInput } from "@/components/admin/TagsInput";
import { createBrowserClient } from "@/lib/supabase/browser";

import { publishListing, requestUploadSlots, type PublishState } from "./actions";

/* ============================================================================
   PUBLICAR UNA FICHA
   ----------------------------------------------------------------------------
   Los archivos NO viajan con el formulario. Se suben aparte, directo al
   almacenamiento con una URL firmada, y al enviar solo va la lista de rutas.
   Por eso el `<input type="file">` no lleva atributo `name`: un input con
   nombre se serializa dentro del FormData aunque el servidor lo ignore, y la
   petición moriría en el límite de 1 MB de las server actions.
   ========================================================================== */

export type CategoryOption = {
  readonly id: string;
  readonly vertical: string;
  readonly name: string;
  readonly attributes: readonly AttributeField[];
};

export type AttributeField = {
  readonly key: string;
  readonly label: string;
  readonly type: string;
  readonly unit?: string;
  readonly options?: readonly { readonly value: string; readonly label: string }[];
};

type FileState = {
  readonly id: string;
  readonly file: File;
  readonly preview: string;
  status: "pendiente" | "subiendo" | "listo" | "falló";
  path?: string;
};

const MAX_FILES = 20;

const initial: PublishState = { status: "idle" };

export function PublishForm({
  listingId,
  initialVertical,
  categories,
  currencies,
  countries,
}: {
  /**
   * Se acuña en el SERVIDOR y llega como prop: es la carpeta del
   * almacenamiento y la clave de la ficha, así que si la validación falla no
   * hay que volver a subir nada. Generarlo en el cliente produciría un
   * identificador distinto en el render del servidor y en el del navegador.
   */
  readonly listingId: string;
  /** Viene de la pantalla anterior: aquí ya no se vuelve a preguntar. */
  readonly initialVertical: string;
  readonly categories: readonly CategoryOption[];
  readonly currencies: readonly string[];
  readonly countries: readonly { readonly code: string; readonly name: string }[];
}) {
  const [state, action] = useActionState(publishListing, initial);

  const [vertical] = useState(initialVertical);
  const [categoryId, setCategoryId] = useState("");
  const [place, setPlace] = useState<Place>({ country: "CO" });
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [tags, setTags] = useState<readonly string[]>([]);
  const [files, setFiles] = useState<FileState[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);

  const options = useMemo(
    () => categories.filter((c) => c.vertical === vertical),
    [categories, vertical],
  );

  /**
   * Cuatro secciones tienen una sola categoría y no hace falta preguntar.
   * Vehículos tiene ocho, así que ahí sí: una moto y un remolque no son lo
   * mismo. La pregunta aparece solo cuando hay algo que decidir.
   */
  const mustChoose = options.length > 1;
  const category = mustChoose ? options.find((c) => c.id === categoryId) : options[0];
  const ready = files.filter((f) => f.status === "listo");
  const missingMedia = touched && ready.length === 0;
  const pending = files.some((f) => f.status === "pendiente" || f.status === "subiendo");

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="border-accent/30 bg-accent/[0.04] flex flex-col items-start gap-4 rounded-(--radius-card) border px-6 py-10"
      >
        <h2 className="font-display text-xl">Publicada</h2>
        <p className="text-fg-muted text-sm">La ficha ya está visible en el sitio.</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/es/${state.vertical}/${state.slug}`}
            target="_blank"
            className="eyebrow border-accent/50 text-accent hover:bg-accent/10 rounded-(--radius-card) border px-3 py-2 text-[0.75rem] transition-colors"
          >
            Ver la ficha
          </Link>
          <Link
            href="/admin/opportunities/new"
            className="eyebrow border-line text-fg-muted hover:text-fg rounded-(--radius-card) border px-3 py-2 text-[0.75rem] transition-colors"
          >
            Publicar otra
          </Link>
        </div>
      </div>
    );
  }

  function remove(id: string) {
    setFiles((current) => current.filter((entry) => entry.id !== id));
  }

  async function onPick(picked: FileList | null) {
    if (!picked || picked.length === 0) return;

    // El tope se aplica al elegir, no al enviar: enterarse de que sobran
    // archivos DESPUÉS de haberlos subido es la peor versión de un límite.
    const room = MAX_FILES - files.length;
    if (room <= 0) return;

    const next: FileState[] = [...picked].slice(0, room).map((file) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: "pendiente" as const,
    }));

    setFiles((current) => [...current, ...next]);
    setUploading(true);

    const response = await requestUploadSlots(
      listingId,
      next.map((f) => ({ mimeType: f.file.type, bytes: f.file.size })),
    );

    if (!response.ok) {
      setFiles((current) =>
        current.map((f) => (next.some((n) => n.id === f.id) ? { ...f, status: "falló" } : f)),
      );
      setUploading(false);
      return;
    }

    const supabase = createBrowserClient();

    await Promise.all(
      next.map(async (entry, index) => {
        const slot = response.slots[index];
        setFiles((current) =>
          current.map((f) => (f.id === entry.id ? { ...f, status: "subiendo" } : f)),
        );

        const { error } = await supabase.storage
          .from("listing-media")
          .uploadToSignedUrl(slot.path, slot.token, entry.file);

        setFiles((current) =>
          current.map((f) =>
            f.id === entry.id
              ? { ...f, status: error ? "falló" : "listo", path: error ? undefined : slot.path }
              : f,
          ),
        );
      }),
    );

    setUploading(false);
  }

  return (
    <form action={action} className="flex flex-col gap-10">
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="mediaManifest"
        value={JSON.stringify(ready.map((f) => f.path))}
      />

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm"
        >
          {state.message}
        </p>
      ) : null}

      {/* --- Sección y categoría --------------------------------------------- */}
      <input type="hidden" name="categoryId" value={category?.id ?? ""} />
      <input type="hidden" name="tags" value={tags.join(",")} />
      {/* Si no se marcó el mapa, valen las coordenadas de la ciudad elegida. */}
      <input type="hidden" name="lat" value={point?.lat ?? place.lat ?? ""} />
      <input type="hidden" name="lng" value={point?.lng ?? place.lng ?? ""} />

      {/*
        Los medios van PRIMERO y en grande. Es lo que de verdad hay que
        revisar antes de publicar —si una foto salió movida o el vídeo no es el
        que era, se ve aquí— y enterrarlo al final del formulario obligaba a
        recorrerlo entero para comprobarlo.
      */}
      {/*
        Zona de arrastre, y no un botón discreto. Subir el contenido es la
        parte que más tiempo lleva y la que decide si un anuncio se ve bien o
        no, así que ocupa el sitio que le corresponde: arriba y grande.
      */}
      <Group title="Subir contenido" wide>
        <div className="flex flex-col gap-4">
          <p className="text-fg-muted/70 text-sm">
            Fotos y vídeos · {files.length}/{MAX_FILES} — Puede agregar un máximo de {MAX_FILES}
            archivos.
          </p>

          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void onPick(event.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-(--radius-card) border border-dashed px-6 py-16 transition-colors ${
              dragging
                ? "border-accent bg-accent/[0.06]"
                : missingMedia
                  ? "border-danger/60 bg-danger/[0.03]"
                  : "border-line hover:border-fg-muted/60 bg-surface-raised/40"
            }`}
          >
            <PlusGlyph />
            <span className="font-display text-lg">Agregar fotos y vídeos</span>
            <span className="text-fg-muted/60 text-sm">o arrástrelos aquí</span>

            {/* Sin `name`: si lo tuviera, los archivos entrarían en el FormData
                y la petición reventaría el límite de 1 MB de las acciones. */}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/quicktime"
              onChange={(event) => void onPick(event.target.files)}
              className="sr-only"
            />
          </label>

          {missingMedia ? (
            <p role="alert" className="text-danger text-sm">
              Suba al menos una foto.
            </p>
          ) : (
            <p className="text-fg-muted/50 text-xs">
              Hasta 10 MB por foto y 100 MB por vídeo. La primera imagen es la portada.
            </p>
          )}

          {files.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((f, index) => (
                <li key={f.id} className="flex flex-col gap-2">
                  <div className="border-line bg-surface-sunken relative aspect-[4/3] overflow-hidden rounded-(--radius-card) border">
                    {f.file.type.startsWith("video/") ? (
                      <video
                        src={f.preview}
                        controls
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.preview} alt="" className="h-full w-full object-cover" />
                    )}

                    {index === 0 ? (
                      <span className="eyebrow bg-surface/85 text-accent absolute top-2 left-2 rounded-(--radius-card) px-2 py-1 text-[0.75rem] backdrop-blur-sm">
                        Portada
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => remove(f.id)}
                      aria-label={`Quitar ${f.file.name}`}
                      className="bg-surface/85 text-fg-muted hover:text-danger absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full backdrop-blur-sm transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`eyebrow text-[0.75rem] ${
                        f.status === "listo"
                          ? "text-verified"
                          : f.status === "falló"
                            ? "text-danger"
                            : "text-fg-muted"
                      }`}
                    >
                      {f.status}
                    </span>
                    <span className="text-fg-muted/50 max-w-[60%] truncate text-xs">
                      {f.file.name}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Group>

      <input type="hidden" name="vertical" value={vertical} />

      {/* ----------------------------------------------------------------------
          El orden es el del anuncio, no el de la base de datos: primero lo que
          decide si alguien sigue mirando —qué es y cuánto cuesta—, después lo
          que lo clasifica, y al final lo que solo importa para publicarlo bien.

          Los rótulos de grupo no se ven: existen para los lectores de pantalla,
          porque un `fieldset` sin `legend` pierde su nombre.
          -------------------------------------------------------------------- */}

      {/* 1. Título · 2. Precio ------------------------------------------------ */}
      <Group title="Qué es y cuánto cuesta">
        <Field label="Título" full>
          <input name="title" required minLength={3} className={control} />
        </Field>

        {/*
          La operación solo se pregunta en inmobiliaria, que es donde de verdad
          hay dos: un carro se vende, pero un apartamento se vende o se
          arrienda, y de esa respuesta depende que el precio sea un valor o un
          canon mensual. En las demás secciones sería un desplegable con una
          sola respuesta posible.
        */}
        {vertical === "real-estate" ? (
          <Field label="Operación">
            <select name="listingType" defaultValue="sale" className={control}>
              <option value="sale" className="bg-surface-raised">
                Venta
              </option>
              <option value="rent" className="bg-surface-raised">
                Arriendo
              </option>
            </select>
          </Field>
        ) : null}

        {/*
          El precio ocupa la fila entera. Es la cifra por la que alguien decide
          si sigue mirando, y estaba compitiendo por media pantalla con un
          desplegable de tres letras.

          La moneda va pegada a su derecha porque juntas son un solo dato leído
          en voz alta —«ciento treinta y ocho millones de pesos»—: separadas,
          había que bajar la vista para confirmar en qué moneda se estaba
          escribiendo.
        */}
        <Field label="Precio" full>
          <div className="flex items-stretch gap-3">
            <input
              name="priceAmount"
              inputMode="numeric"
              required
              placeholder="0"
              // `min-w-0` deja que el campo se encoja de verdad en pantallas
              // estrechas: sin él, el ancho mínimo del contenido lo desborda.
              className={`${controlBase} h-12 min-w-0 flex-1 text-base`}
              data-numeric
            />

            {/* COP por defecto: la mayoría del inventario está en Colombia. Las
                demás siguen ahí para lo que se publica fuera. */}
            <select
              name="currency"
              defaultValue="COP"
              aria-label="Moneda"
              className={`${controlBase} h-12 w-28 shrink-0 text-base`}
            >
              {currencies.map((c) => (
                <option key={c} value={c} className="bg-surface-raised">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </Field>
      </Group>

      {/* 3. Categoría · 4. Estado ---------------------------------------------
          Van juntos y en este orden porque el estado no existe hasta que hay
          categoría: los campos de abajo los declara la categoría elegida, no
          este formulario. */}
      <Group title="Categoría y estado">
        {mustChoose ? (
          <Field label="Categoría">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className={control}
            >
              <option value="" className="bg-surface-raised">
                Elija una categoría
              </option>
              {options.map((c) => (
                <option key={c.id} value={c.id} className="bg-surface-raised">
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {category?.attributes.map((attr) => {
          /*
            Una lista de opciones múltiples —las comodidades de un inmueble son
            treinta— no cabe en un desplegable: obligaría a abrirlo treinta
            veces. Va como rejilla de casillas, que se recorre de un vistazo y
            deja ver de golpe lo marcado y lo que falta.
          */
          if (attr.type === "multi-enum" && attr.options && attr.options.length > 0) {
            return (
              <Field key={attr.key} label={attr.label} full>
                <div className="border-line-soft grid gap-x-5 gap-y-2.5 rounded-(--radius-card) border border-dashed p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {attr.options.map((o) => (
                    <label key={o.value} className="flex cursor-pointer items-center gap-2.5 text-sm">
                      {/* Todas comparten nombre: así llegan al servidor como
                          una lista y no como treinta campos sueltos. */}
                      <input
                        type="checkbox"
                        name={`attr_${attr.key}`}
                        value={o.value}
                        className="accent-accent h-4 w-4 shrink-0"
                      />
                      <span className="text-fg-muted text-pretty">{o.label}</span>
                    </label>
                  ))}
                </div>
              </Field>
            );
          }

          return (
            <Field key={attr.key} label={attr.unit ? `${attr.label} (${attr.unit})` : attr.label}>
              {attr.type === "boolean" ? (
                /*
                  Tres estados y no una casilla: «no lo sé» es una respuesta
                  legítima —y la más común— cuando se publica por encargo. Una
                  casilla solo sabe decir sí o no, y su «no» se confunde con no
                  haberla tocado.
                */
                <select name={`attr_${attr.key}`} defaultValue="" className={control}>
                  <option value="" className="bg-surface-raised">
                    —
                  </option>
                  <option value="true" className="bg-surface-raised">
                    Sí
                  </option>
                  <option value="false" className="bg-surface-raised">
                    No
                  </option>
                </select>
              ) : attr.options && attr.options.length > 0 ? (
                <select name={`attr_${attr.key}`} defaultValue="" className={control}>
                  <option value="" className="bg-surface-raised">
                    —
                  </option>
                  {attr.options.map((o) => (
                    <option key={o.value} value={o.value} className="bg-surface-raised">
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={`attr_${attr.key}`}
                  type={attr.type === "number" ? "number" : "text"}
                  inputMode={attr.type === "number" ? "numeric" : undefined}
                  className={control}
                />
              )}
            </Field>
          );
        })}
      </Group>

      {/* 5. Descripción -------------------------------------------------------- */}
      <Group title="Descripción" wide>
        <Field label="Descripción (opcional)" full>
          <textarea name="description" rows={5} className={`${control} h-auto py-3`} />
        </Field>
      </Group>

      {/* 6. Ubicación ----------------------------------------------------------
          Dos pasos, y solo el primero se publica: los desplegables fijan el país,
          el departamento y la ciudad, que es lo que ve cualquiera. El punto del
          mapa afina la posición exacta, se guarda para uso interno y no se
          muestra en ninguna página pública. */}
      <Group title="Ubicación">
        <PlacePicker countries={countries} onChange={setPlace} />
      </Group>

      <Group title="Punto exacto en el mapa" wide>
        <LocationPicker
          center={place.lat && place.lng ? { lat: place.lat, lng: place.lng } : null}
          onChange={(picked) => setPoint({ lat: picked.lat, lng: picked.lng })}
        />
      </Group>

      {/* 7. Etiquetas · 8. SKU -------------------------------------------------- */}
      <Group title="Etiquetas y referencia interna" wide>
        <Field label="Etiquetas (opcional, máximo 20)" full>
          <TagsInput onChange={setTags} />
        </Field>

        <Field label="SKU (opcional)" full>
          <input name="sku" className={control} />
          <span className="text-fg-muted/60 text-xs">
            Su referencia interna. Solo visible para usted: no se muestra en ninguna página
            pública.
          </span>
        </Field>
      </Group>

      {/* 9. Políticas ----------------------------------------------------------- */}
      <p className="border-accent/25 bg-accent/[0.03] text-fg-muted rounded-(--radius-card) border px-5 py-4 text-sm text-pretty">
        Al publicar acepta las{" "}
        <Link href="/es/legal/trade-policy" target="_blank" className="text-accent underline">
          políticas de comercio
        </Link>{" "}
        y la{" "}
        <Link
          href="/es/legal/non-discrimination"
          target="_blank"
          className="text-accent underline"
        >
          política de no discriminación
        </Link>
        .
      </p>

      <Submit
        disabled={uploading || pending || ready.length === 0}
        pendingUploads={pending}
        onAttempt={() => setTouched(true)}
      />
    </form>
  );
}

/**
 * El aspecto de un campo, SIN ancho.
 *
 * El ancho va aparte porque `control` llevaba `w-full` incrustado, y al meter
 * dos campos en una misma fila ese `w-full` ganaba a cualquier ancho que se le
 * pusiera encima: el importe se encogía a un dedo y la moneda se comía la
 * fila. Una clase que decide el ancho no puede reutilizarse en una fila
 * compartida.
 */
const controlBase =
  "border-line text-fg placeholder:text-fg-muted/40 focus-visible:border-accent h-11 rounded-(--radius-card) border bg-transparent px-3 text-sm outline-none transition-colors";

const control = `${controlBase} w-full`;

function Group({
  title,
  children,
  wide = false,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
  /** Sin rejilla de dos columnas: para lo que ocupa la fila entera. */
  readonly wide?: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-5">
      {/* El rótulo se queda para quien navega con lector de pantalla —un
          `fieldset` sin `legend` pierde su nombre— y desaparece de la vista,
          que es donde sobraba. */}
      <legend className="sr-only">{title}</legend>
      {wide ? children : <div className="grid gap-5 sm:grid-cols-2">{children}</div>}
    </fieldset>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
  readonly full?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2 ${full ? "sm:col-span-2" : ""}`}>
      <span className="eyebrow text-fg-muted text-[0.8rem]">{label}</span>
      {children}
    </div>
  );
}

function Submit({
  disabled,
  pendingUploads,
  onAttempt,
}: {
  readonly disabled: boolean;
  readonly pendingUploads: boolean;
  readonly onAttempt: () => void;
}) {
  const { pending } = useFormStatus();
  const blocked = disabled || pending;

  return (
    <div className="border-line-soft flex items-center gap-4 border-t pt-6">
      <button
        type="submit"
        onClick={onAttempt}
        disabled={blocked}
        className="eyebrow bg-fg text-surface h-12 rounded-(--radius-card) px-8 transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
      >
        {pending ? "Publicando…" : "Publicar"}
      </button>
      {pendingUploads ? (
        <span className="text-fg-muted/70 text-xs">Espere a que terminen de subir los archivos.</span>
      ) : null}
    </div>
  );
}

function PlusGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-fg-muted/60 h-9 w-9"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
