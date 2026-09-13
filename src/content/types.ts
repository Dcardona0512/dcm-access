/**
 * Contrato de contenido.
 *
 * `es.ts` y `en.ts` implementan esta misma interfaz, así que el compilador
 * impide que un idioma se quede atrás cuando el otro crece.
 *
 * TODO el texto visible vive aquí, incluido el léxico de marca: eslogan,
 * descriptor, navegación, nombres de las verticales y etiquetas. En español
 * se lee todo en español y en inglés todo en inglés, sin mezcla. Lo único
 * invariante es el NOMBRE, "DCM ACCESS", que está en `shared.ts` porque un
 * nombre propio no se traduce.
 */

/** Claves de navegación. La ruta vive en `shared.ts`; la etiqueta, aquí. */
export type NavKey =
  | "real-estate"
  | "motors"
  | "aviation"
  | "servicios"
  | "negocios"
  | "contact";

export type RegionKey = "latam" | "north-america" | "europe" | "middle-east" | "other";

export type Pillar = {
  readonly key: string;
  readonly title: string;
  readonly body: string;
};

export type ProcessStep = {
  readonly number: string;
  readonly key: string;
  readonly title: string;
  readonly body: string;
};

export type VerticalCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly lede: string;
  /** Frase corta para la tarjeta de la home. */
  readonly teaser: string;
  /** Lo que el cliente puede pedir en esta vertical (§3). */
  readonly offerings: readonly string[];
  /**
   * Encuadre regulatorio. Obligatorio en aviación y servicios privados (§3, §26):
   * el servicio lo presta un tercero habilitado, no DCM ACCESS.
   */
  readonly compliance?: string;
};

export type FieldCopy = {
  readonly label: string;
  readonly placeholder?: string;
  readonly hint?: string;
};

