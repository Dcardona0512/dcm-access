/* ============================================================================
   ESTADO DEL FORMULARIO DE ACCESO
   ----------------------------------------------------------------------------
   Vive en su propio archivo, y no junto a las acciones, por una regla de Next
   que no perdona: un fichero marcado con `"use server"` SOLO puede exportar
   funciones asíncronas. Exportar además una constante —el estado inicial— hace
   que el módulo entero falle al evaluarse, con un 500 en la cara de quien
   envía el formulario y ni un aviso al construir.

   Lo aprendimos en producción.
   ========================================================================== */

export type AuthState = {
  readonly status: "idle" | "sent" | "error";
  readonly message?: string;
  readonly email?: string;
};

export const initialAuthState: AuthState = { status: "idle" };
