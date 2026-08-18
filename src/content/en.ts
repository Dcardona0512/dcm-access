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
    tagline: "ACCESS TO EXCLUSIVE OPPORTUNITIES",
    descriptor: "Global Assets • Premium Services • Exclusive Opportunities",
    signature: "Global Assets • Premium Services • Private Brokerage",
  },

  navLabels: {
    opportunities: "Opportunities",
    "real-estate": "Real Estate",
    motors: "Motors",
    aviation: "Aviation",
    "private-services": "Private Services",
    business: "Business",
    private: "Private Access",
    brokerage: "Brokerage",
    partners: "Become a Partner",
    about: "About",
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
    requestDetails: "Request details",
    contactBroker: "Contact broker",
    privateRequest: "Private request",
    requestAccess: "Request access",
    learnMore: "Learn more",
    back: "Back",
    submit: "Submit",
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
      eyebrow: "Global Assets • Premium Services • Exclusive Opportunities",
      lede: "Global assets, premium services and carefully selected opportunities, connected through a brokerage network.",
      primaryCta: "Explore opportunities",
      secondaryCta: "Request a private search",
      scrollHint: "Scroll",
    },
    search: {
      heading: "What are you looking for?",
      label: "Describe what you need",
      placeholder: "An estate in Antioquia, a Medellín–Miami charter, an armoured SUV…",
      categoryLabel: "Category",
      anyCategory: "All categories",
      action: "Search",
    },
    verticals: {
      eyebrow: "Categories",
      heading: "Five fronts, one way in",
      lede: "We work through intermediation. You describe what you need and we source it across the network, whichever of these categories it belongs to.",
    },
    selected: {
      eyebrow: "Selected Opportunities",
      heading: "A selection, not a catalogue",
      lede: "We publish sparingly, on purpose. Every opportunity is reviewed before it appears here, and most of what we move is never published at all.",
      cta: "View all opportunities",
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
    privateTeaser: {
      eyebrow: "DCM ACCESS PRIVATE",
      heading: "Not every opportunity needs to be public",
      lede: "Part of what we move is never listed: off-market property, aircraft, specific vehicles and business opportunities shared strictly on request.",
      cta: "Enter Private Access",
    },
    partnerTeaser: {
      eyebrow: "Partners",
      heading: "Offer your products and services through a premium network",
      lede: "Real estate firms, dealerships, charter operators, security companies and specialised providers can use DCM ACCESS as a channel to qualified clients.",
      cta: "Apply as a partner",
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
    "private-services": {
      eyebrow: "Private Services",
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
      eyebrow: "Business Opportunities",
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

  privateAccess: {
    eyebrow: "DCM ACCESS PRIVATE",
    heading: "Not every opportunity needs to be public",
    statement: "Not everything needs to be public.",
    lede: "Private Access is the reserved channel of DCM ACCESS: off-market opportunities, search mandates and transactions handled without exposure.",
    includes: [
      "Off-market property",
      "Premium vehicles and specific units",
      "Aircraft and private flights",
      "Private and protection services",
      "Confidential business opportunities",
      "Concierge and dedicated attention",
    ],
    cta: "Start a private search",
    offMarketHeading: "Reserved opportunities",
    offMarketLede:
      "These opportunities exist and are active. Their detail is released on request, not in the open.",
    discretionHeading: "Discretion by design",
    discretionBody:
      "Every request carries a confidentiality level that defines what is shared, with whom and when. You choose it when you submit.",
  },

  privateRequest: {
    eyebrow: "Private Search",
    heading: "Request an opportunity",
    lede: "Describe what you need. We search the network, verify what we find and present only what is worth your time.",
    examplesHeading: "Requests like these",
    examples: [
      "I'm looking for a jet for 8 passengers.",
      "I'm looking for a high-value estate.",
      "I'm looking for an armoured SUV.",
      "I'm looking for a premium apartment as an investment.",
    ],
    fields: {
      what: {
        label: "What are you looking for?",
        placeholder: "Describe the asset, service or opportunity in as much detail as you like.",
        hint: "The more specific you are, the shorter and more useful the search.",
      },
      vertical: { label: "Category" },
      location: { label: "Location", placeholder: "City, country or region" },
      budget: { label: "Budget", placeholder: "Approximate figure" },
      currency: { label: "Currency" },
      timeline: { label: "Timeline" },
      requirements: {
        label: "Specific requirements",
        placeholder: "Conditions, must-have features, constraints.",
      },
      name: { label: "Name" },
      email: { label: "Email" },
      phone: { label: "Phone" },
      contactMethod: { label: "Preferred contact method" },
      confidentiality: { label: "Confidentiality level" },
    },
    timelineOptions: [
      { value: "immediate", label: "Immediate" },
      { value: "30-days", label: "Within 30 days" },
      { value: "90-days", label: "Within 90 days" },
      { value: "exploring", label: "Exploring options" },
    ],
    contactOptions: [
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone call" },
      { value: "whatsapp", label: "WhatsApp" },
    ],
    confidentialityOptions: [
      {
        value: "standard",
        label: "Standard",
        description: "We may mention your requirement to providers in the network.",
      },
      {
        value: "discreet",
        label: "Discreet",
        description: "We share the requirement without identifying you.",
      },
      {
        value: "strictly_private",
        label: "Strictly private",
        description: "Only an assigned broker handles the request.",
      },
    ],
    submit: "Submit request",
    successHeading: "Request received",
    successBody:
      "Your request has been logged with an internal reference. A broker will review it and contact you through the channel you selected.",
    consent:
      "I authorise the processing of my data to handle this request, in accordance with the privacy policy.",
  },

  brokerage: {
    eyebrow: "DCM Brokerage",
    heading: "Tell us what you need",
    statement: "We search. We connect. We facilitate.",
    lede: "Our work is intermediation. We source the opportunity, review the available information, connect the parties and support the process as far as the agreed mandate reaches.",
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
    scopeHeading: "What this means, and what it does not",
    scopeBody:
      "DCM ACCESS acts as an intermediary. It does not replace the legal, accounting, tax or technical advice each transaction requires, and it does not directly provide regulated services — those are carried out by licensed providers. The exact scope is set out in writing in each mandate.",
    cta: "Start a request",
  },

  partners: {
    eyebrow: "Partners",
    heading: "Become a DCM ACCESS Partner",
    lede: "Offer your products and services through a premium network of qualified clients.",
    benefitsHeading: "What you get",
    benefits: [
      {
        key: "qualified-demand",
        title: "Qualified demand",
        body: "You receive pre-filtered requests with a defined requirement, budget and timeframe.",
      },
      {
        key: "positioning",
        title: "Positioning",
        body: "Your company appears inside a premium environment, not on a classifieds board.",
      },
      {
        key: "single-channel",
        title: "One channel, several categories",
        body: "If you operate across more than one vertical, you don't need more than one agreement.",
      },
      {
        key: "commercial-terms",
        title: "Clear terms",
        body: "Commission, referral, lead fee or revenue share — agreed in writing before anything starts.",
      },
    ],
    whoHeading: "Who we work with",
    who: [
      "Real estate firms and developers",
      "Dealerships and vehicle traders",
      "Charter operators and aviation companies",
      "Security and protection companies",
      "Transport and logistics companies",
      "Concierge and premium service companies",
      "Specialised and B2B providers",
    ],
    curationHeading: "Curation is not a formality",
    curationBody:
      "No application is published automatically. We review the information, the documentation and the suitability before approving a profile, because the exclusivity of the network depends on exactly that.",
    cta: "Submit application",
    directoryHeading: "Approved providers",
    directoryLede: "Companies that are part of the network and publish through DCM ACCESS.",
    directoryEmpty: "No approved providers have been published yet.",
  },

  partnerApply: {
    heading: "Partner application",
    lede: "Tell us who you are, what you offer and where you operate. Review is manual.",
    steps: ["Company", "Operation", "Documentation"],
    fields: {
      company: { label: "Company name" },
      country: { label: "Country" },
      city: { label: "City" },
      verticals: { label: "Categories you operate in", hint: "You may select more than one." },
      services: { label: "Services or products", placeholder: "Separate them with commas." },
      website: { label: "Website" },
      email: { label: "Email" },
      phone: { label: "Phone" },
      description: {
        label: "Company description",
        placeholder: "What you do, since when, and what sets you apart.",
      },
      operatingAreas: {
        label: "Operating areas",
        placeholder: "Cities, regions or countries you serve.",
      },
      commercialInfo: {
        label: "Commercial information",
        placeholder: "Terms, usual commissions, capacity to take on work.",
      },
      certifications: {
        label: "Certifications",
        placeholder: "Separate them with commas.",
        hint: "These are verified before being shown as accredited.",
      },
      licences: {
        label: "Licences and authorisations",
        hint: "Required for regulated services: aviation, security and protection.",
      },
      documentation: {
        label: "Documentation",
        hint: "Indicate what documentation you can provide. Do not attach it yet.",
      },
    },
    reviewNotice:
      "Your application enters a review queue. No profile is published automatically.",
    submit: "Submit application",
    successHeading: "Application received",
    successBody:
      "It has been logged with an internal reference. We will review the information and contact you to continue the process.",
  },

  provider: {
    about: "About the company",
    services: "Services",
    coverage: "Coverage",
    certifications: "Certifications",
    openOpportunities: "Published opportunities",
    contact: "Contact",
    verificationHeading: "About verification",
    verificationBody:
      "The verification status indicates what information has been reviewed by DCM ACCESS. Accreditations without a verification mark are declared by the provider and have not been checked.",
  },

  about: {
    eyebrow: "About",
    heading: "DCM ACCESS is a way in",
    lede: "We don't try to sell everything. We find the right opportunities, connect the right people and facilitate high-value transactions.",
    originHeading: "The origin",
    originBody: [
      "DCM ACCESS takes its initials from its founder, David Cardona Martínez. ACCESS is what names the business: giving access to opportunities, assets, services and connections that are normally hard to find, negotiate or secure.",
      "The company operates from Colombia and is building its network towards international markets, without being tied to a single industry.",
    ],
    modelHeading: "The model",
    modelBody: [
      "We work through intermediation. We do not depend on our own inventory: our function is to connect clients with assets, services, providers and opportunities, and to facilitate the transaction between the parties.",
      "That makes it possible to serve, at the same time, someone looking for property, someone who needs a charter and someone acquiring machinery — through one point of contact and one standard of work.",
    ],
    principlesHeading: "How we work",
    principles: [
      {
        key: "selectivity",
        title: "Selection over volume",
        body: "We would rather present little and good. Publishing too much is the fastest way to look like a classifieds site.",
      },
      {
        key: "verification",
        title: "Verify before presenting",
        body: "We review the information and the suitability of the provider as each transaction requires.",
      },
      {
        key: "discretion",
        title: "Discretion as standard",
        body: "High-value transactions are handled without public exposure, and the client sets the level of reserve.",
      },
      {
        key: "clarity",
        title: "Commercial clarity",
        body: "Scope and terms are agreed in writing before anything starts, not afterwards.",
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
    fields: {
      name: { label: "Name" },
      email: { label: "Email" },
      phone: { label: "Phone" },
      message: {
        label: "Your enquiry",
        placeholder: "What would you like to know about this opportunity?",
      },
    },
    submit: "Send enquiry",
    successHeading: "Enquiry sent",
    successBody: "A broker will review your enquiry and reply with the available detail.",
  },

  account: {
    heading: "Your account",
    lede: "Your saved opportunities, your requests and your conversation with the brokerage desk.",
    nav: {
      overview: "Overview",
      favorites: "Favourites",
      requests: "Requests",
      messages: "Messages",
      profile: "Profile",
    },
    empty: {
      favorites: "You haven't saved any opportunities yet.",
      requests: "You have no recorded requests.",
      messages: "There are no messages in this conversation.",
    },
    demoSession:
      "Demonstration session. Real authentication is not connected yet; the data shown is sample data.",
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
    ],
  },

  footer: {
    tagline: "Access to exclusive opportunities.",
    exploreHeading: "Explore",
    companyHeading: "Company",
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
    rateLimited: "You have sent several requests in a row. Wait a moment and try again.",
    generic: "The request could not be processed. Please try again.",
    notFoundHeading: "This page does not exist",
    notFoundBody: "The link may have changed, or the opportunity is no longer published.",
    notFoundCta: "Back to home",
  },
};
