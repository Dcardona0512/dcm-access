import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { categoriesById } from "@/lib/data/demo/seed/categories";
import type { Opportunity, Visibility } from "@/lib/domain/types";
import { normalize } from "@/lib/utils";

import { searchIn } from "../query";
import type { OpportunityQuery, OpportunityRepository, Page } from "../repositories";
import { rowToOpportunity, type MediaRow, type OpportunityRow, type PublicUrl } from "./mappers";

/* ============================================================================
   CATÁLOGO SOBRE SUPABASE
   ----------------------------------------------------------------------------
   El reparto de trabajo entre SQL y TypeScript es deliberado:

     · A la base se le pide lo que hace bien y con índice: igualdades, rango de
       precio, atributos por igualdad contra el GIN.
     · En memoria se resuelve lo que no: la relevancia del texto libre, los
       rangos sobre atributos y —sobre todo— los RECUENTOS de faceta, que
       tienen que contar el conjunto entero y no la página que se va a mostrar.

   Ese segundo tramo es exactamente el mismo `searchIn` que usa el adaptador de
   demostración, así que las dos fuentes no responden "parecido": dan lo mismo.
   ========================================================================== */

/**
 * Tope de filas que se traen para calcular relevancia y facetas.
 *
 * Con decenas de fichas es gratis. Si algún día se supera, los recuentos
 * empiezan a mentir en silencio; por eso avisa por consola en lugar de fallar
 * callado. Pasado ese punto toca mover la búsqueda a una función de Postgres.
 */
const SCAN_LIMIT = 500;

const DEFAULT_VISIBILITY: readonly Visibility[] = ["public"];

/** Fila con sus medios embebidos: PostgREST los trae en la misma petición. */
type RowWithMedia = OpportunityRow & { opportunity_media: MediaRow[] | null };

const SELECT = "*, opportunity_media(*)";

export function createSupabaseOpportunities(
  client: SupabaseClient,
  publicUrl: PublicUrl,
): OpportunityRepository {
  const table = () => client.from("opportunities").select(SELECT);

  function toDomain(rows: RowWithMedia[] | null): Opportunity[] {
    return (rows ?? []).map((row) =>
      rowToOpportunity(row, row.opportunity_media ?? [], publicUrl),
    );
  }

  return {
    async search(query: OpportunityQuery): Promise<Page<Opportunity>> {
      const visibility = query.visibility ?? DEFAULT_VISIBILITY;

      let builder = table()
        .eq("status", "published")
        .in("visibility", [...visibility]);

      if (query.vertical) builder = builder.eq("vertical", query.vertical);
      if (query.categoryId) builder = builder.eq("category_id", query.categoryId);
      if (query.providerId) builder = builder.eq("provider_id", query.providerId);
      if (query.listingType) builder = builder.eq("listing_type", query.listingType);
      if (query.featured !== undefined) builder = builder.eq("featured", query.featured);
      if (query.country) builder = builder.eq("country", query.country);
      if (query.city) builder = builder.eq("city_slug", normalize(query.city));
      if (query.currency) builder = builder.eq("price_currency", query.currency);

      // Un precio "a consultar" jamás se descarta por rango: descartarlo
      // escondería justo las fichas de mayor valor, que son las que no
      // publican cifra.
      if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        const range: string[] = [];
        if (query.minPrice !== undefined) range.push(`price_amount.gte.${query.minPrice}`);
        if (query.maxPrice !== undefined) range.push(`price_amount.lte.${query.maxPrice}`);
        builder = builder.or(`price_amount.is.null,and(${range.join(",")})`);
      }

      if (query.attributes) {
        const equalities = Object.fromEntries(
          Object.entries(query.attributes).filter(([, value]) => Boolean(value)),
        );
        if (Object.keys(equalities).length > 0) {
          builder = builder.contains("attributes", equalities);
        }
      }

      const { data, error } = await builder.limit(SCAN_LIMIT).returns<RowWithMedia[]>();
      if (error) throw new Error(`Supabase (search): ${error.message}`);

      if ((data?.length ?? 0) === SCAN_LIMIT) {
        console.warn(
          `[supabase] La búsqueda tocó el tope de ${SCAN_LIMIT} filas; los recuentos de faceta dejan de ser fiables.`,
        );
      }

      // Relevancia, rangos de atributo, orden, facetas y paginación: el mismo
      // núcleo que usa el adaptador de demostración.
      return searchIn(toDomain(data), query, categoriesById);
    },

    async bySlug(slug: string) {
      const { data, error } = await table().eq("slug", slug).limit(1).returns<RowWithMedia[]>();
      if (error) throw new Error(`Supabase (bySlug): ${error.message}`);
      return toDomain(data)[0] ?? null;
    },

    async byId(id: string) {
      const { data, error } = await table().eq("id", id).limit(1).returns<RowWithMedia[]>();
      if (error) throw new Error(`Supabase (byId): ${error.message}`);
      return toDomain(data)[0] ?? null;
    },

    async related(opportunity: Opportunity, limit = 3) {
      const { data, error } = await table()
        .eq("vertical", opportunity.vertical)
        .eq("status", "published")
        .eq("visibility", "public")
        .neq("id", opportunity.id)
        .limit(limit)
        .returns<RowWithMedia[]>();

      if (error) throw new Error(`Supabase (related): ${error.message}`);
      return toDomain(data);
    },

    async allPublished() {
      const { data, error } = await table()
        .eq("status", "published")
        .eq("visibility", "public")
        .limit(SCAN_LIMIT)
        .returns<RowWithMedia[]>();

      if (error) throw new Error(`Supabase (allPublished): ${error.message}`);
      return toDomain(data);
    },

    async hasDemoPublished() {
      const { data, error } = await client
        .from("opportunities")
        .select("id")
        .eq("is_demo", true)
        .eq("status", "published")
        .eq("visibility", "public")
        .limit(1);

      if (error) throw new Error(`Supabase (hasDemoPublished): ${error.message}`);
      return (data?.length ?? 0) > 0;
    },
  };
}
