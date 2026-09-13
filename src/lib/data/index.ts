import { createDemoRepositories } from "./demo";
import type { Repositories } from "./repositories";
import { createSupabaseRepositories } from "./supabase";

/* ============================================================================
   PUNTO DE ENTRADA A LOS DATOS
   ----------------------------------------------------------------------------
   Las páginas y las server actions llaman a `getRepositories()`. Nunca importan
   un adaptador concreto, de modo que la fuente de datos es una decisión de
   configuración y no una dependencia esparcida por todo el código (§38).
   ========================================================================== */

export type DataSource = "demo" | "supabase";

export function getDataSource(): DataSource {
  return process.env.DCM_DATA_SOURCE === "supabase" ? "supabase" : "demo";
}

export function isDemoData(): boolean {
  return getDataSource() === "demo";
}

let cached: Repositories | undefined;

/**
 * Fuente compuesta.
 *
 * Supabase implementa hoy el catálogo y nada más. En lugar de exigirle las
 * seis interfaces de golpe, se superpone sobre el adaptador de memoria: lo que
 * sabe hacer lo hace él, y el resto —proveedores, leads, operaciones,
 * comisiones— sigue funcionando mientras se migra.
 *
 * Sin credenciales, `createSupabaseRepositories()` devuelve un objeto vacío y
 * todo cae a memoria. El sitio nunca se queda sin datos por una variable de
 * entorno mal puesta; simplemente sirve la semilla.
 */
export function getRepositories(): Repositories {
  if (!cached) {
    const demo = createDemoRepositories();
    cached =
      getDataSource() === "supabase" ? { ...demo, ...createSupabaseRepositories() } : demo;
  }
  return cached;
}

export type {
  Facets,
  LeadInput,
  OpportunityQuery,
  Page,
  ProviderApplicationInput,
  Repositories,
  SortOrder,
} from "./repositories";
