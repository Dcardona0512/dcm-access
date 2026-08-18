/**
 * Estado compartido de los formularios.
 *
 * Los mensajes llegan ya traducidos desde el servidor: la acción recibe el
 * locale en un campo oculto y resuelve el diccionario allí. Así el componente
 * cliente no necesita conocer el catálogo de errores, y un mensaje nuevo no
 * obliga a tocar la UI.
 */
export type FormState = {
  readonly status: "idle" | "success" | "error";
  /** Errores por nombre de campo, ya traducidos. */
  readonly errors?: Readonly<Record<string, string>>;
  /** Error global, ya traducido. */
  readonly message?: string;
  /** Referencia interna del lead creado, para mostrarla en la confirmación. */
  readonly reference?: string;
};

export const initialFormState: FormState = { status: "idle" };
