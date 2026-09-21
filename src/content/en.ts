import type { Dictionary } from "./types";

/**
 * English. Same register as `es.ts`: we find, we connect, we give access —
 * never "we sell". No urgency, no discount language (§4, §32).
 */
export const en: Dictionary = {
  meta: {
    siteDescription:
      "DCM ACCESS connects clients with global assets, premium services and selected opportunities through a private brokerage network.",
    homeTitle: "Access to exclusive opportunities",
  },

  brand: {
    taglineLines: ["ACCESS TO EXCLUSIVE", "OPPORTUNITIES"],
    signature: "Global Assets • Premium Services • Private Brokerage",
    logoTagline: "Connecting opportunities",
  },

  navLabels: {
    "real-estate": "Real Estate",
    motors: "Motors",
    aviation: "Aviation",
    services: "Services",
    business: "Business",
    contact: "Contact",
  },

  regions: {
    latam: "LATAM",
    "north-america": "North America",
    europe: "Europe",
    "middle-east": "Middle East",
    other: "Other Markets",
  },

  tags: {
    selected: "Selected",
    private: "Private",
    reserved: "Reserved",
  },

  common: {
    explore: "Explore",
    viewOpportunity: "View opportunity",
    contactCta: "Contact",
    whatsappInquiry: "Hello, I'm interested in this listing: {title} (reference {ref}).",
    contactBroker: "Contact broker",
    privateRequest: "Private request",
    sell: "Sell",
    sellMessage: "Hello, I would like to sell through DCM ACCESS. Here is what I have:",
    learnMore: "Learn more",
    back: "Back",
    submit: "Submit",
    signOut: "Sign out",
    account: "My account",
    submitting: "Sending…",
    continue: "Continue",
    previous: "Previous",
    close: "Close",
    priceOnRequest: "Price on request",
    from: "From",
    optional: "optional",
    required: "required",
    loading: "Loading…",
    language: "Language",
    skipToContent: "Skip to main content",
    menu: "Menu",
    demoNotice:
      "Demonstration content. The opportunities, providers and figures shown are examples for evaluating the platform, not real offers.",
  },

  nav: {
    primaryLabel: "Primary navigation",
    verticalsLabel: "Categories",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },

  home: {
    hero: {
      lede: "Global assets, premium services and carefully selected opportunities, connected through a brokerage network.",
      scrollHint: "Scroll",
    },

    verticals: {
      eyebrow: "Categories",
      heading: "Five fronts, one way in",
      lede: "We work through intermediation. You describe what you need and we source it across the network, whichever of these categories it belongs to.",
    },

    why: {
      eyebrow: "Why DCM ACCESS",
      heading: "Six reasons to work through a single point of access",
      pillars: [
        {
          key: "access",
          title: "Access",
          body: "We reach assets, services and counterparties that rarely surface in a public search.",
        },
        {
          key: "selectivity",
          title: "Selectivity",
          body: "We filter before we present. Three solid options beat three hundred irrelevant ones.",
        },
        {
          key: "connection",
          title: "Connection",
          body: "We connect the right parties and stay with the conversation as far as the mandate reaches.",
        },
        {
          key: "convenience",
          title: "Convenience",
          body: "One point of contact for categories that would normally require five separate ones.",
        },
        {
          key: "global-reach",
          title: "Global Reach",
          body: "Built from day one to operate across currencies, languages and jurisdictions.",
        },
        {
          key: "discretion",
          title: "Discretion",
          body: "Private searches and high-value transactions are handled without public exposure.",
        },
      ],
    },
    process: {
      eyebrow: "Brokerage",
      heading: "How we work",
      lede: "A six-stage process — the same for an apartment as for an aircraft.",
      cta: "See the full process",
    },
    network: {
      eyebrow: "Expanding Global Network",
      heading: "A network that grows by market, not by claim",
      lede: "DCM ACCESS operates from Colombia and is building its network into other markets. The platform is designed to carry that expansion without being rebuilt.",
      disclaimer:
        "The regions shown indicate the markets expansion is directed towards. They do not represent established offices or operations.",
      regions: [
        { key: "latam", note: "Home market and current base of operation." },
        { key: "north-america", note: "Priority expansion corridor." },
        { key: "europe", note: "Target market in development." },
        { key: "middle-east", note: "Target market in development." },
        { key: "other", note: "Assessed as network demand appears." },
      ],
    },

  },

  verticals: {
    "real-estate": {
      eyebrow: "Real Estate",
      title: "Property and real estate opportunities",
      lede: "Access to residential, commercial and investment property, for sale and for lease — including transactions that are never listed.",
      teaser: "Residential, commercial, rural and investment.",
      offerings: [
        "Apartments",
        "Houses",
        "Estates and farmland",
        "Plots and land",
        "Commercial property",
        "Luxury property",
        "Investment property",
        "Rentals and leases",
        "Real estate intermediation",
      ],
    },
    motors: {
      eyebrow: "Motors",
      title: "Premium, classic and special vehicles",
      lede: "We locate, negotiate and broker private and commercial vehicles, including units that are hard to source locally.",
      teaser: "Premium, classic, commercial and special.",
      offerings: [
        "Cars and motorcycles",
        "Premium and luxury vehicles",
        "Classic vehicles",
        "Commercial vehicles",
        "Special and security vehicles",
        "Purchase, sale and rental",
        "Leasing",
        "Intermediation",
      ],
      compliance:
        "Security and armoured vehicles are handled exclusively with authorised providers and in accordance with the regulations applicable in each jurisdiction.",
    },
    aviation: {
      eyebrow: "Aviation",
      title: "Private aviation solutions",
      lede: "We connect clients with aviation operators and brokers for charter, acquisition, sale and leasing of aircraft.",
      teaser: "Charter, aircraft and executive aviation.",
      offerings: [
        "Charter flights",
        "Private jets",
        "Helicopters",
        "Executive aviation",
        "Aircraft acquisition and sale",
        "Rental and leasing",
        "Related services",
      ],
      compliance:
        "DCM ACCESS does not operate aircraft and does not provide air services. All flight operations are carried out by duly certified operators under the applicable aviation regulations.",
    },
    services: {
      eyebrow: "Services",
      title: "Private services and executive logistics",
      lede: "We connect clients with professional providers of transport, concierge, logistics and protection services.",
      teaser: "Transport, concierge, logistics and protection.",
      offerings: [
        "Executive transport",
        "Private drivers",
        "Concierge",
        "Private logistics",
        "Private security",
        "Protection services",
        "Specialised premium services",
      ],
      compliance:
        "Security and protection services are provided exclusively by legally licensed companies holding current authorisation in their jurisdiction. DCM ACCESS acts as an intermediary, not as the service provider.",
    },
    business: {
      eyebrow: "Business",
      title: "Business assets and commercial opportunities",
      lede: "The open category: machinery, equipment, holdings, suppliers and partnerships that do not fit the others.",
      teaser: "Machinery, assets, businesses and partnerships.",
      offerings: [
        "Machinery and equipment",
        "Business assets",
        "Businesses for sale",
        "Suppliers and B2B services",
        "Commercial partnerships",
        "Investment opportunities",
        "Special assets",
      ],
    },
  },

  motorsMarket: {
    eyebrow: "Vehicle marketplace",
    heading: "Vehicles available now",
    scrollCue: "See the vehicles",
    sellCta: "Sell your vehicle",
    searchCta: "Search",
    offeringsHeading: "What you can ask us for",
    filters: {
      legend: "Filter vehicles",
      queryLabel: "Search",
      queryPlaceholder: "Classic Porsche in Madrid, armoured SUV…",
      make: "Make",
      year: "Year",
      yearFrom: "Year from",
      yearTo: "Year to",
      priceFrom: "Min price",
      priceTo: "Max price",
      kmMax: "Max mileage",
      city: "City",
      category: "Type",
    },
    card: {
      video: "Video",
      km: "km",
    },
    sell: {
      eyebrow: "Sell through DCM ACCESS",
      title: "Tell us about your vehicle",
      lede: "Send us the details and the photographs. We review every vehicle before it appears in the marketplace.",
      reviewNote:
        "Submitting this form does not publish the vehicle. We review it first and get in touch with you before it goes live.",
      sections: {
        vehicle: "The vehicle",
        price: "Price",
        place: "Where it is",
        media: "Photos and video",
        seller: "How we reach you",
      },
      fields: {
        category: { label: "Type of vehicle" },
        make: { label: "Make", placeholder: "Porsche" },
        model: { label: "Model", placeholder: "911 Carrera" },
        year: { label: "Year", placeholder: "2021" },
        mileage: { label: "Mileage", placeholder: "45000", hint: "In kilometres." },
        fuel: { label: "Fuel" },
        transmission: { label: "Transmission" },
        condition: { label: "Condition" },
        priceMode: { label: "How do you want to show the price?" },
        priceAmount: { label: "Price", placeholder: "245000" },
        currency: { label: "Currency" },
        country: { label: "Country" },
        city: { label: "City", placeholder: "Medellin" },
        description: {
          label: "Description",
          placeholder: "Service history, extras, anything a buyer should know before calling.",
          hint: "At least 30 characters.",
        },
        name: { label: "Your name" },
        email: { label: "Email" },
        phone: { label: "Phone", placeholder: "+57 300 000 0000" },
      },
      priceModes: {
        fixed: "Show an amount",
        onRequest: "Price on request",
      },
      media: {
        label: "Photos and video of the vehicle",
        hint: "Up to 12 photos and 2 videos. JPG, PNG, WebP or MP4.",
        add: "Choose files",
        remove: "Remove",
        uploading: "Uploading…",
        uploaded: "Ready",
        failed: "Did not upload",
        retry: "Try again",
        tooMany: "You have reached the file limit.",
        tooLarge: "This file is too heavy.",
        badType: "This file type is not accepted.",
        pending: "Wait for the files to finish uploading.",
      },
      consent:
        "I authorise DCM ACCESS to process this information in order to review and broker the vehicle.",
      submit: "Send request",
      successHeading: "Request received",
      successBody:
        "We have your vehicle. We review it and get in touch with you at the email you gave us.",
    },
  },

  catalog: {
    title: "Opportunities",
    lede: "A curated selection of assets, services and opportunities. What you don't find here, we can probably source.",
    resultsOne: "1 opportunity",
    resultsMany: "{count} opportunities",
    filters: "Filters",
    clearFilters: "Clear",
    applyFilters: "Apply",
    sortLabel: "Sort by",
    sort: {
      relevance: "Relevance",
      newest: "Most recent",
      priceAsc: "Price ascending",
      priceDesc: "Price descending",
    },
    facets: {
      vertical: "Main category",
      category: "Subcategory",
      country: "Country",
      city: "City",
      listingType: "Transaction type",
      currency: "Currency",
      priceRange: "Price range",
      minPrice: "Minimum",
      maxPrice: "Maximum",
      any: "Any",
    },
    empty: {
      heading: "No published results for this search",
      body: "Much of what we move is never published. Tell us what you are looking for and we will track it across the network.",
      cta: "Request a private search",
    },
  },

  opportunity: {
    overview: "Overview",
    specifications: "Specifications",
    location: "Location",
    provider: "Provider",
    availability: "Availability",
    reference: "Reference",
    published: "Published",
    verifiedLabel: "Information verified",
    unverifiedLabel: "Unverified",
    pendingLabel: "Verification in progress",
    inquiryHeading: "Request information",
    inquiryLede:
      "Tell us what you need to know and a broker will respond with the available detail and documentation.",
    related: "Related opportunities",
    confidentialHeading: "Reserved opportunity",
    confidentialBody:
      "Details of this opportunity are shared strictly on request. Send an enquiry and the information will be released under the appropriate level of confidentiality.",
  },

  brokerage: {
    steps: [
      {
        number: "01",
        key: "request",
        title: "Request",
        body: "The client describes what they need, on what terms and within what timeframe.",
      },
      {
        number: "02",
        key: "source",
        title: "Source",
        body: "We track the opportunity across the network: providers, contacts and the off-market.",
      },
      {
        number: "03",
        key: "verify",
        title: "Verify",
        body: "We review the information received and the suitability of the provider, as the case requires.",
      },
      {
        number: "04",
        key: "connect",
        title: "Connect",
        body: "We introduce and connect the parties with the context each of them needs.",
      },
      {
        number: "05",
        key: "negotiate",
        title: "Negotiate",
        body: "We facilitate the commercial process where the mandate provides for it.",
      },
      {
        number: "06",
        key: "close",
        title: "Close",
        body: "We support the closing within the scope of the engaged service.",
      },
    ],
  },

  contact: {
    eyebrow: "Contact",
    heading: "Let's talk",
    lede: "For general enquiries, commercial proposals or B2B agreements. If you are looking for a specific asset or service, a private search is the faster route.",
    fields: {
      name: { label: "Name" },
      email: { label: "Email" },
      phone: { label: "Phone" },
      subject: { label: "Subject" },
      message: { label: "Message" },
    },
    submit: "Send message",
    successHeading: "Message received",
    successBody: "Thank you for writing. We will reply to the address you provided.",
  },

  inquiry: {
    heading: "Request information",
    lede: "Complete your details to unlock the contact channel.",
    fields: {
      name: { label: "Full name" },
      email: { label: "Email" },
      phone: { label: "Phone" },
      message: {
        label: "Your enquiry",
        placeholder: "What would you like to know about this opportunity?",
      },
    },
    phoneCode: "Country",
    consent: "I authorise the processing of my data under the {terms} and the {privacy}.",
    consentTerms: "terms and conditions",
    consentPrivacy: "privacy policy",
    submit: "Contact",
    whatsapp: "WhatsApp",
    whatsappTemplate: "{message}\n\nI'm {name}.",
    successHeading: "Enquiry sent",
    successBody: "A broker will review your enquiry and reply with the available detail.",
    successWhatsapp: "WhatsApp opened in another tab. If you cannot see it, tap here.",
  },

  auth: {
    loginHeading: "Sign in",
    loginLede: "We send a secure link to your email. No password to remember.",
    signupHeading: "Create account",
    signupLede: "Start with your email. The rest of the profile comes after.",
    emailLabel: "Email",
    emailPlaceholder: "name@example.com",
    continueEmail: "Continue with email",
    continueGoogle: "Continue with Google",
    separator: "or",
    roleQuestion: "How will you use DCM ACCESS?",
    roleClient: "I'm looking for something",
    roleClientHint: "A property, a vehicle, an aircraft, a service or a business.",
    rolePartner: "I have something to offer",
    rolePartnerHint: "I'm a supplier, agent or owner and I want to list opportunities.",
    partnerNotice:
      "Partner accounts go through verification before they can publish. We'll write as soon as we review your details.",
    sentHeading: "Check your email",
    sentBody: "If the address is valid, we've just sent you a link to sign in.",
    sentHint: "It expires in an hour and works once. Check your spam folder too.",
    noAccount: "No account yet?",
    toSignup: "Create one",
    haveAccount: "Already have an account?",
    toLogin: "Sign in",
    legal: "By continuing you accept the terms and the privacy policy.",
    errorLink: "That link is invalid or has expired. Request a new one.",
    errorDenied: "That account doesn't have access to this section.",
    errorGoogle: "Could not continue with Google. Please try again.",
    errorRequired: "Sign in to continue.",
  },

  legal: {
    heading: "Legal",
    lede: "Terms, policies and disclaimers governing the use of the platform.",
    lastUpdated: "Last updated",
    draftNotice:
      "DRAFT. These texts are a base structure and do not constitute legal advice. They must be reviewed and adapted by a lawyer before publication.",
    documents: [
      {
        slug: "terms",
        title: "Terms and conditions",
        summary: "Rules for using the platform and the scope of the intermediation service.",
        sections: [
          {
            heading: "Nature of the service",
            body: "DCM ACCESS acts as an intermediary between clients and providers. It does not own the published assets unless expressly stated, does not directly provide regulated services, and does not replace the legal, tax, accounting or technical advice each transaction requires.",
          },
          {
            heading: "Published information",
            body: "Opportunity information comes from its providers or owners. DCM ACCESS carries out reviews as appropriate, but does not guarantee the accuracy, currency or availability of every published detail. The verification status indicates the extent of the review carried out.",
          },
          {
            heading: "Use of the platform",
            body: "Users undertake to provide truthful information, not to use the platform for unlawful purposes, and not to systematically extract its content without authorisation.",
          },
          {
            heading: "Commercial terms",
            body: "The scope, commissions and conditions of each transaction are set out in writing in the corresponding mandate. Nothing on this site constitutes a binding offer.",
          },
        ],
      },
      {
        slug: "privacy",
        title: "Privacy policy",
        summary: "What data we process, for what purpose, and what rights you have over it.",
        sections: [
          {
            heading: "Data we process",
            body: "We process the contact details and request content that you voluntarily submit through the forms, for the purpose of handling your requirement.",
          },
          {
            heading: "Purpose and legal basis",
            body: "Data is used to handle requests, to connect with providers where appropriate, and to maintain the commercial record of the relationship. The legal basis is the performance of the requested relationship and the consent given when submitting the form.",
          },
          {
            heading: "Disclosure to third parties",
            body: "Where handling requires it, your requirement may be shared with providers in the network. The confidentiality level you choose when submitting a private request determines what information is shared and whether you are identified.",
          },
          {
            heading: "Your rights",
            body: "You may request access to, rectification, updating or deletion of your data by writing to the contact channel indicated on this site.",
          },
        ],
      },
      {
        slug: "cookies",
        title: "Cookie policy",
        summary: "Which cookies the site uses and how to control them.",
        sections: [
          {
            heading: "Necessary cookies",
            body: "The site uses one cookie to remember your language preference. Without it browsing would still work, but the language would be renegotiated on every visit.",
          },
          {
            heading: "Measurement",
            body: "Analytics is prepared but no measurement is activated without your explicit consent.",
          },
          {
            heading: "Control",
            body: "You can delete cookies from your browser settings at any time.",
          },
        ],
      },
      {
        slug: "disclaimer",
        title: "Disclaimers",
        summary: "Limits of responsibility regarding information and transactions.",
        sections: [
          {
            heading: "Regulated services",
            body: "Aviation, security and protection services are provided exclusively by legally licensed companies holding current authorisation in their jurisdiction. DCM ACCESS does not operate aircraft and does not provide security services.",
          },
          {
            heading: "No investment advice",
            body: "The content of this site is informational. It does not constitute investment, legal or tax advice and should not be taken as a personalised recommendation.",
          },
          {
            heading: "Prices and availability",
            body: "Prices shown are indicative and may vary. The availability of any asset or opportunity is subject to confirmation.",
          },
        ],
      },
      {
        slug: "partner-policy",
        title: "Partner policy",
        summary: "Admission, verification and continuity criteria for the network.",
        sections: [
          {
            heading: "Admission",
            body: "No application is published automatically. Every application goes through manual review of information, documentation and suitability before approval.",
          },
          {
            heading: "Regulated services",
            body: "Providers of regulated services must evidence current licences and authorisations. Without that evidence no profile is approved and no offering is published in those categories.",
          },
          {
            heading: "Verification",
            body: "Accreditations are shown as verified only when DCM ACCESS has checked the document. Otherwise they are identified as declared by the provider.",
          },
          {
            heading: "Continuity",
            body: "The network may suspend or withdraw a profile in the event of inaccurate information, repeated breaches or loss of the required authorisations.",
          },
        ],
      },
      {
        slug: "trade-policy",
        title: "Trade policy",
        summary: "What may be published on DCM ACCESS, and what may not.",
        sections: [
          {
            heading: "What may be published",
            body: "Only assets, vehicles, property and services that the publisher owns, represents, or holds a current mandate for. A listing must describe the item as it is, with its real condition, its real location and a price that can be honoured.",
          },
          {
            heading: "What is not accepted",
            body: "No goods of doubtful provenance, with undisclosed retention of title, hidden encumbrances, stolen, or subject to litigation. Nor weapons, wildlife, medicines, identity documents, or anything whose trade is restricted or prohibited by the regulations applicable in the relevant jurisdiction.",
          },
          {
            heading: "Vehicles and regulated goods",
            body: "Armoured vehicles, aircraft and security services are subject to the regulations and permits of each jurisdiction. DCM ACCESS brokers through licensed providers and does not itself handle procedures requiring specific licensing.",
          },
          {
            heading: "Accuracy of information",
            body: "Photographs and video must correspond to the item advertised. Stock imagery presented as your own, bait pricing, and the omission of material defects a reasonable buyer would want to know before deciding are not accepted.",
          },
          {
            heading: "The role of DCM ACCESS",
            body: "DCM ACCESS acts as an intermediary and point of access. It does not own the items published, does not guarantee their condition, and does not take part in payment between the parties unless expressly agreed in writing for a specific transaction.",
          },
          {
            heading: "Removal of listings",
            body: "Any listing that breaches these conditions may be removed without prior notice. Repeated inaccurate information may lead to publishing access being withdrawn.",
          },
        ],
      },
      {
        slug: "non-discrimination",
        title: "Non-discrimination policy",
        summary: "Nobody is excluded for who they are.",
        sections: [
          {
            heading: "Commitment",
            body: "DCM ACCESS does not accept listings or conduct that discriminate against a person on the basis of national or ethnic origin, skin colour, sex, sexual orientation, gender identity, age, disability, marital status, family situation, religion, political opinion or socioeconomic condition.",
          },
          {
            heading: "In listings",
            body: "No listing may exclude, discourage or give preference to people on those grounds — not in its text, not in its imagery, and not in the terms of the transaction. This applies with particular force to residential lettings, where tenant selection may not rest on any of those criteria.",
          },
          {
            heading: "In conduct",
            body: "The same requirement applies to how the parties treat each other during a brokered transaction, and to network providers in delivering their services.",
          },
          {
            heading: "How to report",
            body: "Anyone may flag a listing or conduct they consider discriminatory by writing to the contact address. Every report is reviewed, and the listing is taken down for the duration of that review where the case warrants it.",
          },
          {
            heading: "Consequences",
            body: "A breach means removal of the listing and may mean withdrawal of publishing access, without prejudice to any legal action that may apply.",
          },
        ],
      },
    ],
  },

  footer: {
    tagline: "Access to exclusive opportunities.",
    exploreHeading: "Explore",
    legalHeading: "Legal",
    contactHeading: "Contact",
    rights: "All rights reserved.",
    disclaimer:
      "DCM ACCESS acts as an intermediary. Regulated services are provided through legally licensed providers.",
    reportHeading: "Report content",
    reportBody:
      "If you spot a listing that is inaccurate, misleading or should not be in the network, write to us and we will review it.",
  },

  errors: {
    required: "This field is required.",
    email: "Enter a valid email address.",
    minLength: "Enter at least {min} characters.",
    maxLength: "Do not exceed {max} characters.",
    url: "Enter a valid web address.",
    number: "Enter a valid number.",
    selectOne: "Select at least one option.",
    consent: "You must authorise data processing to continue.",
    phone: "Enter a valid phone number.",
    rateLimited: "You have sent several requests in a row. Wait a moment and try again.",
    generic: "The request could not be processed. Please try again.",
    notFoundHeading: "This page does not exist",
    notFoundBody: "The link may have changed, or the opportunity is no longer published.",
    notFoundCta: "Back to home",
  },
};
