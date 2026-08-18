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

export function getRepositories(): Repositories {
  if (!cached) {
    cached = getDataSource() === "supabase" ? createSupabaseRepositories() : createDemoRepositories();
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
