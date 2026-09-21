import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Lead, LeadEvent, LeadStatus, Vertical } from "@/lib/domain/types";
import { isVertical, leadSources, leadStatuses } from "@/lib/domain/types";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

import type { LeadInput, LeadRepository } from "../repositories";

/* ============================================================================
   LEADS EN SUPABASE
   ----------------------------------------------------------------------------
   Quien deja su nombre y su teléfono en una ficha tiene que seguir ahí mañana.
   Mientras los leads vivían en el adaptador de memoria eso no se cumplía: cada
   despliegue —y cada instancia sin usar que se apaga sola— se los llevaba por
   delante. El formulario funcionaba y los datos no llegaban a ninguna parte.

   VA CON LA CLAVE SECRETA, no con la publicable como el catálogo. Un lead es
   el dato personal de un tercero: nombre, teléfono, correo. La tabla tiene RLS
   activo y NINGUNA política, de modo que la clave que viaja al navegador no
   puede ni leerla ni escribirla aunque alguien la copie de las herramientas de
   desarrollo. La única puerta es esta, y está en el servidor.
   ========================================================================== */

type LeadRow = {
  id: string;
  reference: string;
  source: string;
  status: string;
  locale: string;
  name: string;
  email: string;
  phone: string | null;
  channel: string;
  message: string | null;
  vertical: string | null;
  opportunity_id: string | null;
  timeline_events: LeadEvent[] | null;
  created_at: string;
};

const COLUMNAS =
  "id, reference, source, status, locale, name, email, phone, channel, message, vertical, opportunity_id, timeline_events, created_at";

/**
 * Referencia legible y corta.
 *
 * Segundos transcurridos desde 2026, igual que la de las fichas: ocho cifras
 * que caben en un mensaje, no se repiten y no delatan cuántos leads hay —un
 * contador que empieza en 1 sí lo haría—.
 */
function nuevaReferencia(): string {
  const ORIGEN = Date.UTC(2026, 0, 1);
  return `LD-${Math.floor((Date.now() - ORIGEN) / 1000)}`;
}

function aLead(row: LeadRow): Lead {
  const vertical: Vertical | undefined =
    row.vertical && isVertical(row.vertical) ? row.vertical : undefined;

  return {
    id: row.id,
    reference: row.reference,
    // `source` y `status` llegan como texto de la base. Se validan contra el
    // dominio en lugar de confiar: una fila escrita a mano desde el panel de
    // Supabase no debe poder romper el tablero del CRM.
    source: esFuente(row.source) ? row.source : "inquiry",
    status: esEstado(row.status) ? row.status : "new",
    locale: isLocale(row.locale) ? row.locale : defaultLocale,
    contact: {
      name: row.name,
      email: row.email,
      phone: row.phone ?? undefined,
      preferredChannel: row.channel === "whatsapp" ? "whatsapp" : "email",
    },
    vertical,
    opportunityId: row.opportunity_id ?? undefined,
    message: row.message ?? undefined,
    confidentiality: "standard",
    timeline_events: row.timeline_events ?? [],
    isDemo: false,
    createdAt: row.created_at,
  };
}

const FUENTES = new Set<string>(leadSources);
const ESTADOS = new Set<string>(leadStatuses);

function esFuente(value: string): value is Lead["source"] {
  return FUENTES.has(value);
}

function esEstado(value: string): value is LeadStatus {
  return ESTADOS.has(value);
}

export function createSupabaseLeads(client: SupabaseClient): LeadRepository {
  return {
    async create(input: LeadInput): Promise<Lead> {
      const at = new Date().toISOString();

      const { data, error } = await client
        .from("leads")
        .insert({
          reference: nuevaReferencia(),
          source: input.source,
          status: "new",
          locale: input.locale,
          name: input.contact.name,
          email: input.contact.email,
          phone: input.contact.phone ?? null,
          channel: input.contact.preferredChannel ?? "form",
          message: input.message ?? null,
          vertical: input.vertical ?? null,
          opportunity_id: input.opportunityId ?? null,
          client_id: input.clientId ?? null,
          timeline_events: [{ at, status: "new" }],
        })
        .select(COLUMNAS)
        .single<LeadRow>();

      if (error || !data) {
        throw new Error(`No se pudo guardar el contacto: ${error?.message ?? "sin fila"}`);
      }

      return aLead(data);
    },

    async list(filter): Promise<readonly Lead[]> {
      let query = client.from("leads").select(COLUMNAS).order("created_at", { ascending: false });
      if (filter?.status) query = query.eq("status", filter.status);

      const { data, error } = await query.returns<LeadRow[]>();
      if (error) throw new Error(`No se pudieron leer los leads: ${error.message}`);

      return (data ?? []).map(aLead);
    },

    async byId(id): Promise<Lead | null> {
      const { data, error } = await client
        .from("leads")
        .select(COLUMNAS)
        .eq("id", id)
        .maybeSingle<LeadRow>();

      if (error) throw new Error(`No se pudo leer el lead: ${error.message}`);
      return data ? aLead(data) : null;
    },

    async updateStatus(id, status, note): Promise<Lead | null> {
      /*
        El historial se lee y se reescribe en lugar de anexarse en SQL: son dos
        viajes, pero el tablero del panel mueve un lead cada vez y a mano. Un
        `jsonb_insert` ahorraría uno y costaría tener la forma del historial
        escrita en dos sitios.
      */
      const actual = await this.byId(id);
      if (!actual) return null;

      const evento: LeadEvent = { at: new Date().toISOString(), status, note };

      const { data, error } = await client
        .from("leads")
        .update({ status, timeline_events: [...actual.timeline_events, evento] })
        .eq("id", id)
        .select(COLUMNAS)
        .single<LeadRow>();

      if (error || !data) return null;
      return aLead(data);
    },
  };
}
