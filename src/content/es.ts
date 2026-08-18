import type { Dictionary } from "./types";

/**
 * Español. El registro es el de §4 y §32: nunca "vendemos", siempre
 * "encontramos", "conectamos", "damos acceso". Ni una palabra de urgencia
 * comercial — una marca premium transmite calma, no prisa.
 */
export const es: Dictionary = {
  meta: {
    siteDescription:
      "DCM ACCESS conecta clientes con activos globales, servicios premium y oportunidades seleccionadas a través de una red privada de intermediación.",
    homeTitle: "Acceso a oportunidades exclusivas",
  },

  brand: {
    tagline: "ACCESO A OPORTUNIDADES EXCLUSIVAS",
    descriptor: "Activos globales • Servicios premium • Oportunidades exclusivas",
    signature: "Activos globales • Servicios premium • Intermediación privada",
  },

  navLabels: {
    opportunities: "Oportunidades",
    "real-estate": "Inmobiliario",
    motors: "Vehículos",
    aviation: "Aviación",
    "private-services": "Servicios privados",
    business: "Negocios",
    private: "Acceso privado",
    brokerage: "Intermediación",
    partners: "Sea socio",
    about: "Nosotros",
    contact: "Contacto",
  },

  regions: {
    latam: "Latinoamérica",
    "north-america": "Norteamérica",
    europe: "Europa",
    "middle-east": "Oriente Medio",
    other: "Otros mercados",
  },

  tags: {
    selected: "Selección",
    private: "Privada",
    reserved: "Reservada",
  },

  common: {
    explore: "Explorar",
    viewOpportunity: "Ver oportunidad",
    requestDetails: "Solicitar detalles",
    contactBroker: "Contactar con un asesor",
    privateRequest: "Solicitud privada",
    requestAccess: "Solicitar acceso",
    learnMore: "Conocer más",
    back: "Volver",
    submit: "Enviar",
    submitting: "Enviando…",
    continue: "Continuar",
    previous: "Anterior",
    close: "Cerrar",
    priceOnRequest: "Precio a consultar",
    from: "Desde",
    optional: "opcional",
    required: "obligatorio",
    loading: "Cargando…",
    language: "Idioma",
    skipToContent: "Ir al contenido principal",
    menu: "Menú",
    demoNotice:
      "Contenido de demostración. Las oportunidades, proveedores y cifras que ve son ejemplos para evaluar la plataforma, no ofertas reales.",
  },

  nav: {
    primaryLabel: "Navegación principal",
    verticalsLabel: "Categorías",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },

  home: {
    hero: {
      eyebrow: "Activos globales • Servicios premium • Oportunidades exclusivas",
      lede: "Activos globales, servicios premium y oportunidades cuidadosamente seleccionadas, conectadas a través de una red de intermediación.",
      primaryCta: "Explorar oportunidades",
      secondaryCta: "Solicitar una búsqueda privada",
      scrollHint: "Desplácese",
    },
    search: {
      heading: "¿Qué está buscando?",
      label: "Describa lo que necesita",
      placeholder: "Una finca en Antioquia, un charter Medellín–Miami, una camioneta blindada…",
      categoryLabel: "Categoría",
      anyCategory: "Todas las categorías",
      action: "Buscar",
    },
    verticals: {
      eyebrow: "Categorías",
      heading: "Cinco frentes, una sola puerta de entrada",
      lede: "Operamos por intermediación. Usted describe lo que necesita y nosotros lo buscamos dentro de la red, sin importar en cuál de estas categorías esté.",
    },
    selected: {
      eyebrow: "Selección",
      heading: "Una selección, no un catálogo",
      lede: "Publicamos poco a propósito. Cada oportunidad pasa por revisión antes de aparecer aquí, y la mayoría de lo que movemos nunca llega a publicarse.",
      cta: "Ver todas las oportunidades",
    },
    why: {
      eyebrow: "Por qué DCM ACCESS",
      heading: "Seis razones para trabajar con una puerta de acceso",
      pillars: [
        {
          key: "access",
          title: "Acceso",
          body: "Llegamos a activos, servicios y contrapartes que rara vez aparecen en un buscador público.",
        },
        {
          key: "selectivity",
          title: "Selección",
          body: "Filtramos antes de presentar. Preferimos mostrarle tres opciones sólidas que trescientas irrelevantes.",
        },
        {
          key: "connection",
          title: "Conexión",
          body: "Conectamos a las partes correctas y acompañamos la conversación hasta donde alcance nuestro mandato.",
        },
        {
          key: "convenience",
          title: "Un solo interlocutor",
          body: "Un solo punto de contacto para categorías que normalmente exigirían cinco interlocutores distintos.",
        },
        {
          key: "global-reach",
          title: "Alcance internacional",
          body: "Arquitectura pensada para operar en varias monedas, idiomas y jurisdicciones desde el primer día.",
        },
        {
          key: "discretion",
          title: "Discreción",
          body: "Las búsquedas privadas y las operaciones de alto valor se manejan sin exposición pública.",
        },
      ],
    },
    process: {
      eyebrow: "Intermediación",
      heading: "Cómo trabajamos",
      lede: "Un proceso de seis etapas, el mismo para un apartamento que para una aeronave.",
      cta: "Conocer el proceso completo",
    },
    network: {
      eyebrow: "Una red en expansión",
      heading: "Una red que crece por mercados, no por promesas",
      lede: "DCM ACCESS opera desde Colombia y construye su red hacia otros mercados. La plataforma está diseñada para soportar esa expansión sin rehacerse.",
      disclaimer:
        "Las regiones señaladas indican los mercados hacia los que se dirige la expansión. No representan oficinas ni operaciones establecidas.",
      regions: [
        { key: "latam", note: "Mercado de origen y base actual de operación." },
        { key: "north-america", note: "Corredor prioritario de expansión." },
        { key: "europe", note: "Mercado objetivo en desarrollo." },
        { key: "middle-east", note: "Mercado objetivo en desarrollo." },
        { key: "other", note: "Se evalúan según la demanda de la red." },
      ],
    },
    privateTeaser: {
      eyebrow: "Acceso privado",
      heading: "No toda oportunidad necesita ser pública",
      lede: "Una parte de lo que movemos no se publica: propiedades off-market, aeronaves, vehículos particulares y oportunidades empresariales que se comparten únicamente por solicitud.",
      cta: "Entrar al acceso privado",
    },
    partnerTeaser: {
      eyebrow: "Socios",
      heading: "Ofrezca sus productos y servicios a través de una red premium",
      lede: "Inmobiliarias, concesionarios, operadores de aviación, empresas de seguridad y proveedores especializados pueden usar DCM ACCESS como canal hacia clientes calificados.",
      cta: "Postularse como socio",
    },
  },

  verticals: {
    "real-estate": {
      eyebrow: "Inmobiliario",
      title: "Propiedades y oportunidades inmobiliarias",
      lede: "Damos acceso a inmuebles residenciales, comerciales y de inversión, en venta y en arrendamiento, incluyendo operaciones que no se publican.",
      teaser: "Residencial, comercial, rural e inversión.",
      offerings: [
        "Apartamentos",
        "Casas",
        "Fincas",
        "Lotes y terrenos",
        "Propiedades comerciales",
        "Propiedades de lujo",
        "Inmuebles de inversión",
        "Alquileres y arrendamientos",
        "Intermediación inmobiliaria",
      ],
    },
    motors: {
      eyebrow: "Vehículos",
      title: "Vehículos premium, clásicos y especiales",
      lede: "Localizamos, negociamos e intermediamos vehículos particulares y comerciales, incluyendo unidades difíciles de conseguir en el mercado local.",
      teaser: "Premium, clásicos, comerciales y especiales.",
      offerings: [
        "Carros y motos",
        "Vehículos premium y de lujo",
        "Vehículos clásicos",
        "Vehículos comerciales",
        "Vehículos especiales y de seguridad",
        "Compra, venta y alquiler",
        "Leasing",
        "Intermediación",
      ],
      compliance:
        "Los vehículos de seguridad y blindados se gestionan únicamente con proveedores autorizados y conforme a la normativa aplicable en cada jurisdicción.",
    },
    aviation: {
      eyebrow: "Aviación",
      title: "Soluciones de aviación privada",
      lede: "Conectamos a nuestros clientes con operadores y comercializadores de aviación para charter, adquisición, venta y leasing de aeronaves.",
      teaser: "Charter, aeronaves y aviación ejecutiva.",
      offerings: [
        "Vuelos charter",
        "Jets privados",
        "Helicópteros",
        "Aviación ejecutiva",
        "Compra y venta de aeronaves",
        "Alquiler y leasing",
        "Servicios relacionados",
      ],
      compliance:
        "DCM ACCESS no opera aeronaves ni presta servicios aéreos. Toda operación de vuelo se ejecuta a través de operadores debidamente certificados y bajo la normativa aeronáutica aplicable.",
    },
    "private-services": {
      eyebrow: "Servicios privados",
      title: "Servicios privados y logística ejecutiva",
      lede: "Conectamos clientes con proveedores profesionales de transporte, concierge, logística y protección.",
      teaser: "Transporte, concierge, logística y protección.",
      offerings: [
        "Transporte ejecutivo",
        "Conductores privados",
        "Concierge",
        "Logística privada",
        "Seguridad privada",
        "Servicios de protección",
        "Servicios premium especializados",
      ],
      compliance:
        "Los servicios de seguridad y protección se prestan exclusivamente por empresas legalmente habilitadas y con licencia vigente en su jurisdicción. DCM ACCESS actúa como intermediario, no como prestador del servicio.",
    },
    business: {
      eyebrow: "Oportunidades de negocio",
      title: "Activos empresariales y oportunidades de negocio",
      lede: "La categoría abierta: maquinaria, equipos, participaciones, proveedores y alianzas que no encajan en las demás.",
      teaser: "Maquinaria, activos, negocios y alianzas.",
      offerings: [
        "Maquinaria y equipos",
        "Activos empresariales",
        "Negocios en venta",
        "Proveedores y servicios B2B",
        "Alianzas comerciales",
        "Oportunidades de inversión",
        "Activos especiales",
      ],
    },
  },

  catalog: {
    title: "Oportunidades",
    lede: "Una selección curada de activos, servicios y oportunidades. Lo que no encuentre aquí, probablemente podamos buscarlo.",
    resultsOne: "1 oportunidad",
    resultsMany: "{count} oportunidades",
    filters: "Filtros",
    clearFilters: "Limpiar",
    applyFilters: "Aplicar",
    sortLabel: "Ordenar por",
    sort: {
      relevance: "Relevancia",
      newest: "Más recientes",
      priceAsc: "Precio ascendente",
      priceDesc: "Precio descendente",
    },
    facets: {
      vertical: "Categoría principal",
      category: "Subcategoría",
      country: "País",
      city: "Ciudad",
      listingType: "Tipo de operación",
      currency: "Moneda",
      priceRange: "Rango de precio",
      minPrice: "Mínimo",
      maxPrice: "Máximo",
      any: "Cualquiera",
    },
    empty: {
      heading: "No hay resultados publicados para esta búsqueda",
      body: "Buena parte de lo que movemos nunca se publica. Descríbanos lo que busca y lo rastreamos dentro de la red.",
      cta: "Solicitar una búsqueda privada",
    },
  },

  opportunity: {
    overview: "Descripción",
    specifications: "Características",
    location: "Ubicación",
    provider: "Proveedor",
    availability: "Disponibilidad",
    reference: "Referencia",
    published: "Publicada",
    verifiedLabel: "Información verificada",
    unverifiedLabel: "Sin verificar",
    pendingLabel: "Verificación en curso",
    inquiryHeading: "Solicitar información",
    inquiryLede:
      "Cuéntenos qué necesita saber y un asesor le responde con el detalle y la documentación disponible.",
    related: "Oportunidades relacionadas",
    confidentialHeading: "Oportunidad reservada",
    confidentialBody:
      "Los datos de esta oportunidad se comparten únicamente por solicitud. Envíe una consulta y se le entregará la información bajo el nivel de confidencialidad que corresponda.",
  },

  privateAccess: {
    eyebrow: "Acceso privado",
    heading: "No toda oportunidad necesita ser pública",
    statement: "No todo necesita ser público.",
    lede: "El acceso privado es el canal reservado de DCM ACCESS: oportunidades off-market, mandatos de búsqueda y operaciones que se manejan sin exposición.",
    includes: [
      "Propiedades off-market",
      "Vehículos premium y unidades específicas",
      "Aeronaves y vuelos privados",
      "Servicios privados y de protección",
      "Oportunidades empresariales confidenciales",
      "Concierge y atención personalizada",
    ],
    cta: "Iniciar una búsqueda privada",
    offMarketHeading: "Oportunidades reservadas",
    offMarketLede:
      "Estas oportunidades existen y están activas. Su detalle se entrega por solicitud, no en abierto.",
    discretionHeading: "Discreción por diseño",
    discretionBody:
      "Cada solicitud lleva un nivel de confidencialidad que define qué se comparte, con quién y en qué momento. Usted lo elige al enviarla.",
  },

  privateRequest: {
    eyebrow: "Búsqueda privada",
    heading: "Solicite una oportunidad",
    lede: "Descríbanos qué necesita. Buscamos dentro de la red, verificamos lo que encontramos y le presentamos únicamente lo que vale su tiempo.",
    examplesHeading: "Solicitudes como estas",
    examples: [
      "Busco un jet para 8 pasajeros.",
      "Busco una finca de alto valor.",
      "Busco una camioneta blindada.",
      "Busco un apartamento premium para inversión.",
    ],
    fields: {
      what: {
        label: "¿Qué está buscando?",
        placeholder: "Describa el activo, el servicio o la oportunidad con el detalle que prefiera.",
        hint: "Cuanto más específico, más corta y más útil será la búsqueda.",
      },
      vertical: { label: "Categoría" },
      location: { label: "Ubicación", placeholder: "Ciudad, país o región" },
      budget: { label: "Presupuesto", placeholder: "Cifra aproximada" },
      currency: { label: "Moneda" },
      timeline: { label: "Plazo" },
      requirements: {
        label: "Requisitos específicos",
        placeholder: "Condiciones, características indispensables, restricciones.",
      },
      name: { label: "Nombre" },
      email: { label: "Correo electrónico" },
      phone: { label: "Teléfono" },
      contactMethod: { label: "Medio de contacto preferido" },
      confidentiality: { label: "Nivel de confidencialidad" },
    },
    timelineOptions: [
      { value: "immediate", label: "Inmediato" },
      { value: "30-days", label: "Dentro de 30 días" },
      { value: "90-days", label: "Dentro de 90 días" },
      { value: "exploring", label: "Explorando opciones" },
    ],
    contactOptions: [
      { value: "email", label: "Correo electrónico" },
      { value: "phone", label: "Llamada" },
      { value: "whatsapp", label: "WhatsApp" },
    ],
    confidentialityOptions: [
      {
        value: "standard",
        label: "Estándar",
        description: "Podemos mencionar su requerimiento a proveedores de la red.",
      },
      {
        value: "discreet",
        label: "Discreto",
        description: "Compartimos el requerimiento sin identificarle.",
      },
      {
        value: "strictly_private",
        label: "Estrictamente privado",
        description: "Solo un asesor asignado gestiona la solicitud.",
      },
    ],
    submit: "Enviar solicitud",
    successHeading: "Solicitud recibida",
    successBody:
      "Su solicitud quedó registrada con una referencia interna. Un asesor la revisa y le contacta por el medio que indicó.",
    consent:
      "Autorizo el tratamiento de mis datos para gestionar esta solicitud, conforme a la política de privacidad.",
  },

  brokerage: {
    eyebrow: "Intermediación",
    heading: "Díganos qué necesita",
    statement: "Buscamos. Conectamos. Facilitamos.",
    lede: "Nuestro trabajo es de intermediación. Buscamos la oportunidad, revisamos la información disponible, conectamos a las partes y acompañamos el proceso hasta donde alcance el mandato acordado.",
    steps: [
      {
        number: "01",
        key: "request",
        title: "Solicitud",
        body: "El cliente describe qué necesita, con qué condiciones y en qué plazo.",
      },
      {
        number: "02",
        key: "source",
        title: "Búsqueda",
        body: "Rastreamos la oportunidad dentro de la red: proveedores, contactos y mercado off-market.",
      },
      {
        number: "03",
        key: "verify",
        title: "Verificación",
        body: "Revisamos la información recibida y la idoneidad del proveedor, según corresponda al caso.",
      },
      {
        number: "04",
        key: "connect",
        title: "Conexión",
        body: "Presentamos y conectamos a las partes con el contexto que cada una necesita.",
      },
      {
        number: "05",
        key: "negotiate",
        title: "Negociación",
        body: "Facilitamos el proceso comercial cuando el mandato lo contempla.",
      },
      {
        number: "06",
        key: "close",
        title: "Cierre",
        body: "Acompañamos el cierre dentro del alcance del servicio contratado.",
      },
    ],
    scopeHeading: "Qué significa y qué no",
    scopeBody:
      "DCM ACCESS actúa como intermediario. No sustituye la asesoría legal, contable, fiscal ni técnica que cada operación requiera, y no presta directamente servicios regulados: estos se ejecutan a través de proveedores habilitados. El alcance exacto se define por escrito en cada mandato.",
    cta: "Iniciar una solicitud",
  },

  partners: {
    eyebrow: "Socios",
    heading: "Sea socio de DCM ACCESS",
    lede: "Ofrezca sus productos y servicios a través de una red premium de clientes calificados.",
    benefitsHeading: "Qué obtiene",
    benefits: [
      {
        key: "qualified-demand",
        title: "Demanda calificada",
        body: "Recibe solicitudes ya filtradas, con requerimiento, presupuesto y plazo definidos.",
      },
      {
        key: "positioning",
        title: "Posicionamiento",
        body: "Su empresa aparece dentro de un entorno premium, no en un tablón de clasificados.",
      },
      {
        key: "single-channel",
        title: "Un canal, varias categorías",
        body: "Si opera en más de una vertical, no necesita más de un acuerdo.",
      },
      {
        key: "commercial-terms",
        title: "Términos claros",
        body: "Comisión, referido, fee por lead o revenue share: se acuerda por escrito antes de empezar.",
      },
    ],
    whoHeading: "Con quién trabajamos",
    who: [
      "Inmobiliarias y desarrolladores",
      "Concesionarios y compraventas",
      "Operadores charter y empresas de aviación",
      "Empresas de seguridad y protección",
      "Empresas de transporte y logística",
      "Empresas de concierge y servicios premium",
      "Proveedores especializados y B2B",
    ],
    curationHeading: "La curaduría no es un trámite",
    curationBody:
      "Ninguna postulación se publica automáticamente. Revisamos la información, la documentación y la idoneidad antes de aprobar un perfil, porque la exclusividad de la red depende exactamente de eso.",
    cta: "Enviar postulación",
    directoryHeading: "Proveedores aprobados",
    directoryLede: "Empresas que forman parte de la red y publican a través de DCM ACCESS.",
    directoryEmpty: "Todavía no hay proveedores aprobados publicados.",
  },

  partnerApply: {
    heading: "Postulación de socio",
    lede: "Cuéntenos quién es, qué ofrece y dónde opera. La revisión es manual.",
    steps: ["Empresa", "Operación", "Documentación"],
    fields: {
      company: { label: "Nombre de la empresa" },
      country: { label: "País" },
      city: { label: "Ciudad" },
      verticals: { label: "Categorías en las que opera", hint: "Puede seleccionar varias." },
      services: {
        label: "Servicios o productos",
        placeholder: "Sepárelos con comas.",
      },
      website: { label: "Página web" },
      email: { label: "Correo electrónico" },
      phone: { label: "Teléfono" },
      description: {
        label: "Descripción de la empresa",
        placeholder: "A qué se dedica, desde cuándo y qué la diferencia.",
      },
      operatingAreas: {
        label: "Áreas de operación",
        placeholder: "Ciudades, regiones o países donde presta servicio.",
      },
      commercialInfo: {
        label: "Información comercial",
        placeholder: "Condiciones, comisiones habituales, capacidad de atención.",
      },
      certifications: {
        label: "Certificaciones",
        placeholder: "Sepárelas con comas.",
        hint: "Se verifican antes de mostrarse como acreditadas.",
      },
      licences: {
        label: "Licencias y habilitaciones",
        hint: "Obligatorio para servicios regulados: aviación, seguridad y protección.",
      },
      documentation: {
        label: "Documentación",
        hint: "Indique qué documentación puede aportar. No la adjunte todavía.",
      },
    },
    reviewNotice:
      "Su postulación entra en cola de revisión. No se publica ningún perfil de forma automática.",
    submit: "Enviar postulación",
    successHeading: "Postulación recibida",
    successBody:
      "Quedó registrada con una referencia interna. Revisamos la información y le contactamos para continuar el proceso.",
  },

  provider: {
    about: "Sobre la empresa",
    services: "Servicios",
    coverage: "Cobertura",
    certifications: "Certificaciones",
    openOpportunities: "Oportunidades publicadas",
    contact: "Contactar",
    verificationHeading: "Sobre la verificación",
    verificationBody:
      "El estado de verificación indica qué información ha sido revisada por DCM ACCESS. Las acreditaciones sin marca de verificación son declaradas por el proveedor y no han sido comprobadas.",
  },

  about: {
    eyebrow: "Nosotros",
    heading: "DCM ACCESS es una puerta de acceso",
    lede: "No intentamos venderlo todo. Buscamos las oportunidades correctas, conectamos a las personas correctas y facilitamos negocios de alto valor.",
    originHeading: "El origen",
    originBody: [
      "DCM ACCESS toma sus iniciales del nombre de su fundador, David Cardona Martínez. ACCESS es lo que da nombre al negocio: dar acceso a oportunidades, activos, servicios y conexiones que normalmente son difíciles de encontrar, negociar o conseguir.",
      "La empresa opera desde Colombia y construye su red hacia mercados internacionales, sin quedar atada a una sola industria.",
    ],
    modelHeading: "El modelo",
    modelBody: [
      "Trabajamos por intermediación. No dependemos de un inventario propio: nuestra función es conectar clientes con activos, servicios, proveedores y oportunidades, y facilitar la operación entre las partes.",
      "Esto permite atender a la vez a quien busca un inmueble, a quien necesita un charter y a quien quiere adquirir maquinaria, con un solo interlocutor y un mismo estándar de trabajo.",
    ],
    principlesHeading: "Cómo trabajamos",
    principles: [
      {
        key: "selectivity",
        title: "Selección antes que volumen",
        body: "Preferimos presentar poco y bueno. Publicar de más es el camino más rápido a parecer un clasificado.",
      },
      {
        key: "verification",
        title: "Verificar antes de presentar",
        body: "Revisamos la información y la idoneidad del proveedor según corresponda a cada operación.",
      },
      {
        key: "discretion",
        title: "Discreción como estándar",
        body: "Las operaciones de alto valor se manejan sin exposición pública, y el cliente define el nivel de reserva.",
      },
      {
        key: "clarity",
        title: "Claridad comercial",
        body: "El alcance y las condiciones se acuerdan por escrito antes de empezar, no después.",
      },
    ],
  },

  contact: {
    eyebrow: "Contacto",
    heading: "Hablemos",
    lede: "Para consultas generales, propuestas comerciales o acuerdos B2B. Si busca un activo o un servicio concreto, la búsqueda privada es el camino más rápido.",
    fields: {
      name: { label: "Nombre" },
      email: { label: "Correo electrónico" },
      phone: { label: "Teléfono" },
      subject: { label: "Asunto" },
      message: { label: "Mensaje" },
    },
    submit: "Enviar mensaje",
    successHeading: "Mensaje recibido",
    successBody: "Gracias por escribir. Le respondemos al correo que indicó.",
  },

  inquiry: {
    heading: "Solicitar información",
    fields: {
      name: { label: "Nombre" },
      email: { label: "Correo electrónico" },
      phone: { label: "Teléfono" },
      message: {
        label: "Su consulta",
        placeholder: "¿Qué necesita saber sobre esta oportunidad?",
      },
    },
    submit: "Enviar consulta",
    successHeading: "Consulta enviada",
    successBody: "Un asesor revisa su consulta y le responde con el detalle disponible.",
  },

  account: {
    heading: "Su cuenta",
    lede: "Sus oportunidades guardadas, sus solicitudes y su conversación con la mesa de intermediación.",
    nav: {
      overview: "Resumen",
      favorites: "Favoritos",
      requests: "Solicitudes",
      messages: "Mensajes",
      profile: "Perfil",
    },
    empty: {
      favorites: "Todavía no ha guardado ninguna oportunidad.",
      requests: "No tiene solicitudes registradas.",
      messages: "No hay mensajes en esta conversación.",
    },
    demoSession:
      "Sesión de demostración. La autenticación real todavía no está conectada; los datos que ve son de ejemplo.",
  },

  legal: {
    heading: "Legal",
    lede: "Términos, políticas y descargos que rigen el uso de la plataforma.",
    lastUpdated: "Última actualización",
    draftNotice:
      "BORRADOR. Estos textos son una estructura base y no constituyen asesoría legal. Deben ser revisados y adaptados por un abogado antes de publicarse.",
    documents: [
      {
        slug: "terms",
        title: "Términos y condiciones",
        summary: "Reglas de uso de la plataforma y alcance del servicio de intermediación.",
        sections: [
          {
            heading: "Naturaleza del servicio",
            body: "DCM ACCESS actúa como intermediario entre clientes y proveedores. No es propietario de los activos publicados salvo indicación expresa, no presta directamente servicios regulados y no sustituye la asesoría legal, fiscal, contable o técnica que cada operación requiera.",
          },
          {
            heading: "Información publicada",
            body: "La información de las oportunidades procede de sus proveedores o titulares. DCM ACCESS realiza revisiones según corresponda, pero no garantiza la exactitud, vigencia o disponibilidad de todo dato publicado. El estado de verificación indica el alcance de la revisión efectuada.",
          },
          {
            heading: "Uso de la plataforma",
            body: "El usuario se compromete a proporcionar información veraz, a no utilizar la plataforma con fines ilícitos y a no extraer sistemáticamente su contenido sin autorización.",
          },
          {
            heading: "Condiciones comerciales",
            body: "El alcance, las comisiones y las condiciones de cada operación se definen por escrito en el mandato correspondiente. Nada en este sitio constituye una oferta vinculante.",
          },
        ],
      },
      {
        slug: "privacy",
        title: "Política de privacidad",
        summary: "Qué datos tratamos, con qué finalidad y qué derechos tiene sobre ellos.",
        sections: [
          {
            heading: "Datos que tratamos",
            body: "Tratamos los datos de contacto y el contenido de las solicitudes que usted envía voluntariamente a través de los formularios, con la finalidad de gestionar su requerimiento.",
          },
          {
            heading: "Finalidad y base legal",
            body: "Los datos se utilizan para atender solicitudes, conectar con proveedores cuando corresponda y mantener el registro comercial de la relación. La base legal es la ejecución de la relación solicitada y el consentimiento otorgado al enviar el formulario.",
          },
          {
            heading: "Comunicación a terceros",
            body: "Cuando la gestión lo requiera, su requerimiento puede compartirse con proveedores de la red. El nivel de confidencialidad que usted elige al enviar una solicitud privada determina qué información se comparte y si se le identifica.",
          },
          {
            heading: "Sus derechos",
            body: "Puede solicitar el acceso, la rectificación, la actualización o la supresión de sus datos escribiendo al canal de contacto indicado en este sitio.",
          },
        ],
      },
      {
        slug: "cookies",
        title: "Política de cookies",
        summary: "Qué cookies utiliza el sitio y cómo controlarlas.",
        sections: [
          {
            heading: "Cookies necesarias",
            body: "El sitio utiliza una cookie para recordar su preferencia de idioma. Sin ella la navegación seguiría funcionando, pero el idioma se renegociaría en cada visita.",
          },
          {
            heading: "Medición",
            body: "La analítica está preparada pero no se activa ninguna medición sin su consentimiento explícito.",
          },
          {
            heading: "Control",
            body: "Puede eliminar las cookies desde la configuración de su navegador en cualquier momento.",
          },
        ],
      },
      {
        slug: "disclaimer",
        title: "Descargos",
        summary: "Límites de responsabilidad sobre la información y las operaciones.",
        sections: [
          {
            heading: "Servicios regulados",
            body: "Los servicios de aviación, seguridad y protección se prestan exclusivamente por empresas legalmente habilitadas y con licencia vigente en su jurisdicción. DCM ACCESS no opera aeronaves ni presta servicios de seguridad.",
          },
          {
            heading: "Sin asesoría de inversión",
            body: "El contenido de este sitio es informativo. No constituye asesoría de inversión, legal ni fiscal, y no debe tomarse como recomendación personalizada.",
          },
          {
            heading: "Precios y disponibilidad",
            body: "Los precios mostrados son de referencia y pueden variar. La disponibilidad de cualquier activo u oportunidad está sujeta a confirmación.",
          },
        ],
      },
      {
        slug: "partner-policy",
        title: "Política de socios",
        summary: "Criterios de admisión, verificación y permanencia en la red.",
        sections: [
          {
            heading: "Admisión",
            body: "Ninguna postulación se publica automáticamente. Toda solicitud pasa por revisión manual de información, documentación e idoneidad antes de ser aprobada.",
          },
          {
            heading: "Servicios regulados",
            body: "Los proveedores de servicios regulados deben acreditar licencias y habilitaciones vigentes. Sin esa acreditación no se aprueba el perfil ni se publica oferta alguna en esas categorías.",
          },
          {
            heading: "Verificación",
            body: "Las acreditaciones se muestran como verificadas únicamente cuando DCM ACCESS ha comprobado el documento. En caso contrario se identifican como declaradas por el proveedor.",
          },
          {
            heading: "Permanencia",
            body: "La red puede suspender o retirar un perfil ante información inexacta, incumplimientos reiterados o pérdida de las habilitaciones exigidas.",
          },
        ],
      },
    ],
  },

  footer: {
    tagline: "Acceso a oportunidades exclusivas.",
    exploreHeading: "Explorar",
    companyHeading: "Empresa",
    legalHeading: "Legal",
    contactHeading: "Contacto",
    rights: "Todos los derechos reservados.",
    disclaimer:
      "DCM ACCESS actúa como intermediario. Los servicios regulados se prestan a través de proveedores legalmente habilitados.",
    reportHeading: "Reportar un contenido",
    reportBody:
      "Si detecta una publicación inexacta, engañosa o que no debería estar en la red, escríbanos y la revisamos.",
  },

  errors: {
    required: "Este campo es obligatorio.",
    email: "Introduzca un correo electrónico válido.",
    minLength: "Escriba al menos {min} caracteres.",
    maxLength: "No supere los {max} caracteres.",
    url: "Introduzca una dirección web válida.",
    number: "Introduzca un número válido.",
    selectOne: "Seleccione al menos una opción.",
    consent: "Debe autorizar el tratamiento de datos para continuar.",
    rateLimited: "Ha enviado varias solicitudes seguidas. Espere un momento e inténtelo de nuevo.",
    generic: "No se pudo procesar la solicitud. Inténtelo de nuevo.",
    notFoundHeading: "Esta página no existe",
    notFoundBody: "El enlace puede haber cambiado o la oportunidad ya no está publicada.",
    notFoundCta: "Volver al inicio",
  },
};
