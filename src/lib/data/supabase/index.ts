import type { Repositories } from "../repositories";

/* ============================================================================
   ADAPTADOR SUPABASE — COSTURA, TODAVÍA NO IMPLEMENTADO
   ----------------------------------------------------------------------------
   Este archivo existe para que el sitio no tenga que cambiar cuando llegue el
   backend real. El contrato ya está fijado en `../repositories.ts`; lo único
   que falta aquí es escribir las consultas.

   Para conectarlo:

     1. npm install @supabase/supabase-js @supabase/ssr
     2. Crear `src/lib/supabase/{client,server}.ts` siguiendo el patrón que ya
        usan los proyectos hermanos del repositorio.
     3. Definir las tablas espejo del modelo de `@/lib/domain/types` y generar
        `src/lib/database.types.ts` con la CLI de Supabase.
     4. Implementar aquí los seis repositorios contra esas tablas.
     5. Poner `DCM_DATA_SOURCE=supabase` en el entorno.

   Nada más cambia: ni una página, ni un componente, ni una server action.

   Sobre autorización: el modelo de roles de `@/lib/auth/roles.ts` está pensado
   para traducirse directamente a políticas RLS — un rol por política, con la
   misma matriz de permisos que ya aplica el CRM.
   ========================================================================== */

const NOT_CONFIGURED =
  "El adaptador de Supabase todavía no está implementado. " +
  "Use DCM_DATA_SOURCE=demo o implemente src/lib/data/supabase/index.ts.";

export function createSupabaseRepositories(): Repositories {
  throw new Error(NOT_CONFIGURED);
}
