"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

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

const initial: PublishState = { status: "idle" };

export function PublishForm({
  listingId,
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
  readonly verticals: readonly VerticalOption[];
  readonly categories: readonly CategoryOption[];
  readonly currencies: readonly string[];
  readonly countries: readonly { readonly value: string; readonly label: string }[];
}) {
  const [state, action] = useActionState(publishListing, initial);

  const [vertical, setVertical] = useState(verticals[0]?.value ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [priceMode, setPriceMode] = useState<"fixed" | "on_request">("fixed");
  const [files, setFiles] = useState<FileState[]>([]);
  const [uploading, setUploading] = useState(false);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.vertical === vertical),
    [categories, vertical],
  );

  const category = categories.find((c) => c.id === categoryId);
  const ready = files.filter((f) => f.status === "listo");
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

  async function onPick(picked: FileList | null) {
    if (!picked || picked.length === 0) return;

    const next: FileState[] = [...picked].map((file) => ({
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
      <Group title="Dónde va">
        <Field label="Sección">
          <select
            name="vertical"
            value={vertical}
            onChange={(e) => {
              setVertical(e.target.value);
              setCategoryId("");
            }}
            className={control}
          >
            {verticals.map((v) => (
              <option key={v.value} value={v.value} className="bg-surface-raised">
                {v.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Categoría">
          <select
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className={control}
          >
            <option value="" className="bg-surface-raised">
              Elija una categoría
            </option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-surface-raised">
                {c.name}
              </option>
            ))}
          </select>
        </Field>
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
        <Group title={`Datos de ${category.name.toLowerCase()}`}>
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
          <select name="currency" defaultValue="USD" className={control}>
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

        <Field label="País">
          <select name="country" defaultValue="CO" className={control}>
            {countries.map((c) => (
              <option key={c.value} value={c.value} className="bg-surface-raised">
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ciudad">
          <input name="city" className={control} />
        </Field>
      </Group>

      {/* --- Medios ----------------------------------------------------------- */}
      <Group title="Fotos y vídeo">
        <div className="sm:col-span-2 flex flex-col gap-4">
          <label className="eyebrow border-line text-fg-muted hover:border-fg-muted/60 hover:text-fg w-fit cursor-pointer rounded-(--radius-card) border px-4 py-2.5 text-[0.5rem] transition-colors">
            Elegir archivos
            {/* Sin `name`: si lo tuviera, los archivos entrarían en el FormData
                y la petición reventaría el límite de 1 MB. */}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/quicktime"
              onChange={(e) => void onPick(e.target.files)}
              className="sr-only"
            />
          </label>

          <p className="text-fg-muted/60 text-xs">
            Hasta 10 MB por foto y 100 MB por vídeo. La primera imagen es la portada.
          </p>

          {files.length > 0 ? (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {files.map((f) => (
                <li key={f.id} className="flex flex-col gap-1.5">
                  <div className="border-line bg-surface-sunken relative aspect-square overflow-hidden rounded-(--radius-card) border">
                    {f.file.type.startsWith("video/") ? (
                      <video src={f.preview} className="h-full w-full object-cover" muted />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.preview} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
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
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Group>

      <Submit disabled={uploading || pending} pendingUploads={pending} />
    </form>
  );
}

const control =
  "border-line text-fg placeholder:text-fg-muted/40 focus-visible:border-accent h-11 w-full rounded-(--radius-card) border bg-transparent px-3 text-sm outline-none transition-colors";

function Group({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="eyebrow text-accent mb-3 text-[0.5625rem]">{title}</legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
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
}: {
  readonly disabled: boolean;
  readonly pendingUploads: boolean;
}) {
  const { pending } = useFormStatus();
  const blocked = disabled || pending;

  return (
    <div className="border-line-soft flex items-center gap-4 border-t pt-6">
      <button
        type="submit"
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
