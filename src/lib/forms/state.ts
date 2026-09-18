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
  /**
   * Enlace de WhatsApp con el que seguir la conversación, cuando se pidió por
   * ahí. Lo arma el servidor —nunca el navegador— y llega solo después de que
   * el lead esté guardado: ese es el orden que garantiza que los datos queden
   * aunque la persona cierre WhatsApp sin escribir.
   */
  readonly whatsapp?: string;
  /**
   * Lo que la persona había escrito, para devolvérselo cuando algo falla.
   *
   * No es un lujo: un formulario enviado a una acción se reinicia al volver la
   * respuesta, igual que uno nativo. Sin esto, olvidar la casilla de
   * autorización borraba el nombre, el teléfono, el correo y el mensaje, y
   * había que escribirlo todo otra vez para arreglar un clic.
   */
  readonly values?: Readonly<Record<string, string>>;
};

export const initialFormState: FormState = { status: "idle" };
