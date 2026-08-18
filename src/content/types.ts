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
  | "opportunities"
  | "real-estate"
  | "motors"
  | "aviation"
  | "private-services"
  | "business"
  | "private"
  | "brokerage"
  | "partners"
  | "about"
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
    /** Los tres ejes, separados por bullets. Acompaña al logo. */
    readonly descriptor: string;
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
    readonly requestAccess: string;
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
      readonly eyebrow: string;
      readonly lede: string;
      readonly primaryCta: string;
      readonly secondaryCta: string;
      readonly scrollHint: string;
    };
    readonly search: {
      readonly heading: string;
      readonly label: string;
      readonly placeholder: string;
      readonly categoryLabel: string;
      readonly anyCategory: string;
      readonly action: string;
    };
    readonly verticals: {
      readonly eyebrow: string;
      readonly heading: string;
      readonly lede: string;
    };
    readonly selected: {
      readonly eyebrow: string;
      readonly heading: string;
      readonly lede: string;
      readonly cta: string;
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
    readonly privateTeaser: {
      readonly eyebrow: string;
      readonly heading: string;
      readonly lede: string;
      readonly cta: string;
    };
    readonly partnerTeaser: {
      readonly eyebrow: string;
      readonly heading: string;
      readonly lede: string;
      readonly cta: string;
    };
  };

  readonly verticals: {
    readonly "real-estate": VerticalCopy;
    readonly motors: VerticalCopy;
    readonly aviation: VerticalCopy;
    readonly "private-services": VerticalCopy;
    readonly business: VerticalCopy;
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

  readonly privateAccess: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly statement: string;
    readonly lede: string;
    readonly includes: readonly string[];
    readonly cta: string;
    readonly offMarketHeading: string;
    readonly offMarketLede: string;
    readonly discretionHeading: string;
    readonly discretionBody: string;
  };

  readonly privateRequest: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly lede: string;
    readonly examplesHeading: string;
    readonly examples: readonly string[];
    readonly fields: {
      readonly what: FieldCopy;
      readonly vertical: FieldCopy;
      readonly location: FieldCopy;
      readonly budget: FieldCopy;
      readonly currency: FieldCopy;
      readonly timeline: FieldCopy;
      readonly requirements: FieldCopy;
      readonly name: FieldCopy;
      readonly email: FieldCopy;
      readonly phone: FieldCopy;
      readonly contactMethod: FieldCopy;
      readonly confidentiality: FieldCopy;
    };
    readonly timelineOptions: readonly { readonly value: string; readonly label: string }[];
    readonly contactOptions: readonly { readonly value: string; readonly label: string }[];
    readonly confidentialityOptions: readonly {
      readonly value: string;
      readonly label: string;
      readonly description: string;
    }[];
    readonly submit: string;
    readonly successHeading: string;
    readonly successBody: string;
    readonly consent: string;
  };

  readonly brokerage: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly statement: string;
    readonly lede: string;
    readonly steps: readonly ProcessStep[];
    readonly scopeHeading: string;
    readonly scopeBody: string;
    readonly cta: string;
  };

  readonly partners: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly lede: string;
    readonly benefitsHeading: string;
    readonly benefits: readonly Pillar[];
    readonly whoHeading: string;
    readonly who: readonly string[];
    readonly curationHeading: string;
    readonly curationBody: string;
    readonly cta: string;
    readonly directoryHeading: string;
    readonly directoryLede: string;
    readonly directoryEmpty: string;
  };

  readonly partnerApply: {
    readonly heading: string;
    readonly lede: string;
    readonly steps: readonly string[];
    readonly fields: {
      readonly company: FieldCopy;
      readonly country: FieldCopy;
      readonly city: FieldCopy;
      readonly verticals: FieldCopy;
      readonly services: FieldCopy;
      readonly website: FieldCopy;
      readonly email: FieldCopy;
      readonly phone: FieldCopy;
      readonly description: FieldCopy;
      readonly operatingAreas: FieldCopy;
      readonly commercialInfo: FieldCopy;
      readonly certifications: FieldCopy;
      readonly licences: FieldCopy;
      readonly documentation: FieldCopy;
    };
    readonly reviewNotice: string;
    readonly submit: string;
    readonly successHeading: string;
    readonly successBody: string;
  };

  readonly provider: {
    readonly about: string;
    readonly services: string;
    readonly coverage: string;
    readonly certifications: string;
    readonly openOpportunities: string;
    readonly contact: string;
    readonly verificationHeading: string;
    readonly verificationBody: string;
  };

  readonly about: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly lede: string;
    readonly originHeading: string;
    readonly originBody: readonly string[];
    readonly modelHeading: string;
    readonly modelBody: readonly string[];
    readonly principlesHeading: string;
    readonly principles: readonly Pillar[];
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

  readonly account: {
    readonly heading: string;
    readonly lede: string;
    readonly nav: {
      readonly overview: string;
      readonly favorites: string;
      readonly requests: string;
      readonly messages: string;
      readonly profile: string;
    };
    readonly empty: {
      readonly favorites: string;
      readonly requests: string;
      readonly messages: string;
    };
    readonly demoSession: string;
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
    readonly companyHeading: string;
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
