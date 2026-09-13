"use client";

import { useState } from "react";

/**
 * Etiquetas libres, con tope.
 *
 * El tope no es decorativo: veinte etiquetas ya es más de lo que nadie lee, y
 * sin límite un anuncio acaba con cincuenta palabras sueltas puestas para
 * aparecer en toda búsqueda. Se normalizan a minúsculas y se descartan las
 * repetidas, porque "Blindado" y "blindado" son la misma etiqueta.
 */
export function TagsInput({
  max = 20,
  onChange,
}: {
  readonly max?: number;
  readonly onChange: (tags: readonly string[]) => void;
}) {
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const value = raw.trim().toLowerCase().replace(/\s+/g, " ");
    if (!value) return;
    if (tags.includes(value) || tags.length >= max) {
      setDraft("");
      return;
    }

    const next = [...tags, value];
    setTags(next);
    setDraft("");
    onChange(next);
  }

  function remove(value: string) {
    const next = tags.filter((tag) => tag !== value);
    setTags(next);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          // Enter y coma confirman. `preventDefault` en Enter es obligatorio:
          // dentro de un formulario, Enter lo envía.
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit(draft);
          } else if (event.key === "Backspace" && !draft && tags.length > 0) {
            remove(tags[tags.length - 1]);
          }
        }}
        onBlur={() => commit(draft)}
        disabled={tags.length >= max}
        placeholder={tags.length >= max ? `Límite de ${max} etiquetas` : "Escriba y pulse Enter"}
        className="border-line text-fg placeholder:text-fg-muted/40 focus-visible:border-accent h-11 w-full rounded-(--radius-card) border bg-transparent px-3 text-sm outline-none transition-colors disabled:opacity-50"
      />

      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onClick={() => remove(tag)}
                className="border-line text-fg-muted hover:border-danger/50 hover:text-danger inline-flex items-center gap-2 rounded-(--radius-card) border px-2.5 py-1.5 text-xs transition-colors"
              >
                {tag}
                <span aria-hidden="true">×</span>
                <span className="sr-only">Quitar</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-fg-muted/60 text-xs">
        {tags.length} de {max}. Opcional.
      </p>
    </div>
  );
}