export type Dictionary = {
  readonly meta: {
    readonly siteDescription: string;
    readonly homeTitle: string;
  };

  /** Léxico de marca traducido. El nombre "DCM ACCESS" nunca se traduce. */
  readonly brand: {
    /** Eslogan principal, en versalitas. */
    readonly tagline: string;
    /** Variante para el pie y las imágenes sociales. */
    readonly signature: string;
  };

  /** Etiquetas de navegación, indexadas por la misma clave que las rutas. */
  readonly navLabels: Record<NavKey, string>;

  /** Nombres de las regiones de la red (§35). */
  readonly regions: Record<RegionKey, string>;

  /** Distintivos que se pintan sobre las tarjetas y las fichas. */
  readonly tags: {
    readonly selected: string;
    readonly private: string;
    readonly reserved: string;
  };

  readonly common: {
    readonly explore: string;
    readonly viewOpportunity: string;
    readonly requestDetails: string;
    readonly contactBroker: string;
    readonly privateRequest: string;
    readonly sell: string;
    /** Mensaje que se abre redactado en WhatsApp. */
    readonly sellMessage: string;
    readonly learnMore: string;
    readonly back: string;
    readonly submit: string;
    readonly submitting: string;
    readonly continue: string;
    readonly previous: string;
    readonly close: string;
    readonly priceOnRequest: string;
    readonly from: string;
    readonly optional: string;
    readonly required: string;
    readonly loading: string;
    readonly language: string;
    readonly skipToContent: string;
    readonly menu: string;
    readonly demoNotice: string;
  };

  readonly nav: {
    readonly primaryLabel: string;
    readonly verticalsLabel: string;
    readonly openMenu: string;
    readonly closeMenu: string;
  };

  readonly home: {
    readonly hero: {
      readonly lede: string;
      readonly scrollHint: string;
    };

    readonly verticals: {
      readonly eyebrow: string;
      readonly heading: string;
      readonly lede: string;
    };

    readonly why: {
      readonly eyebrow: string;
      readonly heading: string;
      readonly pillars: readonly Pillar[];
    };
    readonly process: {
      readonly eyebrow: string;
      readonly heading: string;
      readonly lede: string;
      readonly cta: string;
    };
    readonly network: {
      readonly eyebrow: string;
      readonly heading: string;
      readonly lede: string;
      readonly disclaimer: string;
      readonly regions: readonly { readonly key: string; readonly note: string }[];
    };

  };

  readonly verticals: {
    readonly "real-estate": VerticalCopy;
    readonly motors: VerticalCopy;
    readonly aviation: VerticalCopy;
    readonly servicios: VerticalCopy;
    readonly negocios: VerticalCopy;
  };

  /**
   * Marketplace de vehículos.
   *
   * Bloque propio y no dentro de `verticals.motors`, porque `VerticalCopy` lo
   * comparten las cinco verticales: meter aquí las claves del marketplace
   * obligaría a inmobiliaria, aviación, servicios privados y negocios a
   * inventarse un formulario de venta que nunca van a renderizar.
   */
  readonly motorsMarket: {
    readonly eyebrow: string;
    readonly heading: string;
    /** Invitación a bajar: el vídeo es la primera impresión, la parrilla la segunda. */
    readonly scrollCue: string;
    readonly sellCta: string;
    readonly searchCta: string;
    /** Encabezado de la prosa reubicada bajo la parrilla. */
    readonly offeringsHeading: string;
    readonly filters: {
      readonly legend: string;
      readonly queryLabel: string;
      readonly queryPlaceholder: string;
      readonly make: string;
      readonly year: string;
      readonly yearFrom: string;
      readonly yearTo: string;
      readonly priceFrom: string;
      readonly priceTo: string;
      readonly kmMax: string;
      readonly city: string;
      readonly category: string;
    };
    readonly card: {
      readonly video: string;
      readonly km: string;
    };
    readonly sell: {
      readonly eyebrow: string;
      readonly title: string;
      readonly lede: string;
      /** Qué pasa tras enviar. Se dice ANTES de enviar, no solo en el éxito. */
      readonly reviewNote: string;
      readonly sections: {
        readonly vehicle: string;
        readonly price: string;
        readonly place: string;
        readonly media: string;
        readonly seller: string;
      };
      readonly fields: {
        readonly category: FieldCopy;
        readonly make: FieldCopy;
        readonly model: FieldCopy;
        readonly year: FieldCopy;
        readonly mileage: FieldCopy;
        readonly fuel: FieldCopy;
        readonly transmission: FieldCopy;
        readonly condition: FieldCopy;
        readonly priceMode: FieldCopy;
        readonly priceAmount: FieldCopy;
        readonly currency: FieldCopy;
        readonly country: FieldCopy;
        readonly city: FieldCopy;
        readonly description: FieldCopy;
        readonly name: FieldCopy;
        readonly email: FieldCopy;
        readonly phone: FieldCopy;
      };
      readonly priceModes: {
        readonly fixed: string;
        readonly onRequest: string;
      };
      readonly media: {
        readonly label: string;
        readonly hint: string;
        readonly add: string;
        readonly remove: string;
        readonly uploading: string;
        readonly uploaded: string;
        readonly failed: string;
        readonly retry: string;
        readonly tooMany: string;
        readonly tooLarge: string;
        readonly badType: string;
        readonly pending: string;
      };
      readonly consent: string;
      readonly submit: string;
      readonly successHeading: string;
      readonly successBody: string;
    };
  };

  readonly catalog: {
    readonly title: string;
    readonly lede: string;
    readonly resultsOne: string;
    readonly resultsMany: string;
    readonly filters: string;
    readonly clearFilters: string;
    readonly applyFilters: string;
    readonly sortLabel: string;
    readonly sort: {
      readonly relevance: string;
      readonly newest: string;
      readonly priceAsc: string;
      readonly priceDesc: string;
    };
    readonly facets: {
      readonly vertical: string;
      readonly category: string;
      readonly country: string;
      readonly city: string;
      readonly listingType: string;
      readonly currency: string;
      readonly priceRange: string;
      readonly minPrice: string;
      readonly maxPrice: string;
      readonly any: string;
    };
    readonly empty: {
      readonly heading: string;
      readonly body: string;
      readonly cta: string;
    };
  };

  readonly opportunity: {
    readonly overview: string;
    readonly specifications: string;
    readonly location: string;
    readonly provider: string;
    readonly availability: string;
    readonly reference: string;
    readonly published: string;
    readonly verifiedLabel: string;
    readonly unverifiedLabel: string;
    readonly pendingLabel: string;
    readonly inquiryHeading: string;
    readonly inquiryLede: string;
    readonly related: string;
    readonly confidentialHeading: string;
    readonly confidentialBody: string;
  };

  /**
   * El proceso de intermediación. La página `/brokerage` ya no existe, pero
   * las etapas siguen siendo el contenido de la sección de proceso de la
   * portada, así que el bloque se queda reducido a ellas.
   */
  readonly brokerage: {
    readonly steps: readonly ProcessStep[];
  };

  readonly contact: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly lede: string;
    readonly fields: {
      readonly name: FieldCopy;
      readonly email: FieldCopy;
      readonly phone: FieldCopy;
      readonly subject: FieldCopy;
      readonly message: FieldCopy;
    };
    readonly submit: string;
    readonly successHeading: string;
    readonly successBody: string;
  };

  readonly inquiry: {
    readonly heading: string;
    readonly fields: {
      readonly name: FieldCopy;
      readonly email: FieldCopy;
      readonly phone: FieldCopy;
      readonly message: FieldCopy;
    };
    readonly submit: string;
    readonly successHeading: string;
    readonly successBody: string;
  };

  readonly legal: {
    readonly heading: string;
    readonly lede: string;
    readonly lastUpdated: string;
    readonly draftNotice: string;
    readonly documents: readonly {
      readonly slug: string;
      readonly title: string;
      readonly summary: string;
      readonly sections: readonly { readonly heading: string; readonly body: string }[];
    }[];
  };

  readonly footer: {
    readonly tagline: string;
    readonly exploreHeading: string;
    readonly legalHeading: string;
    readonly contactHeading: string;
    readonly rights: string;
    readonly disclaimer: string;
    readonly reportHeading: string;
    readonly reportBody: string;
  };

  readonly errors: {
    readonly required: string;
    readonly email: string;
    readonly minLength: string;
    readonly maxLength: string;
    readonly url: string;
    readonly number: string;
    readonly selectOne: string;
    readonly consent: string;
    readonly rateLimited: string;
    readonly generic: string;
    readonly notFoundHeading: string;
    readonly notFoundBody: string;
    readonly notFoundCta: string;
  };
};
