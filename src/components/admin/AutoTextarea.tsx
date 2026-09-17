"use client";

import { useCallback, useEffect, useRef } from "react";

/* ============================================================================
   CAMPO DE TEXTO QUE CRECE
   ----------------------------------------------------------------------------
   Una descripción de un carro son veinte renglones —kilometraje, SOAT,
   impuestos, extras, estado de las llantas— y en una caja de cinco se lee por
   una rendija: para revisar lo que uno escribió hay que hacer scroll DENTRO de
   un campo que a su vez está dentro de una página con scroll. Dos barras
   anidadas es la forma más rápida de perderse en un formulario.

   Aquí la caja se ajusta a su contenido y la única barra que queda es la de la
   página.
   ========================================================================== */

export function AutoTextarea({
  name,
  defaultValue,
  minRows = 5,
  className,
}: {
  readonly name: string;
  readonly defaultValue?: string;
  /** Alto mínimo cuando está vacío, para que no nazca como una sola línea. */
  readonly minRows?: number;
  readonly className?: string;
}) {
  const campo = useRef<HTMLTextAreaElement>(null);

  /**
   * `auto` antes de medir, y no es prescindible: `scrollHeight` nunca baja de
   * la altura ya fijada, así que sin reiniciarla la caja crecería al escribir
   * y jamás encogería al borrar.
   */
  const ajustar = useCallback(() => {
    const el = campo.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Al montar: es cuando llega el texto que ya tenía la ficha al editarla.
  useEffect(ajustar, [ajustar]);

  return (
    <textarea
      ref={campo}
      name={name}
      defaultValue={defaultValue}
      rows={minRows}
      onInput={ajustar}
      // Sin barra propia —la altura ya da para todo— y sin tirador: arrastrarlo
      // pelearía con el alto que calcula el componente.
      className={`resize-none overflow-hidden ${className ?? ""}`}
    />
  );
}
