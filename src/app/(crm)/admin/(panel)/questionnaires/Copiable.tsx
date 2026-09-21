"use client";

import { useState } from "react";

/**
 * El cuestionario a la vista y un botón que lo copia.
 *
 * A la vista y no escondido tras el botón: antes de pegarle a alguien veinte
 * preguntas conviene leerlas, y si sobra alguna se borra en el propio chat.
 */
export function Copiable({ texto }: { readonly texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin portapapeles queda el texto seleccionable, que es el respaldo.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <pre className="bg-surface-sunken text-fg-muted max-h-72 overflow-auto rounded-(--radius-card) p-4 text-xs leading-relaxed whitespace-pre-wrap">
        {texto}
      </pre>

      <button
        type="button"
        onClick={copiar}
        className="eyebrow border-accent/60 text-accent hover:bg-accent hover:text-surface w-fit cursor-pointer rounded-(--radius-card) border px-4 py-2 text-[0.7rem] transition-colors"
      >
        {copiado ? "Copiado" : "Copiar para WhatsApp"}
      </button>
    </div>
  );
}
