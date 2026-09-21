/**
 * Estado del alta de partner.
 *
 * Separado de las acciones por la misma razón que el de acceso: un fichero
 * `"use server"` solo puede exportar funciones asíncronas, y una constante
 * exportada ahí dentro tumba el módulo al evaluarse.
 */
export type PartnerState = {
  readonly status: "idle" | "error";
  readonly message?: string;
};

export const initialPartnerState: PartnerState = { status: "idle" };
