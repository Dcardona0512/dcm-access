import "server-only";

import {
  DIAS_PARA_VETERANA,
  type ResumenPublicaciones,
  type VistaPanel,
} from "@/lib/data/panel-shared";
import type { Opportunity, OpportunityStatus } from "@/lib/domain/types";
import { createAdminClient, isSupabaseWritable } from "@/lib/supabase/server";

import { rowToOpportunity, type OpportunityRow, type MediaRow } from "./mappers";

/* ============================================================================
   LO QUE EL PANEL NECESITA Y EL CATÁLOGO NO
   ----------------------------------------------------------------------------
   El catálogo público solo sabe de fichas publicadas: `search()` descarta
   cualquier otro estado antes de filtrar nada. Es lo correcto para el sitio y
   es justamente lo que no sirve aquí, porque una ficha vendida tiene que
   seguir viéndose desde el panel —si no, venderla la haría desaparecer y no
   habría forma de reabrirla.

   Por eso estas consultas van directas contra la tabla, con la clave secreta,
   en lugar de pasar por el repositorio compartido.

   Las de demostración quedan fuera de todas las cuentas. Son dieciséis contra
   una real: incluirlas convertiría el resumen en un número que no habla del
   negocio de nadie.
   ========================================================================== */

function fechaDeCorte(): string {
  return new Date(Date.now() - DIAS_PARA_VETERANA * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Los tres números de la barra lateral.
 *
 * Se piden como `count` con `head`, así que el servidor devuelve el número y
 * ni una fila: el resumen sale en la barra de TODAS las pantallas del panel y
 * traerse el inventario entero tres veces por navegación sería absurdo.
 *
 * Devuelve `null` —y la barra no pinta nada— si falta la clave o si la
 * consulta falla. Un panel sin resumen sigue sirviendo; un panel que revienta
 * entero porque un contador no respondió, no.
 */
export async function resumenPublicaciones(): Promise<ResumenPublicaciones | null> {
  if (!isSupabaseWritable()) return null;

  const db = createAdminClient();
  const propias = () =>
    db.from("opportunities").select("id", { count: "exact", head: true }).eq("is_demo", false);

  try {
    const [disponibles, veteranas, vendidas] = await Promise.all([
      propias().eq("status", "published"),
      propias().eq("status", "published").lt("published_at", fechaDeCorte()),
      propias().eq("status", "closed"),
    ]);

    if (disponibles.error || veteranas.error || vendidas.error) return null;

    return {
      disponibles: disponibles.count ?? 0,
      veteranas: veteranas.count ?? 0,
      vendidas: vendidas.count ?? 0,
    };
  } catch {
    return null;
  }
}

type RowWithMedia = OpportunityRow & { opportunity_media: MediaRow[] | null };

/** El inventario propio que corresponde a una de las tres vistas. */
export async function publicacionesDelPanel(vista: VistaPanel): Promise<readonly Opportunity[]> {
  if (!isSupabaseWritable()) return [];

  const db = createAdminClient();
  let query = db
    .from("opportunities")
    .select("*, opportunity_media(*)")
    .eq("is_demo", false)
    .order("published_at", { ascending: false });

  if (vista === "vendidas") query = query.eq("status", "closed");
  else if (vista === "veteranas")
    query = query.eq("status", "published").lt("published_at", fechaDeCorte());
  else query = query.eq("status", "published");

  const { data, error } = await query;
  if (error) throw new Error(`Supabase (panel): ${error.message}`);

  return (data as RowWithMedia[] | null ?? []).map((row) =>
    rowToOpportunity(
      row,
      row.opportunity_media ?? [],
      (bucket, path) =>
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`,
    ),
  );
}

/**
 * Cambia el estado de una ficha.
 *
 * `closed` es «vendida» y `published` es «vuelve al catálogo». No se borra
 * nada: una ficha vendida es el historial del negocio, y además puede volver
 * si la venta se cae.
 */
export async function cambiarEstado(id: string, status: OpportunityStatus): Promise<void> {
  if (!isSupabaseWritable()) {
    throw new Error("Falta SUPABASE_SECRET_KEY: no se puede cambiar el estado.");
  }

  const { error } = await createAdminClient()
    .from("opportunities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    // Nunca sobre la semilla: son ejemplos, no inventario.
    .eq("is_demo", false);

  if (error) throw new Error(`Supabase (cambiarEstado): ${error.message}`);
}
