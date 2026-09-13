import type { CommissionPlan } from "@/lib/commerce/commissions";
import type {
  Deal,
  DealStage,
  Lead,
  LeadEvent,
  LeadStatus,
  Opportunity,
  Provider,
} from "@/lib/domain/types";
import { slugify } from "@/lib/utils";

import { searchIn } from "../query";
import type {
  LeadInput,
  Page,
  ProviderApplicationInput,
  Repositories,
} from "../repositories";
import { createInMemorySubmissions } from "./submissions";
import { categories, categoriesById } from "./seed/categories";
import { opportunities } from "./seed/opportunities";
import { commissionPlans, commissionPlansById, deals, leads } from "./seed/pipeline";
import { providers } from "./seed/providers";

/* ============================================================================
   ADAPTADOR DE DEMOSTRACIÓN
   ----------------------------------------------------------------------------
   Implementa el contrato completo sobre memoria. Los leads y las postulaciones
   que se crean en tiempo de ejecución viven en estos arrays: se pierden al
   reiniciar el proceso, que es exactamente lo que debe pasar con datos de
   prueba, y es también el recordatorio de que aquí falta conectar Supabase.
   ========================================================================== */

/* --- Estado de ejecución ------------------------------------------------------
   El sitio público y el CRM son layouts RAÍZ distintos, y Next los compila en
   grafos de módulos separados. Una variable de módulo, por tanto, no es una:
   son dos, y un vehículo aprobado desde `/admin` no aparecía en `/motors`.

   Anclar los arrays a `globalThis` les da una sola identidad en el proceso.
   Es el mismo truco que se usa con un cliente de base de datos en desarrollo,
   y sigue siendo memoria: se pierde al reiniciar, que es lo que debe pasar con
   datos de prueba. Con Supabase esto sobra, porque el estado deja de vivir en
   el proceso.
   ---------------------------------------------------------------------------- */

type RuntimeStore = {
  opportunities: Opportunity[];
  leads: Lead[];
  providers: Provider[];
  deals: Deal[];
  leadCounter: number;
  providerCounter: number;
};

const STORE = Symbol.for("dcm.demo.runtime");

function getStore(): RuntimeStore {
  const host = globalThis as typeof globalThis & { [STORE]?: RuntimeStore };

  host[STORE] ??= {
    opportunities: [...opportunities],
    leads: [...leads],
    providers: [...providers],
    deals: [...deals],
    leadCounter: leads.length,
    providerCounter: providers.length,
  };

  return host[STORE];
}

const store = getStore();
const runtimeOpportunities = store.opportunities;
const runtimeLeads = store.leads;
const runtimeProviders = store.providers;
const runtimeDeals = store.deals;

/* --- Utilidades ------------------------------------------------------------------- */

