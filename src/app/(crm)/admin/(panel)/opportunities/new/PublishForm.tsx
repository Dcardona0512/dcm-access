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

export type VerticalOption = { readonly value: string; readonly label: string };

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
  verticals,
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
  readonly verticals: readonly VerticalOption[];
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
  const [priceMode, setPriceMode] = useState<"fixed" | "on_request">("fixed");
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
            className="eyebrow border-accent/50 text-accent hover:bg-accent/10 rounded-(--radius-card) border px-3 py-2 text-[0.5rem] transition-colors"
          >
            Ver la ficha
          </Link>
          <Link
            href="/admin/opportunities/new"
            className="eyebrow border-line text-fg-muted hover:text-fg rounded-(--radius-card) border px-3 py-2 text-[0.5rem] transition-colors"
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
                      <span className="eyebrow bg-surface/85 text-accent absolute top-2 left-2 rounded-(--radius-card) px-2 py-1 text-[0.5rem] backdrop-blur-sm">
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
                      className={`eyebrow text-[0.5rem] ${
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

      <Group title="Dónde va">
        <Field label="Sección">
          <p className="border-line-soft text-fg-muted flex h-11 items-center rounded-(--radius-card) border border-dashed px-3 text-sm">
            {verticals.find((v) => v.value === vertical)?.label ?? vertical}
          </p>
        </Field>

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
      </Group>

      {/* --- Texto ------------------------------------------------------------ */}
      <Group title="La ficha">
        <Field label="Título" full>
          <input name="title" required minLength={3} className={control} />
        </Field>
        <Field label="Resumen" full>
          <input name="summary" className={control} />
        </Field>
        <Field label="Descripción" full>
          <textarea name="description" rows={5} className={`${control} h-auto py-3`} />
        </Field>
      </Group>

      {/* --- Atributos de la categoría elegida -------------------------------- */}
      {category && category.attributes.length > 0 ? (
        <Group title="Datos de la ficha">
          {category.attributes.map((attr) => (
            <Field key={attr.key} label={attr.unit ? `${attr.label} (${attr.unit})` : attr.label}>
              {attr.options && attr.options.length > 0 ? (
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
                  className={control}
                />
              )}
            </Field>
          ))}
        </Group>
      ) : null}

      {/* --- Precio y ubicación ----------------------------------------------- */}
      <Group title="Precio y ubicación">
        <Field label="Precio">
          <select
            name="priceMode"
            value={priceMode}
            onChange={(e) => setPriceMode(e.target.value as "fixed" | "on_request")}
            className={control}
          >
            <option value="fixed" className="bg-surface-raised">
              Mostrar importe
            </option>
            <option value="on_request" className="bg-surface-raised">
              A consultar
            </option>
          </select>
        </Field>

        {priceMode === "fixed" ? (
          <Field label="Importe">
            <input name="priceAmount" inputMode="numeric" className={control} />
          </Field>
        ) : null}

        <Field label="Moneda">
          {/* COP por defecto: la mayoría del inventario está en Colombia. Las
              demás siguen ahí para lo que se publica fuera. */}
          <select name="currency" defaultValue="COP" className={control}>
            {currencies.map((c) => (
              <option key={c} value={c} className="bg-surface-raised">
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Operación">
          <select name="listingType" defaultValue="sale" className={control}>
            <option value="sale" className="bg-surface-raised">Venta</option>
            <option value="rent" className="bg-surface-raised">Alquiler</option>
            <option value="lease" className="bg-surface-raised">Leasing</option>
            <option value="charter" className="bg-surface-raised">Chárter</option>
            <option value="service" className="bg-surface-raised">Servicio</option>
            <option value="opportunity" className="bg-surface-raised">Oportunidad</option>
          </select>
        </Field>

        <PlacePicker countries={countries} onChange={setPlace} />
      </Group>

      {/* --- Etiquetas y referencia interna --------------------------------- */}
      <Group title="Extras">
        <Field label="Etiquetas" full>
          <TagsInput onChange={setTags} />
        </Field>

        <Field label="SKU" full>
          <input name="sku" className={control} />
          <span className="text-fg-muted/60 text-xs">
            Su referencia interna. Opcional, y no se muestra en ninguna página pública.
          </span>
        </Field>
      </Group>

      {/* --- Medios ----------------------------------------------------------- */}
      {/*
        El mapa va al FINAL y es opcional: el país, el departamento y la ciudad
        ya quedaron fijados arriba con los desplegables, que es lo que de verdad
        se publica. Esto solo afina el punto exacto, que se guarda para uso
        interno y nunca se muestra.
      */}
      <Group title="Punto en el mapa" wide>
        <LocationPicker
          center={place.lat && place.lng ? { lat: place.lat, lng: place.lng } : null}
          onChange={(picked) => setPoint({ lat: picked.lat, lng: picked.lng })}
        />
      </Group>

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

const control =
  "border-line text-fg placeholder:text-fg-muted/40 focus-visible:border-accent h-11 w-full rounded-(--radius-card) border bg-transparent px-3 text-sm outline-none transition-colors";

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
      <legend className="eyebrow text-accent mb-3 text-[0.5625rem]">{title}</legend>
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
      <span className="eyebrow text-fg-muted text-[0.5625rem]">{label}</span>
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
