/* ============================================================================
   VOCABULARIO DEL PANEL
   ----------------------------------------------------------------------------
   Lo que comparten el servidor y el navegador: el corte de días, la forma del
   resumen y el nombre de cada vista.

   Vive aparte de `supabase/panel.ts` a propósito. Aquel módulo es `server-only`
   y trae consigo el cliente de Supabase con la clave secreta; en cuanto el
   resumen pasó a ser un componente de cliente —una ventana que se abre—, ese
   import habría arrastrado la clave al paquete del navegador. El build lo paró
   en seco, que es exactamente para lo que está el marcador.

   Aquí no puede entrar nada que toque la red ni las credenciales.
   ========================================================================== */

/** A partir de aquí una ficha lleva demasiado tiempo sin moverse. */
export const DIAS_PARA_VETERANA = 15;

export type ResumenPublicaciones = {
  readonly disponibles: number;
  readonly veteranas: number;
  readonly vendidas: number;
};

/** Filtro de la lista del panel, y también lo que cuenta cada número. */
export type VistaPanel = "disponibles" | "veteranas" | "vendidas";