function nextReference(prefix: string, counter: number): string {
  return `DCM-${prefix}-${String(8800 + counter).padStart(4, "0")}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/* --- Repositorios ------------------------------------------------------------------ */

export function createDemoRepositories(): Repositories {
  return {
    categories: {
      async list() {
        return categories;
      },
      async byVertical(vertical) {
        return categories.filter((category) => category.vertical === vertical);
      },
      async byId(id) {
        return categoriesById.get(id) ?? null;
      },
      async bySlug(slug) {
        return categories.find((category) => category.slug === slug) ?? null;
      },
    },

    opportunities: {
      async search(query): Promise<Page<Opportunity>> {
        // Toda la semilla cabe en memoria, así que el núcleo compartido recibe
        // el conjunto entero. El adaptador de Supabase llamará a este mismo
        // `searchIn` con lo que la base de datos ya haya recortado.
        return searchIn(runtimeOpportunities, query, categoriesById);
      },

      async bySlug(slug) {
        return runtimeOpportunities.find((item) => item.slug === slug) ?? null;
      },

      async byId(id) {
        return runtimeOpportunities.find((item) => item.id === id) ?? null;
      },

      async related(opportunity, limit = 3) {
        return runtimeOpportunities
          .filter(
            (item) =>
              item.id !== opportunity.id &&
              item.status === "published" &&
              item.visibility === "public" &&
              item.vertical === opportunity.vertical,
          )
          .slice(0, limit);
      },

      async allPublished() {
        return runtimeOpportunities.filter(
          (item) => item.status === "published" && item.visibility === "public",
        );
      },

      async hasDemoPublished() {
        return runtimeOpportunities.some(
          (item) => item.isDemo && item.status === "published" && item.visibility === "public",
        );
      },
    },

    providers: {
      async listApproved() {
        return runtimeProviders.filter((provider) => provider.status === "approved");
      },
      async listAll() {
        return runtimeProviders;
      },
      async bySlug(slug) {
        return runtimeProviders.find((provider) => provider.slug === slug) ?? null;
      },
      async byId(id) {
        return runtimeProviders.find((provider) => provider.id === id) ?? null;
      },

      async createApplication(input: ProviderApplicationInput) {
        store.providerCounter += 1;
        const providerCounter = store.providerCounter;

        const provider: Provider = {
          id: `prv-app-${providerCounter}`,
          slug: slugify(input.name) || `partner-${providerCounter}`,
          name: input.name,
          description: { es: input.description, en: input.description },
          verticals: input.verticals,
          locations: [{ country: input.country, city: input.city }],
          services: input.services.map((service) => ({ es: service, en: service })),
          gallery: [],
          website: input.website,
          email: input.email,
          phone: input.phone,
          verification: "unverified",
          certifications: input.certifications.map((name) => ({ name, verified: false })),
          operatingAreas: input.operatingAreas,
          // Nunca `approved`: la curaduría es manual y es parte del producto (§18).
          status: "applied",
          isDemo: true,
          appliedAt: nowIso(),
        };

        runtimeProviders.unshift(provider);
        return provider;
      },

      async updateStatus(id, status) {
        const index = runtimeProviders.findIndex((provider) => provider.id === id);
        if (index === -1) return null;

        const updated: Provider = {
          ...runtimeProviders[index],
          status,
          approvedAt: status === "approved" ? nowIso() : runtimeProviders[index].approvedAt,
        };

        runtimeProviders[index] = updated;
        return updated;
      },
    },

    leads: {
      async create(input: LeadInput) {
        store.leadCounter += 1;
        const leadCounter = store.leadCounter;
        const at = nowIso();

        const lead: Lead = {
          id: `lead-${String(leadCounter).padStart(4, "0")}`,
          reference: nextReference("LD", leadCounter),
          source: input.source,
          status: "new",
          locale: input.locale,
          contact: input.contact,
          vertical: input.vertical,
          opportunityId: input.opportunityId,
          providerId: input.providerId,
          message: input.message,
          budget: input.budget,
          location: input.location,
          timeline: input.timeline,
          confidentiality: input.confidentiality ?? "standard",
          timeline_events: [{ at, status: "new" }],
          isDemo: true,
          createdAt: at,
        };

        runtimeLeads.unshift(lead);
        return lead;
      },

      async list(filter) {
        const all = [...runtimeLeads].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return filter?.status ? all.filter((lead) => lead.status === filter.status) : all;
      },

      async byId(id) {
        return runtimeLeads.find((lead) => lead.id === id) ?? null;
      },

      async updateStatus(id: string, status: LeadStatus, note?: string) {
        const index = runtimeLeads.findIndex((lead) => lead.id === id);
        if (index === -1) return null;

        const event: LeadEvent = { at: nowIso(), status, note };
        const updated: Lead = {
          ...runtimeLeads[index],
          status,
          timeline_events: [...runtimeLeads[index].timeline_events, event],
        };

        runtimeLeads[index] = updated;
        return updated;
      },
    },

    deals: {
      async list() {
        return runtimeDeals;
      },
      async byId(id) {
        return runtimeDeals.find((deal) => deal.id === id) ?? null;
      },
      async updateStage(id: string, stage: DealStage) {
        const index = runtimeDeals.findIndex((deal) => deal.id === id);
        if (index === -1) return null;

        const updated: Deal = {
          ...runtimeDeals[index],
          stage,
          outcome: stage === "close" ? "won" : runtimeDeals[index].outcome,
          updatedAt: nowIso(),
        };

        runtimeDeals[index] = updated;
        return updated;
      },
    },

    commissions: {
      async listPlans(): Promise<readonly CommissionPlan[]> {
        return commissionPlans;
      },
      async planById(id) {
        return commissionPlansById.get(id) ?? null;
      },
    },

    submissions: createInMemorySubmissions({
      // Publicar es insertar al principio: lo recién aprobado es lo más nuevo,
      // y el orden por defecto del catálogo es `newest`.
      publish: (opportunity) => runtimeOpportunities.unshift(opportunity),
      publishedSlugs: () => new Set(runtimeOpportunities.map((item) => item.slug)),
    }),
  };
}
