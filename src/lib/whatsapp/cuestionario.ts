import { verticalLabels } from "@/lib/domain/labels";
import { localized, type AttributeDef, type Category, type Vertical } from "@/lib/domain/types";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

/* ============================================================================
   EL CUESTIONARIO DE CADA CATEGORÍA
   ----------------------------------------------------------------------------
   SALE DEL MISMO SITIO QUE EL FORMULARIO DEL PANEL: el `attributeSchema` de la
   categoría. Escribir las preguntas a mano en otro archivo habría garantizado
   que el día que se añada un campo, el cuestionario se quede corto y nadie se
   entere hasta que falte el dato en una ficha ya publicada.

   Se usa en dos sitios con el mismo texto: la pantalla del panel donde se
   copian para pegarlos en WhatsApp, y —cuando llegue— el bot, que hará estas
   mismas preguntas una a una.
   ========================================================================== */

export type Pregunta = {
  readonly key: string;
  readonly texto: string;
  /** Lo que se espera de vuelta, para quien responde y para validar después. */
  readonly ayuda?: string;
  readonly opciones?: readonly string[];
  readonly tipo: AttributeDef["type"];
};

/** Las preguntas fijas, las que no dependen de la categoría. */
function comunes(locale: Locale): readonly Pregunta[] {
  const es = locale === "es";

  return [
    {
      key: "title",
      tipo: "text",
      texto: es ? "¿Qué vende? (una línea)" : "What are you selling? (one line)",
      ayuda: es ? "Ej.: Mazda CX-5 Touring 2025" : "E.g. Mazda CX-5 Touring 2025",
    },
    {
      key: "price",
      tipo: "number",
      texto: es ? "¿Precio en el que lo tiene?" : "Asking price?",
      ayuda: es ? "En pesos o en dólares, dígalo" : "In pesos or dollars, say which",
    },
    {
      key: "city",
      tipo: "text",
      texto: es ? "¿En qué ciudad está?" : "Which city is it in?",
    },
    {
      key: "description",
      tipo: "text",
      texto: es ? "Cuéntenos lo que un comprador debe saber" : "Tell us what a buyer should know",
      ayuda: es
        ? "Estado, mantenimientos, papeles, lo bueno y lo que no"
        : "Condition, servicing, paperwork, the good and the bad",
    },
  ];
}

/** Lo que se pide al final, igual en todas las categorías. */
function cierre(locale: Locale): readonly Pregunta[] {
  const es = locale === "es";

  return [
    {
      key: "media",
      tipo: "text",
      texto: es ? "Mándenos las fotos por aquí" : "Send us the photos here",
      ayuda: es
        ? "Entre seis y doce, con luz de día y sin filtros"
        : "Six to twelve, in daylight and unfiltered",
    },
    {
      key: "seller",
      tipo: "text",
      texto: es ? "¿A nombre de quién queda?" : "Whose name does it go under?",
      ayuda: es ? "Nombre y un correo de contacto" : "Name and a contact email",
    },
  ];
}

/**
 * Un atributo del esquema, convertido en pregunta.
 *
 * Los de opciones llegan con su lista porque en WhatsApp se responden eligiendo
 * y no escribiendo: preguntar «¿estado?» a campo abierto devuelve veinte
 * redacciones distintas de lo mismo.
 */
function desdeAtributo(def: AttributeDef, locale: Locale): Pregunta {
  const etiqueta = localized(def.label, locale);
  const unidad = def.unit ? ` (${def.unit})` : "";

  return {
    key: def.key,
    tipo: def.type,
    texto: `${etiqueta}${unidad}`,
    opciones: def.options?.map((opcion) => localized(opcion.label, locale)),
  };
}

export type CuestionarioCategoria = {
  readonly vertical: Vertical;
  readonly categoryId: string;
  readonly titulo: string;
  /** Lo que hace falta sí o sí para poder publicar. */
  readonly preguntas: readonly Pregunta[];
  /** Lo que mejora la ficha si lo tienen a mano. Se pregunta después. */
  readonly opcionales: readonly Pregunta[];
};

/**
 * DOS BLOQUES, Y ESA ES LA DECISIÓN QUE HACE QUE ESTO FUNCIONE.
 *
 * El esquema de inmobiliaria tiene dieciséis campos; con los comunes y el
 * cierre salen veintidós preguntas seguidas, y eso por WhatsApp no lo contesta
 * nadie: se abandona a la quinta.
 *
 * Se parte por un criterio que ya está en el propio esquema: es esencial lo que
 * el catálogo usa para BUSCAR (`facet`) y lo que aparece en la tarjeta y en la
 * cabecera de la ficha (`highlight`). Sin esos campos la ficha no se puede ni
 * filtrar ni presentar. El resto afina, y se pregunta después a quien esté
 * dispuesto a seguir.
 */
export function cuestionarioDe(
  categoria: Category,
  locale: Locale = defaultLocale,
): CuestionarioCategoria {
  return {
    vertical: categoria.vertical,
    categoryId: categoria.id,
    titulo: `${localized(verticalLabels[categoria.vertical], locale)} · ${localized(categoria.name, locale)}`,
    preguntas: [
      ...comunes(locale),
      ...categoria.attributeSchema
        .filter((def) => def.facet || def.highlight)
        .map((def) => desdeAtributo(def, locale)),
      ...cierre(locale),
    ],
    opcionales: categoria.attributeSchema
      .filter((def) => !def.facet && !def.highlight)
      .map((def) => desdeAtributo(def, locale)),
  };
}

/**
 * El cuestionario en texto plano, listo para pegar en WhatsApp.
 *
 * Numerado, porque quien responde desde el móvil contesta «1. …, 2. …» y así
 * no hay que adivinar a qué pregunta corresponde cada línea.
 */
export function comoTexto(cuestionario: CuestionarioCategoria, locale: Locale): string {
  const es = locale === "es";

  const linea = (pregunta: Pregunta, indice: number) => {
    const numero = `${indice + 1}. ${pregunta.texto}`;

    if (pregunta.opciones && pregunta.opciones.length > 0) {
      return `${numero} — ${pregunta.opciones.join(" / ")}`;
    }

    return pregunta.ayuda ? `${numero} — ${pregunta.ayuda}` : numero;
  };

  const bloques = [
    es ? "Para publicarlo necesitamos esto:" : "To list it we need the following:",
    "",
    ...cuestionario.preguntas.map(linea),
  ];

  if (cuestionario.opcionales.length > 0) {
    bloques.push(
      "",
      es ? "Y si lo tiene a mano:" : "And if you have it handy:",
      "",
      ...cuestionario.opcionales.map(linea),
    );
  }

  return bloques.join("\n");
}
