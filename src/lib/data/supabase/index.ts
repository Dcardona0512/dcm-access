import "server-only";

import {
  createAdminClient,
  createPublicClient,
  isSupabaseConfigured,
  isSupabaseWritable,
  SUPABASE_URL,
} from "@/lib/supabase/server";

import type { OpportunityRepository, Repositories } from "../repositories";
import { createSupabaseLeads } from "./leads";
import type { PublicUrl } from "./mappers";
import { createSupabaseOpportunities } from "./opportunities";

/* ============================================================================
   ADAPTADOR DE SUPABASE
   ----------------------------------------------------------------------------
   Devuelve solo las piezas del contrato que sabe implementar, y
   `getRepositories()` las superpone sobre el adaptador de memoria. Así conectar
   el catálogo no obliga a reimplementar de golpe proveedores, leads,
   operaciones y comisiones, que siguen funcionando mientras tanto.

   Las categorías se quedan en código a propósito: su `attributeSchema` decide
   qué campos tiene una ficha y cómo se pintan. Es código que parece dato, y
   moverlo a la base costaría un viaje de ida y vuelta por página sin ganar nada.

   El catálogo público se lee con la clave PUBLICABLE. Es tentador usar la
   secreta "porque es servidor", pero entonces una consulta mal escrita podría
   devolver una ficha reservada. Con la publicable, la política de RLS es la que
   decide, y un error de código no puede saltársela.
   ========================================================================== */

const publicUrl: PublicUrl = (bucket, path) =>
  `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

export function createSupabaseRepositories(): Partial<Repositories> {
  if (!isSupabaseConfigured()) {
    // Sin credenciales no se rompe el sitio: se cae al adaptador de memoria.
    console.warn(
      "[supabase] Faltan credenciales; el catálogo sigue sirviéndose desde la semilla en memoria.",
    );
    return {};
  }

  return {
    opportunities: createSupabaseOpportunities(createPublicClient(), publicUrl),

    /*
      Los leads van con la clave SECRETA, al revés que el catálogo, y no es una
      incoherencia: el catálogo es público y se apoya en RLS para no enseñar de
      más, mientras que un lead no debe ser legible por nadie desde el
      navegador. Su tabla no tiene ninguna política, así que la publicable no
      entra; esta sí, y solo existe en el servidor.

      Sin clave secreta se caen al adaptador de memoria, como antes. Es peor
      —se pierden al reiniciar— pero el formulario no se rompe, y el aviso de
      arriba ya dice que falta configuración.
    */
    ...(isSupabaseWritable() ? { leads: createSupabaseLeads(createAdminClient()) } : {}),
  };
}

/**
 * Catálogo con la clave secreta: ve TODAS las visibilidades y puede escribir.
 *
 * Solo lo usa el panel, y siempre después de que `getAdminSession()` haya
 * comprobado quién entra. La clave se salta RLS por completo, así que la
 * autorización tiene que estar resuelta antes de llegar aquí.
 */
export function createAdminOpportunities(): OpportunityRepository {
  if (!isSupabaseWritable()) {
    throw new Error("Falta SUPABASE_SECRET_KEY: el panel no puede leer ni escribir el catálogo.");
  }

  return createSupabaseOpportunities(createAdminClient(), publicUrl);
}
