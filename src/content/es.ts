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
    taglineLines: ["ACCESO A OPORTUNIDADES", "EXCLUSIVAS"],
    signature: "Activos globales • Servicios premium • Intermediación privada",
    logoTagline: "Conectando oportunidades",
  },

  navLabels: {
    "real-estate": "Inmobiliario",
    motors: "Vehículos",
    aviation: "Aviación",
    services: "Servicios",
    business: "Negocios",
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
    contactCta: "Contacto",
    whatsappInquiry: "Hola, me interesa esta publicación: {title} (referencia {ref}).",
    contactBroker: "Contactar con un asesor",
    privateRequest: "Solicitud privada",
    sell: "Vender",
    sellMessage:
      "Hola, quiero vender a través de DCM ACCESS. Les cuento qué tengo:",
    learnMore: "Conocer más",
    back: "Volver",
    submit: "Enviar",
    signOut: "Cerrar sesión",
    account: "Mi cuenta",
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
      lede: "Activos globales, servicios premium y oportunidades cuidadosamente seleccionadas, conectadas a través de una red de intermediación.",
      scrollHint: "Desplácese",
    },

    verticals: {
      eyebrow: "Categorías",
      heading: "Cinco frentes, una sola puerta de entrada",
      lede: "Operamos por intermediación. Usted describe lo que necesita y nosotros lo buscamos dentro de la red, sin importar en cuál de estas categorías esté.",
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
    services: {
      eyebrow: "Servicios",
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
      eyebrow: "Negocios",
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

  motorsMarket: {
    eyebrow: "Mercado de vehículos",
    heading: "Vehículos disponibles ahora",
    scrollCue: "Ver los vehículos",
    sellCta: "Vender mi vehículo",
    searchCta: "Buscar",
    offeringsHeading: "Lo que nos puedes pedir",
    filters: {
      legend: "Filtrar vehículos",
      queryLabel: "Buscar",
      queryPlaceholder: "Porsche clásico en Madrid, camioneta blindada…",
      make: "Marca",
      year: "Año",
      yearFrom: "Año desde",
      yearTo: "Año hasta",
      priceFrom: "Precio mínimo",
      priceTo: "Precio máximo",
      kmMax: "Kilometraje máximo",
      city: "Ciudad",
      category: "Tipo",
    },
    card: {
      video: "Vídeo",
      km: "km",
    },
    sell: {
      eyebrow: "Vender por DCM ACCESS",
      title: "Cuéntanos del vehículo",
      lede: "Envíanos los datos y las fotografías. Revisamos cada vehículo antes de que aparezca en el mercado.",
      reviewNote:
        "Enviar este formulario no publica el vehículo. Lo revisamos primero y te contactamos antes de que salga.",
      sections: {
        vehicle: "El vehículo",
        price: "Precio",
        place: "Dónde está",
        media: "Fotos y vídeo",
        seller: "Cómo te ubicamos",
      },
      fields: {
        category: { label: "Tipo de vehículo" },
        make: { label: "Marca", placeholder: "Porsche" },
        model: { label: "Modelo", placeholder: "911 Carrera" },
        year: { label: "Año", placeholder: "2021" },
        mileage: { label: "Kilometraje", placeholder: "45000", hint: "En kilómetros." },
        fuel: { label: "Combustible" },
        transmission: { label: "Transmisión" },
        condition: { label: "Estado" },
        priceMode: { label: "¿Cómo quieres mostrar el precio?" },
        priceAmount: { label: "Precio", placeholder: "245000" },
        currency: { label: "Moneda" },
        country: { label: "País" },
        city: { label: "Ciudad", placeholder: "Medellín" },
        description: {
          label: "Descripción",
          placeholder: "Historial de mantenimiento, extras, lo que un comprador debería saber antes de llamar.",
          hint: "Mínimo 30 caracteres.",
        },
        name: { label: "Tu nombre" },
        email: { label: "Correo" },
        phone: { label: "Teléfono", placeholder: "+57 300 000 0000" },
      },
      priceModes: {
        fixed: "Mostrar un importe",
        onRequest: "Precio a consultar",
      },
      media: {
        label: "Fotos y vídeo del vehículo",
        hint: "Hasta 12 fotos y 2 vídeos. JPG, PNG, WebP o MP4.",
        add: "Elegir archivos",
        remove: "Quitar",
        uploading: "Subiendo…",
        uploaded: "Listo",
        failed: "No se subió",
        retry: "Reintentar",
        tooMany: "Llegaste al límite de archivos.",
        tooLarge: "Este archivo pesa demasiado.",
        badType: "Este tipo de archivo no se acepta.",
        pending: "Espera a que terminen de subir los archivos.",
      },
      consent:
        "Autorizo a DCM ACCESS a tratar esta información para revisar e intermediar el vehículo.",
      submit: "Enviar solicitud",
      successHeading: "Solicitud recibida",
      successBody:
        "Ya tenemos tu vehículo. Lo revisamos y te contactamos al correo que nos diste.",
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

  brokerage: {
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
    lede: "Complete sus datos para habilitar el medio de contacto.",
    fields: {
      name: { label: "Nombre y apellido" },
      email: { label: "Correo electrónico" },
      phone: { label: "Teléfono" },
      message: {
        label: "Su consulta",
        placeholder: "¿Qué necesita saber sobre esta oportunidad?",
      },
    },
    phoneCode: "País",
    consent: "Autorizo el tratamiento de mis datos conforme a los {terms} y la {privacy}.",
    consentTerms: "términos y condiciones",
    consentPrivacy: "política de privacidad",
    submit: "Contactar",
    whatsapp: "WhatsApp",
    whatsappTemplate: "{message}\n\nSoy {name}.",
    successHeading: "Consulta enviada",
    successBody: "Un asesor revisa su consulta y le responde con el detalle disponible.",
    successWhatsapp: "WhatsApp se abrió en otra pestaña. Si no la ve, pulse aquí.",
  },

  auth: {
    loginHeading: "Entrar",
    loginLede: "Le enviamos un enlace seguro a su correo. Sin contraseñas que recordar.",
    signupHeading: "Crear cuenta",
    signupLede: "Empiece por su correo. El resto del perfil se completa después.",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "nombre@ejemplo.com",
    continueEmail: "Continuar con correo",
    continueGoogle: "Continuar con Google",
    separator: "o",
    roleQuestion: "¿Cómo va a usar DCM ACCESS?",
    roleClient: "Busco algo",
    roleClientHint: "Un inmueble, un vehículo, una aeronave, un servicio o un negocio.",
    rolePartner: "Tengo algo que ofrecer",
    rolePartnerHint: "Soy proveedor, agente o dueño y quiero publicar oportunidades.",
    partnerNotice:
      "Las cuentas de partner pasan por verificación antes de poder publicar. Le escribimos en cuanto revisemos sus datos.",
    sentHeading: "Revise su correo",
    sentBody: "Si la dirección es válida, acabamos de enviarle un enlace para entrar.",
    sentHint: "Caduca en una hora y solo sirve una vez. Mire también en no deseados.",
    noAccount: "¿Todavía no tiene cuenta?",
    toSignup: "Crear una",
    haveAccount: "¿Ya tiene cuenta?",
    toLogin: "Entrar",
    legal: "Al continuar acepta los términos y la política de privacidad.",
    errorLink: "El enlace no es válido o ya caducó. Pida uno nuevo.",
    errorDenied: "Esa cuenta no tiene acceso a esta sección.",
    errorGoogle: "No se pudo continuar con Google. Inténtelo de nuevo.",
    errorRequired: "Inicie sesión para continuar.",
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
      {
        slug: "trade-policy",
        title: "Políticas de comercio",
        summary: "Qué se puede publicar en DCM ACCESS y qué no.",
        sections: [
          {
            heading: "Qué se puede publicar",
            body: "Únicamente activos, vehículos, inmuebles y servicios sobre los que quien publica tenga la propiedad, la representación o un mandato vigente. La publicación debe describir el bien tal como es, con su estado real, su ubicación real y un precio que se pueda sostener.",
          },
          {
            heading: "Qué no se admite",
            body: "No se publican bienes de procedencia dudosa, con reserva de dominio no declarada, con gravámenes ocultos, robados o sujetos a litigio. Tampoco armas, fauna, medicamentos, documentos de identidad, ni nada cuyo comercio esté restringido o prohibido por la normativa aplicable en la jurisdicción correspondiente.",
          },
          {
            heading: "Vehículos y bienes regulados",
            body: "Los vehículos blindados, las aeronaves y los servicios de seguridad están sujetos a la normativa y a los permisos de cada jurisdicción. DCM ACCESS intermedia con proveedores habilitados y no gestiona por sí misma trámites que exijan licencia específica.",
          },
          {
            heading: "Veracidad de la información",
            body: "Las fotografías y los vídeos deben corresponder al bien anunciado. No se admiten imágenes de archivo presentadas como propias, precios señuelo, ni omitir defectos relevantes que un comprador razonable querría conocer antes de decidir.",
          },
          {
            heading: "Papel de DCM ACCESS",
            body: "DCM ACCESS actúa como intermediario y punto de acceso. No es propietaria de los bienes publicados, no garantiza su estado ni interviene en el pago entre las partes, salvo que se pacte expresamente por escrito para una operación concreta.",
          },
          {
            heading: "Retirada de publicaciones",
            body: "Cualquier publicación que incumpla estas condiciones puede retirarse sin aviso previo. Ante información inexacta reiterada, se puede cancelar el acceso a publicar.",
          },
        ],
      },
      {
        slug: "non-discrimination",
        title: "Política de no discriminación",
        summary: "Nadie queda fuera por quién es.",
        sections: [
          {
            heading: "Compromiso",
            body: "DCM ACCESS no admite publicaciones ni conductas que discriminen a una persona por su origen nacional o étnico, color de piel, sexo, orientación sexual, identidad de género, edad, discapacidad, estado civil, situación familiar, religión, opinión política o condición socioeconómica.",
          },
          {
            heading: "En las publicaciones",
            body: "Ninguna publicación puede excluir, desalentar ni dar preferencia a personas por esas características, ni en su texto, ni en sus imágenes, ni en las condiciones de la operación. Esto alcanza especialmente al arrendamiento de vivienda, donde la selección del inquilino no puede apoyarse en ninguno de esos criterios.",
          },
          {
            heading: "En el trato",
            body: "La misma exigencia se aplica al trato entre las partes durante una operación intermediada, y a los proveedores de la red en la prestación de sus servicios.",
          },
          {
            heading: "Cómo reportar",
            body: "Cualquier persona puede señalar una publicación o una conducta que considere discriminatoria escribiendo al correo de contacto. Cada reporte se revisa, y la publicación se retira mientras dure la revisión cuando el caso lo amerite.",
          },
          {
            heading: "Consecuencias",
            body: "El incumplimiento supone la retirada de la publicación y puede suponer la cancelación del acceso a publicar, sin perjuicio de las acciones legales que correspondan.",
          },
        ],
      },
    ],
  },

  footer: {
    tagline: "Acceso a oportunidades exclusivas.",
    exploreHeading: "Explorar",
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
    phone: "Introduzca un teléfono válido.",
    rateLimited: "Ha enviado varias solicitudes seguidas. Espere un momento e inténtelo de nuevo.",
    generic: "No se pudo procesar la solicitud. Inténtelo de nuevo.",
    notFoundHeading: "Esta página no existe",
    notFoundBody: "El enlace puede haber cambiado o la oportunidad ya no está publicada.",
    notFoundCta: "Volver al inicio",
  },
};
