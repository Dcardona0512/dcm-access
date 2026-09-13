import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

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

/**
 * Reintento con espera creciente.
 *
 * Durante `next build` se prerenderizan medio centenar de fichas y cada una
 * consulta la base varias veces. Un único "Gateway Timeout" pasajero en ese
 * bombardeo tumbaba el build entero, que es una forma absurda de fallar: el
 * dato existe, solo se tardó. Tres intentos cubren el pico sin esconder un
 * fallo real, porque un error de verdad falla las tres veces.
 */
async function withRetry<T>(label: string, run: () => Promise<T>): Promise<T> {
  let last: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      last = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
      }
    }
  }

  throw new Error(`Supabase (${label}): ${last instanceof Error ? last.message : String(last)}`);
}

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

  const bySlug = cache(async (slug: string): Promise<Opportunity | null> => {
    const rows = await withRetry("bySlug", async () => {
      const { data, error } = await table().eq("slug", slug).limit(1).returns<RowWithMedia[]>();
      if (error) throw new Error(error.message);
      return data;
    });
    return toDomain(rows)[0] ?? null;
  });

  /**
   * Todo lo publicado y público, cacheado por render.
   *
   * Durante el build lo piden las cinco `generateStaticParams` y, a través de
   * `related`, cada una de las cincuenta fichas. Con `cache()` es UNA consulta
   * reutilizada, en vez de cincuenta y cinco.
   */
  const allPublished = cache(async (): Promise<Opportunity[]> => {
    const rows = await withRetry("allPublished", async () => {
      const { data, error } = await table()
        .eq("status", "published")
        .eq("visibility", "public")
        .limit(SCAN_LIMIT)
        .returns<RowWithMedia[]>();
      if (error) throw new Error(error.message);
      return data;
    });
    return toDomain(rows);
  });

  const byId = cache(async (id: string): Promise<Opportunity | null> => {
    const rows = await withRetry("byId", async () => {
      const { data, error } = await table().eq("id", id).limit(1).returns<RowWithMedia[]>();
      if (error) throw new Error(error.message);
      return data;
    });
    return toDomain(rows)[0] ?? null;
  });

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

      const data = await withRetry("search", async () => {
        const result = await builder.limit(SCAN_LIMIT).returns<RowWithMedia[]>();
        if (result.error) throw new Error(result.error.message);
        return result.data;
      });

      if ((data?.length ?? 0) === SCAN_LIMIT) {
        console.warn(
          `[supabase] La búsqueda tocó el tope de ${SCAN_LIMIT} filas; los recuentos de faceta dejan de ser fiables.`,
        );
      }

      // Relevancia, rangos de atributo, orden, facetas y paginación: el mismo
      // núcleo que usa el adaptador de demostración.
      return searchIn(toDomain(data), query, categoriesById);
    },

    // `cache()` de React: `generateMetadata` y la página piden la MISMA ficha
    // en el mismo render. Sin esto, cada página costaba dos consultas.
    bySlug: bySlug,
    byId: byId,

    /**
     * Relacionadas es, literalmente, un filtro sobre lo ya publicado. Pedirlo
     * aparte era una consulta por ficha para recortar datos que ya teníamos.
     */
    async related(opportunity: Opportunity, limit = 3) {
      const all = await allPublished();
      return all
        .filter((item) => item.vertical === opportunity.vertical && item.id !== opportunity.id)
        .slice(0, limit);
    },

    allPublished,

    hasDemoPublished: cache(async () => {
      const data = await withRetry("hasDemoPublished", async () => {
        const result = await client
          .from("opportunities")
          .select("id")
          .eq("is_demo", true)
          .eq("status", "published")
          .eq("visibility", "public")
          .limit(1);
        if (result.error) throw new Error(result.error.message);
        return result.data;
      });
      return (data?.length ?? 0) > 0;
    }),
  };
}
