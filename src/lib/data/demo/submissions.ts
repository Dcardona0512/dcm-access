import type { MediaItem, Opportunity } from "@/lib/domain/types";
import { slugify } from "@/lib/utils";

import type {
  ListingSubmission,
  ListingSubmissionInput,
  SubmissionRepository,
  SubmissionStatus,
} from "../repositories";

/* ============================================================================
   SOLICITUDES DE PUBLICACIÓN — MEMORIA
   ----------------------------------------------------------------------------
   Implementación completa del contrato sobre un array. Existe para que el
   formulario de venta se pueda construir, probar y corregir ENTERO antes de
   que exista una base de datos: validación, estados, copias, la cola de
   moderación y la aprobación que publica.

   Cuando llegue Supabase, lo único que cambia es quién implementa la interfaz.
   ========================================================================== */

/**
 * Mismo motivo que en el adaptador: el sitio y el CRM se compilan en grafos de
 * módulos separados, así que las filas tienen que colgar de `globalThis` para
 * ser unas y no dos. Una solicitud enviada desde `/motors/sell` debe aparecer
 * en `/admin/submissions`, y eso no ocurre con una variable de módulo.
 */
type SubmissionStore = { rows: ListingSubmission[]; counter: number };

const STORE = Symbol.for("dcm.demo.submissions");

function getStore(): SubmissionStore {
  const host = globalThis as typeof globalThis & { [STORE]?: SubmissionStore };
  host[STORE] ??= { rows: [], counter: 0 };
  return host[STORE];
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Referencia legible para el vendedor. Comparte formato con los leads, porque
 * para quien la recibe por correo es lo mismo: un número que citar.
 */
function nextReference(counter: number): string {
  return `DCM-SL-${String(4200 + counter).padStart(4, "0")}`;
}

/**
 * Slug único dentro del conjunto ya publicado.
 *
 * Dos Porsche 911 en Madrid producen el mismo slug, y el segundo dejaría al
 * primero inalcanzable. Sufijo numérico en vez de fallar: publicar no puede
 * romperse por una colisión de nombres.
 */
function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function createInMemorySubmissions({
  publish,
  publishedSlugs,
}: {
  /** Inserta la oportunidad aprobada en el catálogo vivo del adaptador. */
  readonly publish: (opportunity: Opportunity) => void;
  readonly publishedSlugs: () => ReadonlySet<string>;
}): SubmissionRepository {
  const store = getStore();
  const rows = store.rows;

  const find = (id: string) => rows.findIndex((row) => row.id === id);

  const patch = (id: string, changes: Partial<ListingSubmission>): ListingSubmission | null => {
    const index = find(id);
    if (index === -1) return null;
    const updated = { ...rows[index], ...changes };
    rows[index] = updated;
    return updated;
  };

  return {
    async create(input: ListingSubmissionInput) {
      store.counter += 1;
      const counter = store.counter;

      const submission: ListingSubmission = {
        ...input,
        id: `sub-${String(counter).padStart(4, "0")}`,
        reference: nextReference(counter),
        status: "received",
        createdAt: nowIso(),
      };

      rows.unshift(submission);
      return submission;
    },

    async list(filter?: { readonly status?: SubmissionStatus }) {
      return filter?.status ? rows.filter((row) => row.status === filter.status) : rows;
    },

    async byId(id: string) {
      return rows.find((row) => row.id === id) ?? null;
    },

    async markNotified(id: string, error?: string) {
      patch(id, error ? { notifyError: error } : { notifiedAt: nowIso(), notifyError: undefined });
    },

    async approve(id: string) {
      const submission = rows.find((row) => row.id === id);
      if (!submission) throw new Error(`Solicitud inexistente: ${id}`);
      if (submission.publishedOpportunityId) {
        throw new Error(`La solicitud ${submission.reference} ya fue publicada`);
      }

      const at = nowIso();
      const opportunityId = `opp-sl-${submission.id.slice(-4)}`;

      const titleForSlug =
        submission.title.es ?? submission.title.en ?? submission.reference;

      /**
       * Los medios de una solicitud aprobada entran ya con `src`, que es lo
       * que separa una tarjeta con fotografía de la placa editorial. En
       * memoria la ruta es la que declaró la subida; con Supabase será la URL
       * pública tras mover el objeto al bucket publicado.
       */
      const media: readonly MediaItem[] = submission.media.map((item, index) => ({
        id: `${opportunityId}-${String(index + 1).padStart(2, "0")}`,
        kind: item.kind,
        src: item.path,
        alt: `${titleForSlug} — ${index + 1}`,
        width: item.width,
        height: item.height,
        durationS: item.durationS,
        tone: "motors",
      }));

      const opportunity: Opportunity = {
        id: opportunityId,
        slug: uniqueSlug(
          slugify(`${titleForSlug} ${submission.location.city ?? ""}`) || submission.id,
          publishedSlugs(),
        ),
        reference: submission.reference,
        vertical: submission.vertical,
        categoryId: submission.categoryId,
        title: submission.title,
        summary: submission.summary,
        description: submission.description,
        status: "published",
        visibility: "public",
        listingType: submission.listingType,
        price: submission.price,
        location: submission.location,
        media,
        attributes: submission.attributes,
        // Sin verificar: aprobar significa "es publicable", no "está
        // documentado". La verificación es un paso aparte y es lo que
        // distingue una ficha revisada de una simplemente admitida (§18).
        verification: "unverified",
        featured: false,
        // Nunca `isDemo`: esto es inventario real y no debe llevar la etiqueta.
        isDemo: false,
        publishedAt: at,
        updatedAt: at,
      };

      publish(opportunity);
      patch(id, { status: "approved", publishedOpportunityId: opportunity.id });

      return opportunity;
    },

    async reject(id: string) {
      return patch(id, { status: "rejected" });
    },
  };
}
